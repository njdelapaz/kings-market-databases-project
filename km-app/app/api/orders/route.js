import {NextResponse} from 'next/server'
import db from '@/lib/db'

export async function GET(request){
    const { searchParams } = new URL(request.url);

    // 2. Get the 'email' parameter
    const CustomerEmail = searchParams.get('email');

    try{
        // get order information and items.
        const [rows] = await db.query(
            //triple join -- joining OrderItem, CustomerOrder, and Item to get all necessary info.
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

        // group items by order.
        const ordersMap = {};
        for(const row of rows){
            if(!ordersMap[row.OrderID]){ //mimicking python defaultdict of dicts behavior.
                ordersMap[row.OrderID] = {
                    OrderID: row.OrderID,
                    Items: [],
                    Timestamp: row.Timestamp
                }
            }
            ordersMap[row.OrderID].Items.push({
                ItemID: row.ItemID,
                Name: row.Name,
                Quantity: row.Quantity,
                Price: row.Price,
            })
        }

        const orders = Object.values(ordersMap);
        return NextResponse.json({success: true, orders});

    }
    catch(err){
        console.log("Error: ", err);
        return NextResponse.json({error: err}, {status: 500});
    }
}