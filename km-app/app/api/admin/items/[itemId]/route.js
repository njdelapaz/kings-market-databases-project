import { NextResponse } from 'next/server';
import db from '@/lib/db';

function badRequest(message) {
  return NextResponse.json({ success: false, message }, { status: 400 });
}

export async function PATCH(request, { params }) {
  let connection;
  try {
    const itemId = Number(params?.itemId);
    if (!Number.isInteger(itemId) || itemId <= 0) {
      return badRequest('Invalid item id.');
    }

    const body = await request.json();
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
      'SELECT ItemID, Name FROM Item_R1 WHERE ItemID = ?',
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

export async function DELETE(request, { params }) {
  try {
    const itemId = Number(params?.itemId);
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

    return NextResponse.json({ success: true, message: 'Item removed from sale.' });
  } catch (error) {
    console.error('Failed to soft-disable admin item:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to remove item from sale.' },
      { status: 500 }
    );
  }
}
