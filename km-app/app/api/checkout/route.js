import {NextResponse} from 'next/server'
import db from '@/lib/db'

export async function POST(request){
    try{
        const { customerEmail, cart } = await request.json();
        const [orderRes] = await db.query(
            `INSERT INTO CustomerOrder (CustomerEmail) VALUES (?)`,
            [customerEmail]
        );

        const orderId = orderRes.insertId;

        // insert row into OrderItem for each cart item.
        const cartItems = Object.values(cart);
        for(const Item of cartItems){
            await db.query(
                `INSERT INTO OrderItem (CustomerEmail, OrderID, ItemID, Quantity) VALUES (?,?,?,?)`,
                [customerEmail, orderId, Item.ItemID, Item.TotalQuantity]
            );
        }

        const res =  NextResponse.json({success: true, orderId})
        // clear the user's cart for them.
        for(const Item of cartItems){
            await db.query(
                `INSERT INTO UpdateCart (CustomerEmail, ItemID, Action) VALUES (?, ?, 'Clear')`,
                [customerEmail, Item.ItemID]
            );
        }
        return res;
    } catch(err){
        console.error(err);
        return Response.json({ success: false, error: err.message }, { status: 500 });
    }
}