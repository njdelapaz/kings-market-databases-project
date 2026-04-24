// Shared catalog/stock semantics used by both API routes and UI.
//
// Single source of truth for:
//   - how we derive a human-friendly stock status from the raw Quantity column
//   - the threshold that qualifies an item as "low stock"
//   - the set of stock-status values the rest of the app may reference
//
// Keeping this in one place means badges on pages, button-disabled logic,
// and API responses never drift from each other.

export const LOW_STOCK_THRESHOLD = 5;

export const STOCK_STATUS = Object.freeze({
  IN_STOCK:     'in_stock',
  LOW_STOCK:    'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
});

export function stockStatus(quantity) {
  const q = Number(quantity);
  if (!Number.isFinite(q) || q <= 0) return STOCK_STATUS.OUT_OF_STOCK;
  if (q <= LOW_STOCK_THRESHOLD)       return STOCK_STATUS.LOW_STOCK;
  return STOCK_STATUS.IN_STOCK;
}

// Decorates a raw Item_R1-shaped row (from any of our SELECTs) with
// the derived stockStatus so handlers don't each re-implement the rule.
export function withStockStatus(row) {
  if (!row) return row;
  return { ...row, stockStatus: stockStatus(row.Quantity) };
}
