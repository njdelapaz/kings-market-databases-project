import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request){
    const CustomerEmail = request.headers.get('x-user-email');

    try{
        const [rows] = await db.query(
            `SELECT
                co.OrderID,
                co.Timestamp,
                oi.ItemID,
                oi.Quantity,
                i.Name,
                i.Price
            FROM CustomerOrder co
            JOIN OrderItem oi ON co.OrderID = oi.OrderID
            JOIN Item_R1 i ON oi.ItemID = i.ItemID
            WHERE co.CustomerEmail = ?
            ORDER BY co.Timestamp DESC`,
            [CustomerEmail]
        );

        const ordersMap = {};
        for(const row of rows){
            if(!ordersMap[row.OrderID]){
                ordersMap[row.OrderID] = {
                    OrderID: row.OrderID,
                    Items: [],
                    Timestamp: row.Timestamp
                };
            }
            ordersMap[row.OrderID].Items.push({
                ItemID: row.ItemID,
                Name: row.Name,
                Quantity: row.Quantity,
                Price: row.Price,
            });
        }

        const orders = Object.values(ordersMap);
        return NextResponse.json({ success: true, orders });
    }
    catch(err){
        console.error('Orders GET error:', err);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
