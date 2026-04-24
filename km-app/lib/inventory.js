// Concurrency-safe inventory mutations for Item_R1.
//
// Both functions take a `conn` that MUST already be inside a transaction
// (use `withTransaction` from ./db.js). The SELECT ... FOR UPDATE acquires
// a row-level lock that's only released at commit/rollback, so two parallel
// callers against the same item will serialize instead of racing.
//
// Callers discriminate failure modes by comparing `err.message` to the
// constants exported below — avoid string-matching literal messages.

export const INVENTORY_ERRORS = Object.freeze({
  ITEM_NOT_FOUND:     'ITEM_NOT_FOUND',
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  INVALID_QUANTITY:   'INVALID_QUANTITY',
});

function assertPositiveInteger(qty) {
  if (!Number.isInteger(qty) || qty <= 0) {
    throw new Error(INVENTORY_ERRORS.INVALID_QUANTITY);
  }
}

// Atomically subtracts `qty` units from Item_R1.Quantity.
// Returns the new Quantity, or throws one of INVENTORY_ERRORS.
export async function decrementStock(conn, itemId, qty) {
  assertPositiveInteger(qty);

  const [rows] = await conn.query(
    'SELECT Quantity FROM Item_R1 WHERE ItemID = ? FOR UPDATE',
    [itemId]
  );

  if (!rows.length) {
    throw new Error(INVENTORY_ERRORS.ITEM_NOT_FOUND);
  }

  const current = Number(rows[0].Quantity);
  if (!Number.isFinite(current) || current < qty) {
    throw new Error(INVENTORY_ERRORS.INSUFFICIENT_STOCK);
  }

  const next = current - qty;
  await conn.query(
    'UPDATE Item_R1 SET Quantity = ? WHERE ItemID = ?',
    [next, itemId]
  );
  return next;
}

// Atomically adds `qty` units back to Item_R1.Quantity.
// Used for storekeeper restocks and for cancellation paths.
export async function restockItem(conn, itemId, qty) {
  assertPositiveInteger(qty);

  const [rows] = await conn.query(
    'SELECT Quantity FROM Item_R1 WHERE ItemID = ? FOR UPDATE',
    [itemId]
  );

  if (!rows.length) {
    throw new Error(INVENTORY_ERRORS.ITEM_NOT_FOUND);
  }

  const current = Number(rows[0].Quantity) || 0;
  const next    = current + qty;
  await conn.query(
    'UPDATE Item_R1 SET Quantity = ? WHERE ItemID = ?',
    [next, itemId]
  );
  return next;
}
