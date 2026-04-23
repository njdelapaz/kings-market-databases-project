import {NextResponse} from 'next/server'
import db from '@/lib/db'

export async function POST(request){
    const {customerEmail} = await request.json();
    try{
        const [rows] = await db.query(
            `SELECT * FROM PaymentInfo WHERE CustomerEmail = ?`, [customerEmail]
        );
        if(rows.length == 1){
            return NextResponse.json({ success: true, paymentInfo: rows});
        } else{
            return NextResponse.json({ success: false, items: 'No Payment Info Found!'});
        }
    } catch(err){
        console.log("Error: ", err);
        return NextResponse.json({error: err}, {status: 500});
    }
}