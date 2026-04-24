import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { withStockStatus } from '@/lib/catalog';

// GET /api/items/:id
// :id may be either a numeric ItemID or a SKU string (e.g. "KM-000001").
// Customer endpoint: IsSelling = 1 items only. Hidden items must go through
// the admin endpoint so customers can't stumble onto inactive products.
export async function GET(_request, { params }) {
    try {
        const resolved = await params;
        const raw = String(resolved?.id ?? '').trim();
        if (!raw) {
            return NextResponse.json({ success: false, message: 'Missing id.' }, { status: 400 });
        }

        const numeric = Number(raw);
        const isNumericId = Number.isInteger(numeric) && numeric > 0;

        const [rows] = await db.query(
            `SELECT i.ItemID, i.SKU, i.Name, i.Quantity, i.Price, i.IsSelling, c.Category
             FROM Item_R1 i
             LEFT JOIN Item_R2 c ON c.Name = i.Name
             WHERE i.IsSelling = 1
               AND (${isNumericId ? 'i.ItemID = ?' : 'i.SKU = ?'})
             LIMIT 1`,
            [isNumericId ? numeric : raw]
        );

        if (!rows.length) {
            return NextResponse.json({ success: false, message: 'Item not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, item: withStockStatus(rows[0]) });
    } catch (err) {
        console.error('Item detail GET error:', err);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
