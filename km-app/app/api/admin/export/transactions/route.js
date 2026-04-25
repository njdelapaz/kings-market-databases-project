import { NextResponse } from 'next/server';
import db from '@/lib/db';

function escapeCsv(value) {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(rows) {
  const headers = [
    'OrderID',
    'CustomerEmail',
    'Timestamp',
    'ItemID',
    'ItemName',
    'Quantity',
    'UnitPrice',
    'LineTotal',
  ];
  const lines = [headers.join(',')];

  rows.forEach((row) => {
    lines.push([
      row.OrderID,
      row.CustomerEmail,
      row.Timestamp,
      row.ItemID,
      row.ItemName,
      row.Quantity,
      row.UnitPrice,
      row.LineTotal,
    ].map(escapeCsv).join(','));
  });

  return lines.join('\n');
}

async function logOperation({ storekeeperEmail, format, sourceFilename, notes }) {
  await db.query(
    `INSERT INTO AdminDataOperation
      (StorekeeperEmail, OperationType, EntityType, DataFormat, Status, SourceFilename, RequestedAt, CompletedAt, Notes)
     VALUES (?, 'export', 'transactions', ?, 'success', ?, NOW(), NOW(), ?)`,
    [storekeeperEmail, format, sourceFilename, notes]
  );
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = String(searchParams.get('format') || 'json').toLowerCase();
    const storekeeperEmail = request.headers.get('x-user-email');

    if (!storekeeperEmail) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
    }
    if (!['csv', 'json'].includes(format)) {
      return NextResponse.json({ success: false, message: 'format must be csv or json.' }, { status: 400 });
    }

    const [rows] = await db.query(
      `SELECT
          co.OrderID,
          co.CustomerEmail,
          co.Timestamp,
          oi.ItemID,
          i.Name AS ItemName,
          oi.Quantity,
          i.Price AS UnitPrice,
          (oi.Quantity * i.Price) AS LineTotal
       FROM CustomerOrder co
       JOIN OrderItem oi
         ON oi.OrderID = co.OrderID
        AND oi.CustomerEmail = co.CustomerEmail
       JOIN Item_R1 i ON i.ItemID = oi.ItemID
       ORDER BY co.Timestamp DESC, co.OrderID DESC`
    );

    const filename = `transactions_export_${new Date().toISOString().slice(0, 10)}.${format}`;

    await logOperation({
      storekeeperEmail,
      format,
      sourceFilename: filename,
      notes: `Exported ${rows.length} transaction rows.`,
    });

    if (format === 'csv') {
      const csv = toCsv(rows);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      format: 'json',
      filename,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error('Transaction export failed:', error);
    return NextResponse.json(
      { success: false, message: 'Transaction export failed.' },
      { status: 500 }
    );
  }
}
