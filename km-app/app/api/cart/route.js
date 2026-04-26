import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request){
    const CustomerEmail = request.headers.get('x-user-email');

    try{
        const [rows] = await db.query(
            `SELECT
                i.Name,
                i.Price,
                uc.ItemID,
                SUM(CASE
                    WHEN uc.Action = 'Add' THEN 1
                    WHEN uc.Action = 'Remove' THEN -1
                    ELSE 0
                END) AS TotalQuantity
            FROM UpdateCart uc
            JOIN Item_R1 i ON uc.ItemID = i.ItemID
            WHERE uc.CustomerEmail = ?
            GROUP BY uc.ItemID, i.Name, i.Price
            HAVING TotalQuantity > 0`,
            [CustomerEmail]
        );
        if(rows.length > 0){
            return NextResponse.json({ success: true, cart: rows });
        } else {
            return NextResponse.json({ success: true, message: 'No items in cart!' });
        }
    }
    catch(err){
        console.error('Cart GET error:', err);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

export async function DELETE(request){
    const CustomerEmail = request.headers.get('x-user-email');
    const { searchParams } = new URL(request.url);
    const itemID = searchParams.get('itemID');

    try{
        if (itemID) {
            await db.query(
                `DELETE FROM UpdateCart WHERE CustomerEmail = ? AND ItemID = ?`,
                [CustomerEmail, itemID]
            );
        } else {
            await db.query(
                `DELETE FROM UpdateCart WHERE CustomerEmail = ?`,
                [CustomerEmail]
            );
        }
        return NextResponse.json({ success: true });
    }
    catch(err){
        console.error('Cart DELETE error:', err);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

export async function POST(request){
    const CustomerEmail = request.headers.get('x-user-email');
    const { itemID, action, quantity = 1 } = await request.json();

    if (!itemID || !action) {
        return NextResponse.json({ error: 'itemID and action are required.' }, { status: 400 });
    }

    const count = Math.max(1, Math.floor(Number(quantity)));

    try{
        if (action === 'Add') {
            const [[item], [cartRows]] = await Promise.all([
                db.query(`SELECT Quantity FROM Item_R1 WHERE ItemID = ?`, [itemID]),
                db.query(
                    `SELECT SUM(CASE WHEN Action = 'Add' THEN 1 WHEN Action = 'Remove' THEN -1 ELSE 0 END) AS CartQty
                     FROM UpdateCart WHERE CustomerEmail = ? AND ItemID = ?`,
                    [CustomerEmail, itemID]
                ),
            ]);

            if (!item.length) {
                return NextResponse.json({ error: 'Item not found.' }, { status: 404 });
            }

            const stock = item[0].Quantity;
            const cartQty = Number(cartRows[0].CartQty) || 0;

            if (cartQty + count > stock) {
                return NextResponse.json(
                    { error: `Only ${stock} in stock${cartQty > 0 ? ` and you already have ${cartQty} in your cart` : ''}.` },
                    { status: 409 }
                );
            }
        }

        for (let i = 0; i < count; i++) {
            await db.query(
                `INSERT INTO UpdateCart (ItemID, CustomerEmail, Action, Timestamp) VALUES (?, ?, ?, NOW(6))`,
                [itemID, CustomerEmail, action]
            );
        }

        return NextResponse.json({ success: true, message: 'Cart updated successfully!' });
    }
    catch(err){
        console.error('Cart POST error:', err);
        return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
    }
}
