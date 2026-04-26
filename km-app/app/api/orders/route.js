import { NextResponse } from 'next/server'
import db from '@/lib/db'

const PAGE_SIZE = 10;

async function fetchCustomerOrderSummaries(customerEmail, limit, offset) {
    try {
        const [rows] = await db.query(
            `SELECT
                co.OrderID,
                co.Timestamp AS OrderTimestamp,
                co.Status,
                co.CancelReason,
                COALESCE(COUNT(oi.ItemID), 0) AS ItemCount,
                COALESCE(SUM(oi.Quantity), 0) AS TotalUnits,
                COALESCE(ROUND(SUM(oi.Quantity * i.Price), 2), 0) AS OrderTotal
             FROM CustomerOrder co
             LEFT JOIN OrderItem oi
               ON oi.OrderID = co.OrderID
              AND oi.CustomerEmail = co.CustomerEmail
             LEFT JOIN Item_R1 i ON i.ItemID = oi.ItemID
             WHERE co.CustomerEmail = ?
             GROUP BY co.OrderID, co.Timestamp, co.Status, co.CancelReason
             ORDER BY co.Timestamp DESC
             LIMIT ? OFFSET ?`,
            [customerEmail, limit, offset]
        );
        return rows;
    } catch (error) {
        if (error?.code !== 'ER_BAD_FIELD_ERROR') throw error;
        const [legacyRows] = await db.query(
            `SELECT
                co.OrderID,
                co.Timestamp AS OrderTimestamp,
                COALESCE(COUNT(oi.ItemID), 0) AS ItemCount,
                COALESCE(SUM(oi.Quantity), 0) AS TotalUnits,
                COALESCE(ROUND(SUM(oi.Quantity * i.Price), 2), 0) AS OrderTotal
             FROM CustomerOrder co
             LEFT JOIN OrderItem oi
               ON oi.OrderID = co.OrderID
              AND oi.CustomerEmail = co.CustomerEmail
             LEFT JOIN Item_R1 i ON i.ItemID = oi.ItemID
             WHERE co.CustomerEmail = ?
             GROUP BY co.OrderID, co.Timestamp
             ORDER BY co.Timestamp DESC
             LIMIT ? OFFSET ?`,
            [customerEmail, limit, offset]
        );
        return legacyRows.map((row) => ({
            ...row,
            Status: 'pending',
            CancelReason: null,
        }));
    }
}

export async function GET(request){
    const CustomerEmail = request.headers.get('x-user-email');
    const role = request.headers.get('x-user-role');
    if (role && role !== 'customer') {
        return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page   = Math.max(1, parseInt(searchParams.get('page')  || '1', 10));
    const limit  = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || String(PAGE_SIZE), 10)));
    const offset = (page - 1) * limit;

    try{
        const [[{ total }]] = await db.query(
            `SELECT COUNT(*) AS total
             FROM CustomerOrder
             WHERE CustomerEmail = ?`,
            [CustomerEmail]
        );

        if (total === 0) {
            return NextResponse.json({ success: true, orders: [], total: 0, page, totalPages: 0 });
        }

        const summaryRows = await fetchCustomerOrderSummaries(CustomerEmail, limit, offset);

        const orderIds = summaryRows.map(r => r.OrderID);

        // Fetch item details only for the orders on this page
        const [itemRows] = orderIds.length
            ? await db.query(
                `SELECT
                    oi.OrderID,
                    oi.ItemID,
                    i.Name,
                    oi.Quantity,
                    i.Price,
                    ROUND(oi.Quantity * i.Price, 2) AS LineTotal
                 FROM OrderItem oi
                 JOIN Item_R1 i ON i.ItemID = oi.ItemID
                 WHERE oi.CustomerEmail = ?
                   AND oi.OrderID IN (?)
                 ORDER BY oi.OrderID DESC, oi.ItemID ASC`,
                [CustomerEmail, orderIds]
            )
            : [[]];

        // Merge items into their summary order
        const itemsByOrder = {};
        for (const item of itemRows) {
            if (!itemsByOrder[item.OrderID]) itemsByOrder[item.OrderID] = [];
            itemsByOrder[item.OrderID].push({
                ItemID:   item.ItemID,
                Name:     item.Name,
                Quantity: item.Quantity,
                Price:    item.Price,
                LineTotal: item.LineTotal,
            });
        }

        const orders = summaryRows.map(s => ({
            OrderID:    s.OrderID,
            Timestamp:  s.OrderTimestamp,
            Status: s.Status || 'pending',
            CancelReason: s.CancelReason || null,
            ItemCount:  s.ItemCount,
            TotalUnits: s.TotalUnits,
            OrderTotal: s.OrderTotal,
            Items:      itemsByOrder[s.OrderID] ?? [],
        }));

        const totalPages = Math.ceil(total / limit);
        return NextResponse.json({ success: true, orders, total, page, totalPages });
    }
    catch(err){
        console.error('Orders GET error:', err);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
