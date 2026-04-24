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
  const headers = ['ItemID', 'SKU', 'Name', 'Category', 'Quantity', 'Price', 'IsSelling'];
  const lines = [headers.join(',')];

  rows.forEach((row) => {
    lines.push([
      row.ItemID,
      row.SKU,
      row.Name,
      row.Category,
      row.Quantity,
      row.Price,
      row.IsSelling,
    ].map(escapeCsv).join(','));
  });

  return lines.join('\n');
}

async function logOperation({ storekeeperEmail, format, sourceFilename, notes }) {
  await db.query(
    `INSERT INTO AdminDataOperation
      (StorekeeperEmail, OperationType, EntityType, DataFormat, Status, SourceFilename, RequestedAt, CompletedAt, Notes)
     VALUES (?, 'export', 'inventory', ?, 'success', ?, NOW(), NOW(), ?)`,
    [storekeeperEmail, format, sourceFilename, notes]
  );
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = String(searchParams.get('format') || 'json').toLowerCase();
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const storekeeperEmail = String(searchParams.get('storekeeperEmail') || '').trim();

    if (!storekeeperEmail) {
      return NextResponse.json({ success: false, message: 'storekeeperEmail is required.' }, { status: 400 });
    }
    if (!['csv', 'json'].includes(format)) {
      return NextResponse.json({ success: false, message: 'format must be csv or json.' }, { status: 400 });
    }

    const whereSql = includeInactive ? '' : 'WHERE i.IsSelling = 1';
    const [rows] = await db.query(
      `SELECT i.ItemID, i.SKU, i.Name, c.Category, i.Quantity, i.Price, i.IsSelling
       FROM Item_R1 i
       LEFT JOIN Item_R2 c ON c.Name = i.Name
       ${whereSql}
       ORDER BY i.Name ASC`
    );

    const filename = `inventory_export_${new Date().toISOString().slice(0, 10)}.${format}`;

    await logOperation({
      storekeeperEmail,
      format,
      sourceFilename: filename,
      notes: `Exported ${rows.length} inventory rows.`,
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
    console.error('Inventory export failed:', error);
    return NextResponse.json(
      { success: false, message: 'Inventory export failed.' },
      { status: 500 }
    );
  }
}
