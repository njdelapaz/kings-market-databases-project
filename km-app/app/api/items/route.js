import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(){
    try{
        const [rows] = await db.query(
            `SELECT ItemID, Name, Quantity, Price, IsSelling
            FROM Item_R1
            WHERE Quantity > 0
            AND IsSelling = 1`,
        );
        return NextResponse.json({ success: true, items: rows });
    }
    catch (err){
        console.error('Items GET error:', err);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

export async function POST(request){
    // Only storekeepers may modify inventory
    const role = request.headers.get('x-user-role');
    if (role !== 'storekeeper') {
        return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const body = await request.json();
    const { itemID, delta } = body;

    if (itemID == null || delta == null) {
        return NextResponse.json({ error: 'itemID and delta are required.' }, { status: 400 });
    }

    try{
        await db.query(
            `UPDATE Item_R1 SET Quantity = Quantity + ? WHERE ItemID = ?`,
            [delta, itemID]
        );
        return NextResponse.json({ success: true, message: 'Item updated successfully.' });
    }
    catch(err){
        console.error('Items POST error:', err);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
