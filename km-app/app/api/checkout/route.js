import { NextResponse } from 'next/server';
import db from '@/lib/db';

// Advanced SQL integration:
// - populate TempCart from UI cart payload
// - call place_order_from_tempcart stored procedure
// - rely on before_orderitem_insert trigger for stock validation + deduction
export async function POST(request) {
    const customerEmail = request.headers.get('x-user-email');
    const role = request.headers.get('x-user-role');
    if (!customerEmail || (role && role !== 'customer')) {
        return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const conn = await db.getConnection();
    try {
        const { cart } = await request.json();
        if (!cart || Object.keys(cart).length === 0) {
            return NextResponse.json({ success: false, error: 'Cart is empty.' }, { status: 400 });
        }

        const cartItems = Object.values(cart);
        await conn.beginTransaction();

        await conn.query('DELETE FROM TempCart WHERE BINARY CustomerEmail = BINARY ?', [customerEmail]);
        for (const item of cartItems) {
            await conn.query(
                `INSERT INTO TempCart (CustomerEmail, ItemID, Quantity)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE Quantity = VALUES(Quantity)`,
                [customerEmail, item.ItemID, item.TotalQuantity]
            );
        }

        await conn.query('CALL place_order_from_tempcart(?, @new_order_id)', [customerEmail]);
        const [[{ orderId }]] = await conn.query('SELECT @new_order_id AS orderId');

        // Cart is event-sourced from UpdateCart (+1 Add / -1 Remove). For checkout,
        // we must emit one Remove event per purchased unit so cart reconstruction
        // reaches zero. We keep timestamps unique to satisfy the composite PK.
        let tsOffsetMicros = 0;
        for (const item of cartItems) {
            const qty = Math.max(1, Number(item.TotalQuantity) || 1);
            for (let i = 0; i < qty; i += 1) {
                await conn.query(
                    `INSERT INTO UpdateCart (CustomerEmail, ItemID, Action, Timestamp)
                     VALUES (?, ?, 'Remove', DATE_ADD(NOW(6), INTERVAL ? MICROSECOND))`,
                    [customerEmail, item.ItemID, tsOffsetMicros]
                );
                tsOffsetMicros += 1;
            }
        }

        await conn.commit();
        return NextResponse.json({ success: true, orderId: Number(orderId) });
    } catch (err) {
        await conn.rollback();
        if (err?.sqlState === '45000') {
            return NextResponse.json({ success: false, error: err.message }, { status: 409 });
        }
        if (err?.code === 'ER_BAD_FIELD_ERROR' || err?.code === 'ER_SP_DOES_NOT_EXIST') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Advanced checkout SQL is not installed. Run migration 014_advanced_sql_order_workflow.sql.',
                },
                { status: 409 }
            );
        }
        if (typeof err?.message === 'string' && err.message.includes('Illegal mix of collations')) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Checkout SQL collation mismatch. Run migration 015_fix_checkout_collation_mismatch.sql.',
                },
                { status: 409 }
            );
        }
        console.error('Checkout error:', err);
        return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
    } finally {
        conn.release();
    }
}
