import { NextResponse } from 'next/server';
import db from '@/lib/db';

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

export async function GET(request) {
    const role = request.headers.get('x-user-role');

    if (role !== 'storekeeper') {
        return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    try {
        const [rows] = await db.query(
            `SELECT ir.ID, ir.CustomerEmail, ir.Name, ir.Description
             FROM ItemRequest ir
             ORDER BY ir.ID DESC`
        );
        return NextResponse.json({ success: true, requests: rows });
    } catch (err) {
        console.error('ItemRequest GET error:', err);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
