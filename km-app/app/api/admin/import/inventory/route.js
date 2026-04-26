import { NextResponse } from 'next/server';
import db from '@/lib/db';

function parseItemIdFromSku(sku) {
  const match = /^KM-(\d+)$/.exec(String(sku || '').trim());
  if (!match) return null;
  const itemId = Number(match[1]);
  return Number.isInteger(itemId) && itemId > 0 ? itemId : null;
}

function parseCsv(content) {
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const rows = [];

  for (let i = 1; i < lines.length; i += 1) {
    const values = lines[i].split(',').map((v) => v.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    rows.push(row);
  }

  return rows;
}

function normalizeRows(format, content) {
  if (format === 'json') {
    if (!Array.isArray(content)) return [];
    return content;
  }

  if (typeof content !== 'string') return [];
  return parseCsv(content);
}

function validateRows(rows) {
  const normalized = [];
  const errors = [];

  rows.forEach((row, idx) => {
    const rowNumber = idx + 1;
    const sku = String(row.sku ?? row.SKU ?? '').trim();
    const name = String(row.name ?? row.Name ?? '').trim();
    const category = String(row.category ?? row.Category ?? '').trim();
    const quantity = Number(row.quantity ?? row.Quantity);
    const price = Number(row.price ?? row.Price);
    const rawIsSelling = row.isSelling ?? row.IsSelling ?? 1;
    const isSelling = rawIsSelling === 0 || rawIsSelling === '0' || rawIsSelling === false ? 0 : 1;

    if (!sku) errors.push({ row: rowNumber, message: 'SKU is required.' });
    if (!name) errors.push({ row: rowNumber, message: 'Name is required.' });
    if (!Number.isFinite(quantity) || quantity < 0) {
      errors.push({ row: rowNumber, message: 'Quantity must be a non-negative number.' });
    }
    if (!Number.isFinite(price) || price < 0) {
      errors.push({ row: rowNumber, message: 'Price must be a non-negative number.' });
    }

    normalized.push({ sku, name, category, quantity, price, isSelling });
  });

  return { normalized, errors };
}

async function createOperation(connection, details) {
  const [result] = await connection.query(
    `INSERT INTO AdminDataOperation
      (StorekeeperEmail, OperationType, EntityType, DataFormat, Status, SourceFilename, RequestedAt, Notes)
     VALUES (?, 'import', 'inventory', ?, 'pending', ?, NOW(), ?)`,
    [details.storekeeperEmail, details.dataFormat, details.sourceFilename, details.notes]
  );
  return result.insertId;
}

async function finalizeOperation(connection, operationId, status, notes) {
  await connection.query(
    `UPDATE AdminDataOperation
     SET Status = ?, CompletedAt = NOW(), Notes = ?
     WHERE OperationID = ?`,
    [status, notes, operationId]
  );
}

export async function POST(request) {
  let connection;
  let operationId = null;

  try {
    const storekeeperEmail = request.headers.get('x-user-email');
    if (!storekeeperEmail) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const format = String(body?.format || '').toLowerCase();
    const content = body?.content;
    const sourceFilename = body?.filename ? String(body.filename).trim() : null;
    const storekeeperEmail = String(body?.storekeeperEmail || request.headers.get('x-user-email') || '').trim();
    const role = request.headers.get('x-user-role');

    if (role && role !== 'storekeeper') {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }
    if (!storekeeperEmail) {
      return NextResponse.json({ success: false, message: 'storekeeperEmail is required.' }, { status: 400 });
    }
    if (!['csv', 'json'].includes(format)) {
      return NextResponse.json({ success: false, message: 'format must be csv or json.' }, { status: 400 });
    }

    const parsedRows = normalizeRows(format, content);
    if (!parsedRows.length) {
      return NextResponse.json({ success: false, message: 'No import rows found.' }, { status: 400 });
    }

    const { normalized, errors } = validateRows(parsedRows);
    if (errors.length) {
      return NextResponse.json(
        { success: false, message: 'Validation failed.', errors },
        { status: 400 }
      );
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    operationId = await createOperation(connection, {
      storekeeperEmail,
      dataFormat: format,
      sourceFilename,
      notes: `Import started for ${normalized.length} rows.`,
    });

    for (const row of normalized) {
      const categoryValue = row.category || 'Uncategorized';
      await connection.query(
        `INSERT INTO Item_R2 (Name, Category)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE Category = VALUES(Category)`,
        [row.name, categoryValue]
      );

      try {
        await connection.query(
          `INSERT INTO Item_R1 (SKU, Name, Quantity, Price, IsSelling)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             Name = VALUES(Name),
             Quantity = VALUES(Quantity),
             Price = VALUES(Price),
             IsSelling = VALUES(IsSelling)`,
          [row.sku, row.name, row.quantity, row.price, row.isSelling]
        );
      } catch (error) {
        // Some schemas define SKU as generated from ItemID. In that case,
        // write by ItemID and let DB derive SKU automatically.
        if (error?.code !== 'ER_NON_DEFAULT_VALUE_FOR_GENERATED_COLUMN') {
          throw error;
        }

        const itemId = parseItemIdFromSku(row.sku);
        if (!itemId) {
          throw new Error(`SKU ${row.sku} is invalid for generated-SKU schema.`);
        }

        await connection.query(
          `INSERT INTO Item_R1 (ItemID, Name, Quantity, Price, IsSelling)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             Name = VALUES(Name),
             Quantity = VALUES(Quantity),
             Price = VALUES(Price),
             IsSelling = VALUES(IsSelling)`,
          [itemId, row.name, row.quantity, row.price, row.isSelling]
        );
      }

    }

    await finalizeOperation(
      connection,
      operationId,
      'success',
      `Import completed successfully. Rows processed: ${normalized.length}.`
    );

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: 'Inventory import completed.',
      operationId,
      rowsProcessed: normalized.length,
    });
  } catch (error) {
    if (connection) {
      try {
        if (operationId) {
          await finalizeOperation(connection, operationId, 'failed', `Import failed: ${error.message}`);
        }
        await connection.rollback();
      } catch (innerError) {
        console.error('Import rollback/finalize failure:', innerError);
      }
    }

    console.error('Inventory import failed:', error);
    return NextResponse.json(
      { success: false, message: 'Inventory import failed.' },
      { status: 500 }
    );
  } finally {
    connection?.release();
  }
}
