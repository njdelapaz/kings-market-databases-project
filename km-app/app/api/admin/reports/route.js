import { NextResponse } from 'next/server';
import db from '@/lib/db';

// Builds an optional WHERE clause and params array to filter by storekeeperEmail; returns empty clause if no email is provided.
function buildStorekeeperFilter(storekeeperEmail, tableAlias = 'ado') {
  if (!storekeeperEmail) {
    return { clause: '', params: [] };
  }
  return { clause: `WHERE ${tableAlias}.StorekeeperEmail = ?`, params: [storekeeperEmail] };
}

// Fetches the 10 most recent inventory update events with human-readable action labels; falls back to the legacy column set if migration 009 hasn't been applied.
async function getRecentInventoryUpdates(invFilter) {
  try {
    const [rows] = await db.query(
      `SELECT
          ui.StorekeeperEmail,
          ui.ItemID,
          i.Name AS ItemName,
          ui.Action,
          ui.Details,
          CASE
            WHEN ui.Action = 'Stop' THEN COALESCE(ui.Details, 'Marked as unavailable for sale')
            WHEN ui.Action = 'Restock' THEN COALESCE(ui.Details, 'Marked as available for sale / restocked')
            WHEN ui.Action = 'Adjust' THEN COALESCE(ui.Details, 'Updated item details')
            ELSE ui.Action
          END AS ActionLabel,
          ui.Timestamp
       FROM UpdateInventory ui
       LEFT JOIN Item_R1 i ON i.ItemID = ui.ItemID
       ${invFilter.clause}
       ORDER BY ui.Timestamp DESC
       LIMIT 10`,
      invFilter.params
    );
    return rows;
  } catch (error) {
    // Backward compatibility for DBs that have not applied migration 009 yet.
    if (error?.code !== 'ER_BAD_FIELD_ERROR') {
      throw error;
    }
    const [legacyRows] = await db.query(
      `SELECT
          ui.StorekeeperEmail,
          ui.ItemID,
          i.Name AS ItemName,
          ui.Action,
          CASE
            WHEN ui.Action = 'Stop' THEN 'Marked as unavailable for sale'
            WHEN ui.Action = 'Restock' THEN 'Marked as available for sale / restocked'
            WHEN ui.Action = 'Adjust' THEN 'Updated item details'
            ELSE ui.Action
          END AS ActionLabel,
          ui.Timestamp
       FROM UpdateInventory ui
       LEFT JOIN Item_R1 i ON i.ItemID = ui.ItemID
       ${invFilter.clause}
       ORDER BY ui.Timestamp DESC
       LIMIT 10`,
      invFilter.params
    );
    return legacyRows;
  }
}

// Advanced SQL (CTE + window functions) for storekeeper reports UI.
async function getTopSellingItemsAdvanced() {
  try {
    const [rows] = await db.query(
      `WITH item_sales AS (
         SELECT
           oi.ItemID,
           i.Name AS ItemName,
           SUM(oi.Quantity) AS UnitsSold,
           ROUND(SUM(oi.Quantity * i.Price), 2) AS Revenue
         FROM CustomerOrder co
         JOIN OrderItem oi
           ON oi.OrderID = co.OrderID
          AND oi.CustomerEmail = co.CustomerEmail
         JOIN Item_R1 i ON i.ItemID = oi.ItemID
         WHERE co.Timestamp >= NOW() - INTERVAL 30 DAY
         GROUP BY oi.ItemID, i.Name
       ),
       ranked AS (
         SELECT
           ItemID,
           ItemName,
           UnitsSold,
           Revenue,
           DENSE_RANK() OVER (ORDER BY UnitsSold DESC, Revenue DESC) AS SalesRank,
           ROUND(
             100 * Revenue / NULLIF(SUM(Revenue) OVER (), 0),
             2
           ) AS RevenueSharePct
         FROM item_sales
       )
       SELECT ItemID, ItemName, UnitsSold, Revenue, SalesRank, RevenueSharePct
       FROM ranked
       ORDER BY SalesRank, ItemID
       LIMIT 10`
    );
    return rows;
  } catch (error) {
    if (error?.code === 'ER_PARSE_ERROR') {
      return [];
    }
    throw error;
  }
}

// Aggregates operation status counts, recent admin operations, recent inventory updates, overall transaction/revenue totals, and item request summaries into one report payload.
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const storekeeperEmail =
      String(searchParams.get('storekeeperEmail') || request.headers.get('x-user-email') || '').trim();
    const role = request.headers.get('x-user-role');

    if (role && role !== 'storekeeper') {
      return NextResponse.json(
        { success: false, message: 'Forbidden.' },
        { status: 403 }
      );
    }

    const opFilter = buildStorekeeperFilter(storekeeperEmail, 'ado');
    const invFilter = buildStorekeeperFilter(storekeeperEmail, 'ui');

    const [operationStatusRows] = await db.query(
      `SELECT ado.Status, COUNT(*) AS Count
       FROM AdminDataOperation ado
       ${opFilter.clause}
       GROUP BY ado.Status`,
      opFilter.params
    );

    const [recentOperations] = await db.query(
      `SELECT
          ado.OperationID,
          ado.StorekeeperEmail,
          ado.OperationType,
          ado.EntityType,
          ado.DataFormat,
          ado.Status,
          ado.SourceFilename,
          ado.RequestedAt
       FROM AdminDataOperation ado
       ${opFilter.clause}
       ORDER BY ado.RequestedAt DESC
       LIMIT 10`,
      opFilter.params
    );

    const recentInventoryUpdates = await getRecentInventoryUpdates(invFilter);

    const [transactionSummaryRows] = await db.query(
      `SELECT
          COUNT(DISTINCT co.OrderID, co.CustomerEmail) AS OrdersCount,
          COALESCE(SUM(oi.Quantity * i.Price), 0) AS EstimatedRevenue
       FROM CustomerOrder co
       LEFT JOIN OrderItem oi
         ON oi.OrderID = co.OrderID
        AND oi.CustomerEmail = co.CustomerEmail
       LEFT JOIN Item_R1 i ON i.ItemID = oi.ItemID`
    );

    // Item request summary
    const [itemRequestStatusRows] = await db.query(
      `SELECT Status, COUNT(*) AS Count FROM ItemRequest GROUP BY Status`
    );
    const [recentItemRequestRows] = await db.query(
      `SELECT ID, CustomerEmail, Name, Status, ReviewedBy, ReviewedAt
       FROM ItemRequest
       ORDER BY ID DESC
       LIMIT 5`
    );
    const topSellingItems = await getTopSellingItemsAdvanced();

    return NextResponse.json({
      success: true,
      report: {
        operationStatus: operationStatusRows,
        recentOperations,
        recentInventoryUpdates,
        transactionSummary: transactionSummaryRows[0] || { OrdersCount: 0, EstimatedRevenue: 0 },
        itemRequestSummary: {
          statusCounts: itemRequestStatusRows,
          recent: recentItemRequestRows,
        },
        topSellingItems,
      },
    });
  } catch (error) {
    console.error('Failed to generate admin reports:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate admin reports.' },
      { status: 500 }
    );
  }
}
