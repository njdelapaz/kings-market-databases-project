// scripts/race-stock.mjs
// Validates that decrementStock + withTransaction actually serializes
// concurrent checkouts against the same row. Useful for the sprint-exit
// criterion: "two simultaneous checkout attempts on stock=1 yield exactly
// one winner" (see team_build_plan.md).
//
// Usage:
//   node scripts/race-stock.mjs --item-id 1 --parallel 10 --qty 1
//
// Default behaviour: set Quantity = qty, then fire N parallel decrement
// attempts of size qty. Expect exactly 1 success and (parallel - 1)
// INSUFFICIENT_STOCK. Use --stock to override the starting Quantity.
//
// Works locally (TCP to 127.0.0.1) or against Cloud SQL (DB_SOCKET_PATH or
// public IP with SSL). Reads the same .env.local db/migrate.js does.

import mysql from 'mysql2/promise';
import fs    from 'node:fs';
import path  from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key  = a.slice(2);
    const next = argv[i + 1];
    if (next == null || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

function buildDbConfig() {
  const base = {
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };
  if (process.env.DB_SOCKET_PATH) {
    return { ...base, socketPath: process.env.DB_SOCKET_PATH, enableCleartextPlugin: true };
  }
  const cfg = {
    ...base,
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
  };
  // Cloud SQL over public IP requires SSL; local TCP is fine either way
  // since rejectUnauthorized:false just disables cert pinning.
  if (process.env.DB_HOST && process.env.DB_HOST !== '127.0.0.1' && process.env.DB_HOST !== 'localhost') {
    cfg.ssl = { rejectUnauthorized: false };
  }
  return cfg;
}

// Local copies of withTransaction + decrementStock so this script stays
// standalone (no Next.js/bundler import path tricks).
async function withTransaction(pool, fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    try { await conn.rollback(); } catch { /* best-effort */ }
    throw err;
  } finally {
    conn.release();
  }
}

const INVENTORY_ERRORS = {
  ITEM_NOT_FOUND:     'ITEM_NOT_FOUND',
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
};

async function decrementStock(conn, itemId, qty) {
  const [rows] = await conn.query(
    'SELECT Quantity FROM Item_R1 WHERE ItemID = ? FOR UPDATE',
    [itemId]
  );
  if (!rows.length) throw new Error(INVENTORY_ERRORS.ITEM_NOT_FOUND);
  const current = Number(rows[0].Quantity);
  if (!Number.isFinite(current) || current < qty) {
    throw new Error(INVENTORY_ERRORS.INSUFFICIENT_STOCK);
  }
  const next = current - qty;
  await conn.query('UPDATE Item_R1 SET Quantity = ? WHERE ItemID = ?', [next, itemId]);
  return next;
}

async function main() {
  loadEnvLocal();

  const args     = parseArgs(process.argv);
  const itemId   = Number(args['item-id']);
  const parallel = Number(args['parallel'] ?? 10);
  const qty      = Number(args['qty'] ?? 1);
  const stock    = args['stock'] != null ? Number(args['stock']) : qty;

  if (!Number.isInteger(itemId) || itemId <= 0) {
    console.error('Usage: node scripts/race-stock.mjs --item-id <n> [--parallel 10] [--qty 1] [--stock <n>]');
    process.exit(2);
  }
  if (!Number.isInteger(parallel) || parallel < 1) {
    console.error('--parallel must be a positive integer.'); process.exit(2);
  }
  if (!Number.isInteger(qty) || qty < 1) {
    console.error('--qty must be a positive integer.'); process.exit(2);
  }
  if (!Number.isInteger(stock) || stock < 0) {
    console.error('--stock must be a non-negative integer.'); process.exit(2);
  }

  const pool = mysql.createPool({
    ...buildDbConfig(),
    connectionLimit: Math.max(parallel + 2, 5),
  });

  try {
    // Seed the row so we know the exact starting Quantity regardless of
    // whatever the DB currently looks like.
    const [upd] = await pool.query(
      'UPDATE Item_R1 SET Quantity = ? WHERE ItemID = ?',
      [stock, itemId]
    );
    if (!upd.affectedRows) {
      console.error(`No Item_R1 row with ItemID = ${itemId}. Seed/migrate first.`);
      process.exit(1);
    }

    const expectedWins = Math.floor(stock / qty);
    console.log(
      `item=${itemId} stock=${stock} parallel=${parallel} qty=${qty}\n` +
      `expected: ${expectedWins} success, ${parallel - expectedWins} INSUFFICIENT_STOCK\n`
    );

    const results = await Promise.all(
      Array.from({ length: parallel }, (_, i) =>
        withTransaction(pool, (conn) => decrementStock(conn, itemId, qty))
          .then((newQty) => ({ ok: true, i, newQty }))
          .catch((err)   => ({ ok: false, i, err: err.message }))
      )
    );

    const wins       = results.filter(r => r.ok);
    const oversells  = results.filter(r => !r.ok && r.err === INVENTORY_ERRORS.INSUFFICIENT_STOCK);
    const unexpected = results.filter(r => !r.ok && r.err !== INVENTORY_ERRORS.INSUFFICIENT_STOCK);

    const [finalRows] = await pool.query(
      'SELECT Quantity FROM Item_R1 WHERE ItemID = ?',
      [itemId]
    );
    const finalQty = Number(finalRows[0]?.Quantity);

    console.log('Results:');
    console.log(`  successes:           ${wins.length}`);
    console.log(`  INSUFFICIENT_STOCK:  ${oversells.length}`);
    console.log(`  other errors:        ${unexpected.length}`);
    console.log(`  final Quantity:      ${finalQty}`);
    if (unexpected.length) {
      console.log('  unexpected errors:', unexpected.map(r => r.err));
    }

    const expectedRemaining = stock - expectedWins * qty;
    const pass =
      wins.length       === expectedWins &&
      oversells.length  === parallel - expectedWins &&
      unexpected.length === 0 &&
      finalQty          === expectedRemaining;

    console.log(`\n${pass ? 'PASS' : 'FAIL'}: race harness ${pass ? 'held' : 'did not hold'} the invariant.`);
    process.exit(pass ? 0 : 1);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Race harness error:', err);
  process.exit(1);
});
