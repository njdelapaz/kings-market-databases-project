import {NextResponse} from 'next/server'
import db from '@/lib/db'

export async function GET(request){
    const { searchParams } = new URL(request.url);

    // 2. Get the 'email' parameter
    const CustomerEmail = searchParams.get('email');
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
        )
        if(rows.length > 0){
            return NextResponse.json({success: true, cart: rows})
        }
        else{
            return NextResponse.json({success: true, message: "No items in cart!"})
        }
    }
    catch(err){
        console.log("Error: ", err);
        return NextResponse.json({error: err}, {status: 500});
    }
}


export async function POST(request){
    const {itemID, CustomerEmail, action, timestamp} = await request.json();
    console.log("This is the item ID: ", itemID);
    try{
        const [result] = await db.query(
            `INSERT INTO UpdateCart (ItemID, CustomerEmail, Action, Timestamp) VALUES (?, ?, ?, ?)`,
            [itemID, CustomerEmail, action, timestamp]
        )
        return NextResponse.json({ 
            success: true, 
            message: 'Cart updated successfully!',
            insertId: result.insertId 
        });
    }
    catch(err){
        console.error("Database Error:", err);
        return NextResponse.json(
            { success: false, error: err.message }, 
            { status: 500 }
        );
    }
}