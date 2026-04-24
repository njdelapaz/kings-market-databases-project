import { NextResponse } from 'next/server'
import db, { withTransaction } from '@/lib/db'
import { withStockStatus } from '@/lib/catalog'
import {
    decrementStock,
    restockItem,
    INVENTORY_ERRORS,
} from '@/lib/inventory'

// Whitelists for user-controlled ORDER BY inputs. Keeping this explicit prevents
// any chance of SQL injection via the `sort` / `order` query params, since the
// mysql2 placeholder syntax can't parameterize identifiers or ORDER BY direction.
const SORT_COLUMNS = {
    name:     'i.Name',
    price:    'i.Price',
    quantity: 'i.Quantity',
};
const SORT_ORDERS = new Set(['asc', 'desc']);

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 100;

function parsePositiveInt(value, fallback) {
    if (value == null || value === '') return fallback;
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : fallback;
}

function parseNonNegativeNumber(value) {
    if (value == null || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : null;
}

export async function GET(request){
    try{
        const { searchParams } = new URL(request.url);

        const q          = (searchParams.get('q') || '').trim();
        const category   = (searchParams.get('category') || '').trim();
        const minPrice   = parseNonNegativeNumber(searchParams.get('minPrice'));
        const maxPrice   = parseNonNegativeNumber(searchParams.get('maxPrice'));
        const sortKey    = (searchParams.get('sort') || 'name').toLowerCase();
        const orderKey   = (searchParams.get('order') || 'asc').toLowerCase();
        // Customer endpoint: IsSelling = 1 is always enforced. The toggle only
        // controls whether we return rows with Quantity <= 0 so the UI can
        // render an "Out of Stock" badge, instead of hiding the item entirely.
        const includeOutOfStock = searchParams.get('includeOutOfStock') !== 'false';

        const page     = parsePositiveInt(searchParams.get('page'), 1);
        const rawSize  = parsePositiveInt(searchParams.get('pageSize'), DEFAULT_PAGE_SIZE);
        const pageSize = Math.min(rawSize, MAX_PAGE_SIZE);
        const offset   = (page - 1) * pageSize;

        const sortColumn = SORT_COLUMNS[sortKey] || SORT_COLUMNS.name;
        const sortOrder  = SORT_ORDERS.has(orderKey) ? orderKey : 'asc';

        const whereClauses = ['i.IsSelling = 1'];
        const filterParams = [];

        if (!includeOutOfStock) {
            whereClauses.push('i.Quantity > 0');
        }
        if (q) {
            whereClauses.push('i.Name LIKE ?');
            filterParams.push(`%${q}%`);
        }
        if (category) {
            whereClauses.push('c.Category = ?');
            filterParams.push(category);
        }
        if (minPrice != null) {
            whereClauses.push('i.Price >= ?');
            filterParams.push(minPrice);
        }
        if (maxPrice != null) {
            whereClauses.push('i.Price <= ?');
            filterParams.push(maxPrice);
        }

        const whereSql = `WHERE ${whereClauses.join(' AND ')}`;

        // Total count and current page are issued in parallel — they share the
        // same WHERE/filter params and only differ in projection + pagination.
        const listSql = `
            SELECT i.ItemID, i.SKU, i.Name, i.Quantity, i.Price, i.IsSelling, c.Category
            FROM Item_R1 i
            LEFT JOIN Item_R2 c ON c.Name = i.Name
            ${whereSql}
            ORDER BY ${sortColumn} ${sortOrder}, i.ItemID ASC
            LIMIT ? OFFSET ?
        `;
        const countSql = `
            SELECT COUNT(*) AS total
            FROM Item_R1 i
            LEFT JOIN Item_R2 c ON c.Name = i.Name
            ${whereSql}
        `;

        const [[rows], [countRows]] = await Promise.all([
            db.query(listSql, [...filterParams, pageSize, offset]),
            db.query(countSql, filterParams),
        ]);

        const items = rows.map(withStockStatus);
        const total = Number(countRows[0]?.total ?? 0);

        return NextResponse.json({
            success: true,
            items,
            total,
            page,
            pageSize,
        });
    }
    catch (err){
        console.error('Items GET error:', err);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

export async function POST(request){
    // Only storekeepers may modify inventory
    const role = request.headers.get('x-user-role');
    if (role !== 'storekeeper') {
        return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const itemID = Number(body?.itemID);
    const delta  = Number(body?.delta);

    if (!Number.isInteger(itemID) || itemID <= 0) {
        return NextResponse.json({ error: 'itemID must be a positive integer.' }, { status: 400 });
    }
    if (!Number.isInteger(delta) || delta === 0) {
        return NextResponse.json({ error: 'delta must be a non-zero integer.' }, { status: 400 });
    }

    try{
        // Wrap the stock change in a transaction so SELECT ... FOR UPDATE
        // actually holds a row lock until we commit. Without this, two
        // concurrent decrements can both read the same Quantity and race.
        const newQuantity = await withTransaction(async (conn) => {
            if (delta < 0) {
                return decrementStock(conn, itemID, -delta);
            }
            return restockItem(conn, itemID, delta);
        });

        return NextResponse.json({
            success: true,
            message: 'Item updated successfully.',
            itemID,
            quantity: newQuantity,
        });
    }
    catch(err){
        if (err?.message === INVENTORY_ERRORS.ITEM_NOT_FOUND) {
            return NextResponse.json(
                { success: false, error: INVENTORY_ERRORS.ITEM_NOT_FOUND },
                { status: 404 }
            );
        }
        if (err?.message === INVENTORY_ERRORS.INSUFFICIENT_STOCK) {
            return NextResponse.json(
                { success: false, error: INVENTORY_ERRORS.INSUFFICIENT_STOCK },
                { status: 409 }
            );
        }
        console.error('Items POST error:', err);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
