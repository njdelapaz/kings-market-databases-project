import { NextResponse } from 'next/server';
import db from '@/lib/db';

// Returns a 400 response with the given message string.
function badRequest(message) {
  return NextResponse.json({ success: false, message }, { status: 400 });
}

// Writes a row to UpdateInventory to audit a storekeeper action; falls back to the old column set if the Details column doesn't exist yet.
async function logInventoryUpdate(queryable, { itemId, storekeeperEmail, action, details }) {
  if (!storekeeperEmail) return;
  try {
    await queryable.query(
      `INSERT INTO UpdateInventory (ItemID, StorekeeperEmail, Action, Details)
       VALUES (?, ?, ?, ?)`,
      [itemId, storekeeperEmail, action, details || null]
    );
  } catch (err) {
    // Backward compatibility for DBs that have not added UpdateInventory.Details yet.
    if (err?.code === 'ER_BAD_FIELD_ERROR') {
      await queryable.query(
        `INSERT INTO UpdateInventory (ItemID, StorekeeperEmail, Action)
         VALUES (?, ?, ?)`,
        [itemId, storekeeperEmail, action]
      );
      return;
    }
    throw err;
  }
}

// Updates any combination of name, category, quantity, price, or IsSelling for an item in a transaction; logs the change type (Adjust/Stop/Restock) to UpdateInventory.
export async function PATCH(request, { params }) {
  let connection;
  try {
    const resolvedParams = await params;
    const itemId = Number(resolvedParams?.itemId);
    if (!Number.isInteger(itemId) || itemId <= 0) {
      return badRequest('Invalid item id.');
    }

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const storekeeperEmail = String(
      request.headers.get('x-user-email') || body?.storekeeperEmail || searchParams.get('storekeeperEmail') || ''
    ).trim();
    const updates = [];
    const values = [];

    const hasName = body?.name !== undefined;
    const hasCategory = body?.category !== undefined;

    if (body?.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) {
        return badRequest('Name cannot be empty.');
      }
      updates.push('Name = ?');
      values.push(name);
    }

    if (body?.quantity !== undefined) {
      const quantity = Number(body.quantity);
      if (!Number.isFinite(quantity) || quantity < 0) {
        return badRequest('Quantity must be a non-negative number.');
      }
      updates.push('Quantity = ?');
      values.push(quantity);
    }

    if (body?.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price < 0) {
        return badRequest('Price must be a non-negative number.');
      }
      updates.push('Price = ?');
      values.push(price);
    }

    if (body?.isSelling !== undefined) {
      updates.push('IsSelling = ?');
      values.push(body.isSelling ? 1 : 0);
    }

    if (!updates.length) {
      return badRequest('No valid fields provided for update.');
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [existingRows] = await connection.query(
      `SELECT i.ItemID, i.Name, i.Quantity, i.Price, i.IsSelling, c.Category
       FROM Item_R1 i
       LEFT JOIN Item_R2 c ON c.Name = i.Name
       WHERE i.ItemID = ?`,
      [itemId]
    );
    if (!existingRows.length) {
      await connection.rollback();
      return NextResponse.json({ success: false, message: 'Item not found.' }, { status: 404 });
    }

    values.push(itemId);
    await connection.query(`UPDATE Item_R1 SET ${updates.join(', ')} WHERE ItemID = ?`, values);

    if (hasName || hasCategory) {
      const oldName = existingRows[0].Name;
      const newName = hasName ? String(body.name).trim() : oldName;
      const category = hasCategory ? String(body.category).trim() : null;

      if (hasCategory && category) {
        await connection.query(
          `INSERT INTO Item_R2 (Name, Category)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE Category = VALUES(Category)`,
          [newName, category]
        );
      }

      if (hasName && oldName !== newName) {
        await connection.query('DELETE FROM Item_R2 WHERE Name = ?', [oldName]);
      }
    }

    if (storekeeperEmail) {
      const changedFields = [];
      const previousName = String(existingRows[0].Name ?? '');
      const previousCategory = String(existingRows[0].Category ?? '');
      const previousQuantity = Number(existingRows[0].Quantity);
      const previousPrice = Number(existingRows[0].Price);
      const nextName = hasName ? String(body.name).trim() : previousName;
      const nextCategory = hasCategory ? String(body.category ?? '').trim() : previousCategory;
      const nextQuantity =
        body?.quantity !== undefined ? Number(body.quantity) : previousQuantity;
      const nextPrice = body?.price !== undefined ? Number(body.price) : previousPrice;
      if (hasName && nextName !== previousName) changedFields.push('name');
      if (hasCategory && nextCategory !== previousCategory) changedFields.push('category');
      if (body?.quantity !== undefined && nextQuantity !== previousQuantity) changedFields.push('quantity');
      if (body?.price !== undefined && nextPrice !== previousPrice) changedFields.push('price');

      const previousIsSelling = Number(existingRows[0].IsSelling) === 1;
      const nextIsSelling =
        body?.isSelling === undefined ? previousIsSelling : Boolean(body.isSelling);
      let action = 'Adjust';
      let details = changedFields.length
        ? `Updated ${changedFields.join(', ')}`
        : 'Updated item details';
      if (previousIsSelling && !nextIsSelling) {
        action = 'Stop';
        details = 'Marked as unavailable for sale';
      } else if (!previousIsSelling && nextIsSelling) {
        action = 'Restock';
        details = 'Marked as available for sale';
      }
      await logInventoryUpdate(connection, { itemId, storekeeperEmail, action, details });
    }

    await connection.commit();
    return NextResponse.json({ success: true, message: 'Item updated successfully.' });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    if (error?.code === 'ER_DUP_ENTRY') {
      return badRequest('Updated value conflicts with an existing record.');
    }

    console.error('Failed to update admin item:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update item.' },
      { status: 500 }
    );
  } finally {
    connection?.release();
  }
}

// Soft-deletes an item by setting IsSelling=0 (keeps it in the DB) and logs a Stop action to UpdateInventory.
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const itemId = Number(resolvedParams?.itemId);
    const { searchParams } = new URL(request.url);
    const storekeeperEmail = String(
      request.headers.get('x-user-email') || searchParams.get('storekeeperEmail') || ''
    ).trim();
    if (!Number.isInteger(itemId) || itemId <= 0) {
      return badRequest('Invalid item id.');
    }

    const [result] = await db.query(
      'UPDATE Item_R1 SET IsSelling = 0 WHERE ItemID = ?',
      [itemId]
    );

    if (!result.affectedRows) {
      return NextResponse.json({ success: false, message: 'Item not found.' }, { status: 404 });
    }

    if (storekeeperEmail) {
      await logInventoryUpdate(db, {
        itemId,
        storekeeperEmail,
        action: 'Stop',
        details: 'Marked as unavailable for sale',
      });
    }

    return NextResponse.json({ success: true, message: 'Item removed from sale.' });
  } catch (error) {
    console.error('Failed to soft-disable admin item:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to remove item from sale.' },
      { status: 500 }
    );
  }
}
