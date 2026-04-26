import { NextResponse } from 'next/server';
import db from '@/lib/db';

// PATCH /api/item-requests/[id] — approve or reject a request (storekeeper only)
export async function PATCH(request, { params }) {
    const role           = request.headers.get('x-user-role');
    const storekeeperEmail = request.headers.get('x-user-email');

    if (role !== 'storekeeper') {
        return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const { id } = await params;
    const requestId = Number(id);
    if (!Number.isInteger(requestId) || requestId <= 0) {
        return NextResponse.json({ error: 'Invalid request ID.' }, { status: 400 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const { action } = body;
    if (action !== 'approve' && action !== 'reject') {
        return NextResponse.json({ error: 'action must be "approve" or "reject".' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    try {
        const [result] = await db.query(
            `UPDATE ItemRequest
             SET Status = ?, ReviewedBy = ?, ReviewedAt = NOW()
             WHERE ID = ?`,
            [newStatus, storekeeperEmail, requestId]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Item request not found.' }, { status: 404 });
        }

        const [[updated]] = await db.query(
            `SELECT ID, CustomerEmail, Name, Description, Status, ReviewedBy, ReviewedAt
             FROM ItemRequest WHERE ID = ?`,
            [requestId]
        );

        return NextResponse.json({ success: true, request: updated });
    } catch (err) {
        console.error('ItemRequest PATCH error:', err);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

// DELETE /api/item-requests/[id] — permanently delete a request (storekeeper only)
export async function DELETE(request, { params }) {
    const role = request.headers.get('x-user-role');

    if (role !== 'storekeeper') {
        return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const { id } = await params;
    const requestId = Number(id);
    if (!Number.isInteger(requestId) || requestId <= 0) {
        return NextResponse.json({ error: 'Invalid request ID.' }, { status: 400 });
    }

    try {
        const [result] = await db.query(
            `DELETE FROM ItemRequest WHERE ID = ?`,
            [requestId]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Item request not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('ItemRequest DELETE error:', err);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
