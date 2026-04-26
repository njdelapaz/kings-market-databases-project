import { NextResponse } from 'next/server'
import db from '@/lib/db'

// Fetches all saved payment methods (ID, type, provider, last4, expiry) for the logged-in customer.
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

// Inserts a new payment method for the customer, or updates the existing one if a duplicate key conflict occurs.
export async function PUT(request){
    try{
        const CustomerEmail = request.headers.get('x-user-email');
        const {type, provider, last4, expMonth, expYear} = await request.json();
        // need the values(type), values(provider), etc because of the "on duplicate key update" instruction.
        await db.query(
            `INSERT INTO PaymentInfo (CustomerEmail, Type, Provider, Last4, ExpMonth, ExpYear) 
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            Type=VALUES(Type),
            Provider=VALUES(Provider),
            Last4=VALUES(Last4),
            ExpMonth=VALUES(ExpMonth),
            ExpYear=VALUES(ExpYear)`,
            [CustomerEmail, type, provider, last4, expMonth, expYear]
        )
        return NextResponse.json({ success: true, message: 'Payment Info Added Successfully!' });

    } catch(err){
        console.error("Payment Info Addition errored out. Error is: ", err);
        return NextResponse.json({ error: err}, { status: 500 });
    }
    
    
}
