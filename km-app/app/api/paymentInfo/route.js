import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function POST(request){
    const customerEmail = request.headers.get('x-user-email');

    try{
        const [rows] = await db.query(
            `SELECT ID, Type, Provider, Last4, ExpMonth, ExpYear
             FROM PaymentInfo
             WHERE CustomerEmail = ?`,
            [customerEmail]
        );
        if(rows.length >= 1){
            return NextResponse.json({ success: true, paymentInfo: rows });
        } else {
            return NextResponse.json({ success: false, message: 'No payment info found.' });
        }
    } catch(err){
        console.error('PaymentInfo POST error:', err);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
