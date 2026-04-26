import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function POST(request){
    const customerEmail = request.headers.get('x-user-email');

    try{
        const { cart } = await request.json();

        if (!cart || Object.keys(cart).length === 0) {
            return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
        }

        const [orderRes] = await db.query(
            `INSERT INTO CustomerOrder (CustomerEmail) VALUES (?)`,
            [customerEmail]
        );

        const orderId = orderRes.insertId;
        const cartItems = Object.values(cart);

        for(const item of cartItems){
            await db.query(
                `INSERT INTO OrderItem (CustomerEmail, OrderID, ItemID, Quantity) VALUES (?,?,?,?)`,
                [customerEmail, orderId, item.ItemID, item.TotalQuantity]
            );
        }

        const now = new Date();
        await Promise.all(
            cartItems.flatMap((item) =>
                Array.from({ length: item.TotalQuantity }, () =>
                    db.query(
                        `INSERT INTO UpdateCart (CustomerEmail, ItemID, Action, Timestamp) VALUES (?, ?, 'Remove', ?)`,
                        [customerEmail, item.ItemID, now]
                    )
                )
            )
        );

        return NextResponse.json({ success: true, orderId });
    } catch(err){
        console.error('Checkout error:', err);
        return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
    }
}
