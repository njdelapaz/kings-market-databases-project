import {NextResponse} from 'next/server'
import db from '@/lib/db'

export async function GET(request){
    // function to get all the items in the DB and display them.
    try{
        const [rows] = await db.query(
            `SELECT ItemID, Name, Quantity, Price, IsSelling
            FROM Item_R1
            WHERE Quantity > 0
            AND IsSelling = 1`,
        );
        return NextResponse.json({ success: true, items: rows});
    }
    catch (err){
        console.log("Error: ", err);
        return NextResponse.json({error: err}, {status: 500});
    }
}

export async function POST(request){
    const {itemID, delta} = await request.json();
    try{
        const [res] = await db.query(
            `UPDATE Item_R1 SET Quantity = Quantity + ? WHERE ItemID = ?`,
            [delta, itemID]
        )
        return NextResponse.json({ 
            success: true, 
            message: 'Item updated successfully!',
        });
    }
    catch(err){
        console.log("Error: ", err);
        return NextResponse.json({error: err}, {status: 500});
    }
}