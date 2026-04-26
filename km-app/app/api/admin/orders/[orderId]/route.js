import { NextResponse } from 'next/server';
import db from '@/lib/db';

const ALLOWED_STATUSES = new Set([
  'pending',
  'processing',
  'ready_for_pickup',
  'picked_up',
  'cancelled',
]);

function badRequest(message) {
  return NextResponse.json({ success: false, message }, { status: 400 });
}

export async function PATCH(request, { params }) {
  try {
    const role = request.headers.get('x-user-role');
    if (role && role !== 'storekeeper') {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    const resolvedParams = await params;
    const orderId = Number(resolvedParams?.orderId);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return badRequest('Invalid order id.');
    }

    const body = await request.json();
    const status = String(body?.status || '').trim();
    const cancelReason = String(body?.cancelReason || '').trim();

    if (!ALLOWED_STATUSES.has(status)) {
      return badRequest('Invalid status value.');
    }
    if (status === 'cancelled' && !cancelReason) {
      return badRequest('Cancellation reason is required when cancelling an order.');
    }

    const [result] = await db.query(
      `UPDATE CustomerOrder
       SET Status = ?,
           CancelReason = ?,
           StatusUpdatedAt = NOW()
       WHERE OrderID = ?`,
      [status, status === 'cancelled' ? cancelReason : null, orderId]
    );

    if (!result.affectedRows) {
      return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: status === 'cancelled' ? 'Order cancelled.' : 'Order status updated.',
    });
  } catch (error) {
    if (error?.code === 'ER_BAD_FIELD_ERROR') {
      return NextResponse.json(
        {
          success: false,
          message: 'Order status columns are missing in DB. Run migration 013_storekeeper_order_statuses.sql.',
        },
        { status: 409 }
      );
    }
    console.error('Failed to update order status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update order status.' },
      { status: 500 }
    );
  }
}
