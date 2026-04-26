import { NextResponse } from 'next/server'
import db from '@/lib/db'

const PAGE_SIZE = 10;

// Returns paginated order history for the logged-in customer by querying summary and line-item views, then merging items into their parent orders.
export async function GET(request){
    const CustomerEmail = request.headers.get('x-user-email');

    const { searchParams } = new URL(request.url);
    const page   = Math.max(1, parseInt(searchParams.get('page')  || '1', 10));
    const limit  = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || String(PAGE_SIZE), 10)));
    const offset = (page - 1) * limit;

    try{
        // Total order count for pagination metadata
        const [[{ total }]] = await db.query(
            `SELECT COUNT(*) AS total FROM v_customer_order_summary WHERE CustomerEmail = ?`,
            [CustomerEmail]
        );

        if (total === 0) {
            return NextResponse.json({ success: true, orders: [], total: 0, page, totalPages: 0 });
        }

        // Paginated summary rows (one per order, with pre-computed total)
        const [summaryRows] = await db.query(
            `SELECT OrderID, OrderTimestamp, ItemCount, TotalUnits, OrderTotal
             FROM v_customer_order_summary
             WHERE CustomerEmail = ?
             ORDER BY OrderTimestamp DESC
             LIMIT ? OFFSET ?`,
            [CustomerEmail, limit, offset]
        );

        const orderIds = summaryRows.map(r => r.OrderID);

        // Fetch item details only for the orders on this page
        const [itemRows] = await db.query(
            `SELECT OrderID, ItemID, ItemName AS Name, Quantity, ItemPrice AS Price, LineTotal
             FROM v_customer_order_history
             WHERE CustomerEmail = ? AND OrderID IN (?)
             ORDER BY OrderID DESC`,
            [CustomerEmail, orderIds]
        );

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
