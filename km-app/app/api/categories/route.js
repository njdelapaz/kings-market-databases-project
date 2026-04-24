import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/categories
// Returns the set of categories that currently have at least one
// customer-visible item (IsSelling = 1), plus a count for each.
// Used to populate the filter dropdown on the customer catalog page.
export async function GET() {
    try {
        const [rows] = await db.query(
            `SELECT c.Category AS name, COUNT(*) AS itemCount
             FROM Item_R2 c
             INNER JOIN Item_R1 i ON i.Name = c.Name
             WHERE i.IsSelling = 1
             GROUP BY c.Category
             ORDER BY c.Category ASC`
        );

        const categories = rows.map(r => ({
            name: r.name,
            itemCount: Number(r.itemCount) || 0,
        }));

        return NextResponse.json({ success: true, categories });
    } catch (err) {
        console.error('Categories GET error:', err);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
