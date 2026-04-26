import { NextResponse } from 'next/server';
import db from '@/lib/db';

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

function badRequest(message) {
  return NextResponse.json({ success: false, message }, { status: 400 });
}

function parsePositiveInt(value, fallback) {
  if (value == null || value === '') return fallback;
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

async function fetchStatusHistory(orderIds) {
  if (!orderIds.length) return {};
  try {
    const [rows] = await db.query(
      `SELECT OrderID, OldStatus, NewStatus, CancelReason, UpdatedAt
       FROM OrderStatusHistory
       WHERE OrderID IN (?)
       ORDER BY UpdatedAt DESC`,
      [orderIds]
    );
    const historyByOrder = {};
    for (const row of rows) {
      if (!historyByOrder[row.OrderID]) historyByOrder[row.OrderID] = [];
      historyByOrder[row.OrderID].push({
        OldStatus: row.OldStatus,
        NewStatus: row.NewStatus,
        CancelReason: row.CancelReason,
        UpdatedAt: row.UpdatedAt,
      });
    }
    return historyByOrder;
  } catch (error) {
    if (error?.code === 'ER_NO_SUCH_TABLE') return {};
    throw error;
  }
}

async function fetchOrderSummaries(pageSize, offset) {
  try {
    const [rows] = await db.query(
      `SELECT
          co.OrderID,
          co.CustomerEmail,
          cr2.Username AS CustomerUsername,
          co.Timestamp AS OrderTimestamp,
          co.Status,
          co.CancelReason,
          COALESCE(SUM(oi.Quantity), 0) AS TotalUnits,
          COALESCE(ROUND(SUM(oi.Quantity * i.Price), 2), 0) AS OrderTotal
       FROM CustomerOrder co
       LEFT JOIN Customer_R2 cr2 ON cr2.Email = co.CustomerEmail
       LEFT JOIN OrderItem oi
         ON oi.OrderID = co.OrderID
        AND oi.CustomerEmail = co.CustomerEmail
       LEFT JOIN Item_R1 i ON i.ItemID = oi.ItemID
       GROUP BY
          co.OrderID,
          co.CustomerEmail,
          cr2.Username,
          co.Timestamp,
          co.Status,
          co.CancelReason
       ORDER BY co.Timestamp DESC, co.OrderID DESC
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );
    return rows;
  } catch (error) {
    if (error?.code !== 'ER_BAD_FIELD_ERROR') throw error;
    const [legacyRows] = await db.query(
      `SELECT
          co.OrderID,
          co.CustomerEmail,
          cr2.Username AS CustomerUsername,
          co.Timestamp AS OrderTimestamp,
          COALESCE(SUM(oi.Quantity), 0) AS TotalUnits,
          COALESCE(ROUND(SUM(oi.Quantity * i.Price), 2), 0) AS OrderTotal
       FROM CustomerOrder co
       LEFT JOIN Customer_R2 cr2 ON cr2.Email = co.CustomerEmail
       LEFT JOIN OrderItem oi
         ON oi.OrderID = co.OrderID
        AND oi.CustomerEmail = co.CustomerEmail
       LEFT JOIN Item_R1 i ON i.ItemID = oi.ItemID
       GROUP BY
          co.OrderID,
          co.CustomerEmail,
          cr2.Username,
          co.Timestamp
       ORDER BY co.Timestamp DESC, co.OrderID DESC
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );
    return legacyRows.map((row) => ({
      ...row,
      Status: 'pending',
      CancelReason: null,
    }));
  }
}

export async function GET(request) {
  try {
    const role = request.headers.get('x-user-role');
    if (role && role !== 'storekeeper') {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get('page'), 1);
    const rawPageSize = parsePositiveInt(searchParams.get('pageSize'), DEFAULT_PAGE_SIZE);
    const pageSize = Math.min(rawPageSize, MAX_PAGE_SIZE);
    const offset = (page - 1) * pageSize;

    const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM CustomerOrder');
    if (!total) {
      return NextResponse.json({
        success: true,
        orders: [],
        total: 0,
        page,
        pageSize,
      });
    }

    const summaryRows = await fetchOrderSummaries(pageSize, offset);

    const orderIds = summaryRows.map((row) => row.OrderID);
    const [itemRows] = orderIds.length
      ? await db.query(
          `SELECT
              oi.OrderID,
              oi.ItemID,
              i.Name AS Name,
              oi.Quantity,
              i.Price,
              ROUND(oi.Quantity * i.Price, 2) AS LineTotal
           FROM OrderItem oi
           JOIN Item_R1 i ON i.ItemID = oi.ItemID
           WHERE oi.OrderID IN (?)
           ORDER BY oi.OrderID DESC, oi.ItemID ASC`,
          [orderIds]
        )
      : [[]];
    const historyByOrder = await fetchStatusHistory(orderIds);

    const itemsByOrder = {};
    for (const item of itemRows) {
      if (!itemsByOrder[item.OrderID]) itemsByOrder[item.OrderID] = [];
      itemsByOrder[item.OrderID].push({
        ItemID: item.ItemID,
        Name: item.Name,
        Quantity: Number(item.Quantity),
        Price: Number(item.Price),
        LineTotal: Number(item.LineTotal),
      });
    }

    const orders = summaryRows.map((row) => ({
      OrderID: row.OrderID,
      CustomerEmail: row.CustomerEmail,
      CustomerUsername: row.CustomerUsername || row.CustomerEmail,
      Timestamp: row.OrderTimestamp,
      Status: row.Status || 'pending',
      CancelReason: row.CancelReason || null,
      TotalUnits: Number(row.TotalUnits || 0),
      OrderTotal: Number(row.OrderTotal || 0),
      Items: itemsByOrder[row.OrderID] || [],
      StatusHistory: historyByOrder[row.OrderID] || [],
    }));

    return NextResponse.json({
      success: true,
      orders,
      total: Number(total),
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Failed to fetch storekeeper orders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders.' },
      { status: 500 }
    );
  }
}
