import { NextResponse } from 'next/server';
import db from '@/lib/db';

function badRequest(message) {
  return NextResponse.json({ success: false, message }, { status: 400 });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const search = searchParams.get('search')?.trim() || '';

    const whereClauses = [];
    const params = [];

    if (!includeInactive) {
      whereClauses.push('i.IsSelling = 1');
    }

    if (search) {
      whereClauses.push('(i.Name LIKE ? OR i.SKU LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [rows] = await db.query(
      `SELECT i.ItemID, i.SKU, i.Name, i.Quantity, i.Price, i.IsSelling, c.Category
       FROM Item_R1 i
       LEFT JOIN Item_R2 c ON c.Name = i.Name
       ${whereSql}
       ORDER BY i.Name ASC`,
      params
    );

    return NextResponse.json({ success: true, items: rows });
  } catch (error) {
    console.error('Failed to fetch admin items:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch inventory items.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  let connection;
  try {
    const body = await request.json();
    const sku = body?.sku?.trim();
    const name = body?.name?.trim();
    const category = body?.category?.trim() || null;
    const quantity = Number(body?.quantity);
    const price = Number(body?.price);
    const isSelling = body?.isSelling === undefined ? 1 : body.isSelling ? 1 : 0;

    if (!sku || !name) {
      return badRequest('SKU and name are required.');
    }
    if (!Number.isFinite(quantity) || quantity < 0) {
      return badRequest('Quantity must be a non-negative number.');
    }
    if (!Number.isFinite(price) || price < 0) {
      return badRequest('Price must be a non-negative number.');
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [insertResult] = await connection.query(
      `INSERT INTO Item_R1 (SKU, Name, Quantity, Price, IsSelling)
       VALUES (?, ?, ?, ?, ?)`,
      [sku, name, quantity, price, isSelling]
    );

    if (category) {
      await connection.query(
        `INSERT INTO Item_R2 (Name, Category)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE Category = VALUES(Category)`,
        [name, category]
      );
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: 'Item created successfully.',
      itemId: insertResult.insertId,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    if (error?.code === 'ER_DUP_ENTRY') {
      return badRequest('SKU must be unique.');
    }

    console.error('Failed to create admin item:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create item.' },
      { status: 500 }
    );
  } finally {
    connection?.release();
  }
}
