import { NextResponse } from 'next/server';
import db from '@/lib/db';

function buildStorekeeperFilter(storekeeperEmail, tableAlias = 'ado') {
  if (!storekeeperEmail) {
    return { clause: '', params: [] };
  }
  return { clause: `WHERE ${tableAlias}.StorekeeperEmail = ?`, params: [storekeeperEmail] };
}

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

    const [recentInventoryUpdates] = await db.query(
      `SELECT
          ui.StorekeeperEmail,
          ui.ItemID,
          i.Name AS ItemName,
          ui.Action,
          ui.Timestamp
       FROM UpdateInventory ui
       LEFT JOIN Item_R1 i ON i.ItemID = ui.ItemID
       ${invFilter.clause}
       ORDER BY ui.Timestamp DESC
       LIMIT 10`,
      invFilter.params
    );

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

    return NextResponse.json({
      success: true,
      report: {
        operationStatus: operationStatusRows,
        recentOperations,
        recentInventoryUpdates,
        transactionSummary: transactionSummaryRows[0] || { OrdersCount: 0, EstimatedRevenue: 0 },
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
