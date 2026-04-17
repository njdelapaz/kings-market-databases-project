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
        if(rows.length > 0){
            console.log("Output: ", rows.slice(0, 5));
        }
        else{
            console.log("No Items!");
        }
        return NextResponse.json({ success: true, items: rows});
    }
    catch (err){
        console.log("Error: ", err);
        return NextResponse.json({error: err}, {status: 500});
    }
}