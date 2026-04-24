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
            AND uc.Timestamp > COALESCE(
                (SELECT MAX(uc2.Timestamp) FROM UpdateCart uc2
                WHERE uc2.CustomerEmail = ? AND uc2.Action = 'Clear'),
                '1970-01-01'
            )
            GROUP BY uc.ItemID, i.Name, i.Price
            HAVING TotalQuantity > 0`,
            [CustomerEmail, CustomerEmail]
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

export async function POST(request){
    const CustomerEmail = request.headers.get('x-user-email');
    const { itemID, action, timestamp } = await request.json();

    if (!itemID || !action) {
        return NextResponse.json({ error: 'itemID and action are required.' }, { status: 400 });
    }

    try{
        await db.query(
            `INSERT INTO UpdateCart (ItemID, CustomerEmail, Action, Timestamp) VALUES (?, ?, ?, ?)`,
            [itemID, CustomerEmail, action, timestamp]
        );
        return NextResponse.json({ success: true, message: 'Cart updated successfully!' });
    }
    catch(err){
        console.error('Cart POST error:', err);
        return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
    }
}
