import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function POST(request){
    const customerEmail = request.headers.get('x-user-email');

    const conn = await db.getConnection();
    try{
        const { cart } = await request.json();

        if (!cart || Object.keys(cart).length === 0) {
            conn.release();
            return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
        }

        const cartItems = Object.values(cart);

        await conn.beginTransaction();

        // Lock each item row and verify sufficient stock before committing anything
        for (const item of cartItems) {
            const [[row]] = await conn.query(
                `SELECT Quantity, Name FROM Item_R1 WHERE ItemID = ? FOR UPDATE`,
                [item.ItemID]
            );
            if (!row || row.Quantity < item.TotalQuantity) {
                await conn.rollback();
                conn.release();
                return NextResponse.json(
                    {
                        success: false,
                        error: 'insufficient_stock',
                        itemName: row?.Name ?? 'Unknown item',
                        available: row?.Quantity ?? 0,
                    },
                    { status: 409 }
                );
            }
        }

        // Create the order if we have stock!
        const [orderRes] = await conn.query(
            `INSERT INTO CustomerOrder (CustomerEmail) VALUES (?)`,
            [customerEmail]
        );
        const orderId = orderRes.insertId;

        for (const item of cartItems) {
            await conn.query(
                `INSERT INTO OrderItem (CustomerEmail, OrderID, ItemID, Quantity) VALUES (?,?,?,?)`,
                [customerEmail, orderId, item.ItemID, item.TotalQuantity]
            );
            // Decrement stock inside the transaction
            await conn.query(
                `UPDATE Item_R1 SET Quantity = Quantity - ? WHERE ItemID = ?`,
                [item.TotalQuantity, item.ItemID]
            );
        }

        const now = new Date();
        for (const item of cartItems) {
            for (let i = 0; i < item.TotalQuantity; i++) {
                await conn.query(
                    `INSERT INTO UpdateCart (CustomerEmail, ItemID, Action) VALUES (?, ?, 'Remove')`,
                    [customerEmail, item.ItemID, now]
                );
            }
        }

        await conn.commit();
        conn.release();

        return NextResponse.json({ success: true, orderId });
    } catch(err){
        await conn.rollback();
        conn.release();
        console.error('Checkout error:', err);
        return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
    }
}
