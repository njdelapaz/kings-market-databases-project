import { NextResponse } from 'next/server';
import db from '@/lib/db';

// Inserts a new item request from the logged-in customer with a name and optional description.
export async function POST(request) {
    const customerEmail = request.headers.get('x-user-email');

    const { name, description } = await request.json();

    if (!name || !name.trim()) {
        return NextResponse.json({ message: 'Item name is required.' }, { status: 400 });
    }

    try {
        await db.query(
            `INSERT INTO ItemRequest (CustomerEmail, Name, Description) VALUES (?, ?, ?)`,
            [customerEmail, name.trim(), description?.trim() ?? null]
        );
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('ItemRequest POST error:', err);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

// Returns all item requests for storekeeper review, optionally filtered by status and sorted by date or name; storekeeper only.
export async function GET(request) {
    const role = request.headers.get('x-user-role');

    if (role !== 'storekeeper') {
        return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const statusFilter = searchParams.get('status') || '';
        const sortBy       = searchParams.get('sort')   || 'date';

        const VALID_STATUSES = ['pending', 'approved', 'rejected'];
        const whereClauses = [];
        const params = [];

        if (statusFilter && VALID_STATUSES.includes(statusFilter)) {
            whereClauses.push('ir.Status = ?');
            params.push(statusFilter);
        }

        const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const orderBy = sortBy === 'name'
            ? 'ir.Name ASC, ir.ID DESC'
            : 'ir.ID DESC'; // default: newest first

        const [rows] = await db.query(
            `SELECT ir.ID, ir.CustomerEmail, ir.Name, ir.Description,
                    ir.Status, ir.ReviewedBy, ir.ReviewedAt
             FROM ItemRequest ir
             ${where}
             ORDER BY ${orderBy}`,
            params
        );
        return NextResponse.json({ success: true, requests: rows });
    } catch (err) {
        console.error('ItemRequest GET error:', err);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
