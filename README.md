# Kings Market Databases Project

Kings Market is a Database Systems course project that implements a grocery pre-order and pickup workflow.
It is designed to show how relational modeling, integrity constraints, and advanced SQL can drive real features in a full-stack app.

<img width="1512" height="823" alt="image" src="https://github.com/user-attachments/assets/e5ad9089-f270-45cd-b242-3f460e2182bb" />

&nbsp;

<img width="1512" height="823" alt="image" src="https://github.com/user-attachments/assets/bf0a485c-7bfa-4018-8862-9eb4d6cb0775" />

&nbsp;

<img width="1512" height="823" alt="image" src="https://github.com/user-attachments/assets/8ebef7c1-67e1-455c-bc12-9a4ba6630835" />

&nbsp;

<img width="1512" height="823" alt="image" src="https://github.com/user-attachments/assets/39148ffa-8853-4e7d-978a-e93e406eb562" />

## Project Purpose

- Build a realistic ecommerce-style data model for inventory, carts, checkout, orders, and admin operations.
- Enforce data correctness through SQL constraints, foreign keys, transactions, triggers, and procedures.
- Demonstrate advanced SQL features that are directly used from the UI (not only standalone scripts).
- Support role-specific experiences for customers and storekeepers.

## Tech Stack

- **Frontend/App:** Next.js App Router, React, TypeScript
- **Backend APIs:** Next.js Route Handlers
- **Database:** MySQL (local and GCP Cloud SQL)
- **Auth:** JWT + role-based route protection via proxy/middleware
- **Deployment:** Google Cloud Run + Cloud SQL

## User Roles and What They Can Do

### Customer

- Register/login and browse inventory
- Filter/search products and manage cart
- Checkout and place orders
- View past orders, order status, and cancellation reason (if cancelled)
- Submit item requests

### Storekeeper

- Manage inventory (add/update/import/export, sale availability)
- Manage order workflow statuses (`pending`, `processing`, `ready_for_pickup`, `picked_up`, `cancelled`)
- Provide required reason for cancelled orders
- View reports and analytics
- Create new storekeeper accounts from the UI

## SQL and Data Model Highlights

- Core normalized entities include:
  - `Item_R1`, `Item_R2`
  - `Customer_R1`, `Customer_R2`
  - `Storekeeper_R1`, `Storekeeper_R2`
  - `CustomerOrder`, `OrderItem`
  - `UpdateCart`, `UpdateInventory`, `AdminDataOperation`
- Integrity is enforced with PK/FK constraints and check constraints.
- APIs use transactional writes for multi-step operations.

## Advanced SQL Used by UI Features

- **Stored procedure:** `place_order_from_tempcart`
  - Used by checkout API to atomically create orders from temporary cart rows.
- **Trigger (stock enforcement):** `before_orderitem_insert_enforce_stock`
  - Validates item existence/stock/quantity and deducts stock at insert time.
- **Trigger (status audit):** `after_customerorder_status_update`
  - Writes order status transitions to `OrderStatusHistory`.
- **CTE + window functions:**
  - Used in reports API for ranked top-selling item analytics (last 30 days).

These are defined in:
- `km-app/db/migrations/014_advanced_sql_order_workflow.sql`

## Architecture and Data Flow (UI -> API -> SQL -> UI)

- **Checkout flow**
  - `cart/page.tsx` -> `/api/checkout` -> `TempCart` + `place_order_from_tempcart` + stock trigger -> order appears in customer/storekeeper order UIs.
- **Order status flow**
  - `storekeeper/orders/page.tsx` -> `/api/admin/orders/[orderId]` -> `CustomerOrder` update + status-history trigger -> timeline/status visible in both storekeeper and customer order pages.
- **Reports analytics flow**
  - `storekeeper/reports/page.tsx` -> `/api/admin/reports` -> CTE/window-function ranking query -> top-selling items table in UI.

## Key API Endpoints

- `POST /api/checkout` - checkout using advanced SQL procedure flow
- `GET /api/orders` - customer order history with status/timeline
- `GET /api/admin/orders` - storekeeper granular order queue
- `PATCH /api/admin/orders/[orderId]` - storekeeper status/cancel updates
- `GET /api/admin/reports` - operational + analytics reporting
- `POST /api/admin/import/inventory` - bulk import with operation logging
- `POST /api/admin/storekeepers` - create storekeeper account

## Current Schema Source

- Baseline schema + seed: `hgr9ba_b.sql`
- Incremental DB changes: `km-app/db/migrations/*.sql`

## Setup (Local MySQL)

1. Create a database:
   - `CREATE DATABASE hgr9ba_b;`
2. Import schema and seed data:
   - `mysql -u <username> -p hgr9ba_b < hgr9ba_b.sql`
3. Apply migrations:
   - `node km-app/db/migrate.js`

## Default Storekeeper Login

Created by `km-app/db/migrations/013_seed_default_storekeeper.sql`.

- Role: `storekeeper`
- Email: `storekeeper1@gmail.com`
- Username: `johnstorekeeper`
- Password: `Password`

## Migrations Folder Note

- For this repo, migrations are executable and tracked in `schema_migrations`.
- Run them with:
  - `node km-app/db/migrate.js`

## Cloud SQL Proxy

1. Authenticate:
   - `gcloud auth application-default login`
2. Run proxy:
   - Windows: `.\cloud-sql-proxy.exe kings-market-491600:us-east4:kings-market-db --port 3306`
   - macOS: `./cloud-sql-proxy kings-market-491600:us-east4:kings-market-db --port 3306`

Keep this running in its own terminal while developing against Cloud SQL.

## Demo Walkthrough (Short)

### Customer

1. Login/register as customer.
2. Browse inventory, add to cart, and checkout.
3. Open `Past Orders` and confirm order details + status badge.

### Storekeeper

1. Login as storekeeper.
2. Manage inventory and open `Orders`.
3. Update an order status (or cancel with reason).
4. Open `Reports` and confirm top-selling analytics table.

## Troubleshooting

- **Unknown column errors (e.g., `Status`, `Details`)**
  - Usually means migrations are missing.
  - Run: `node km-app/db/migrate.js`

- **FK block on delete**
  - Parent row cannot be deleted while dependents exist.
  - Prefer soft disable (`IsSelling = 0`) when history must remain.

- **Cloud SQL connection/auth issues**
  - Verify proxy is running and DB env vars are correct for the target instance.

## Advanced SQL Verification Queries

```sql
-- Procedure exists
SHOW PROCEDURE STATUS WHERE Db = DATABASE() AND Name = 'place_order_from_tempcart';

-- Triggers exist
SHOW TRIGGERS WHERE `Trigger` IN ('before_orderitem_insert_enforce_stock', 'after_customerorder_status_update');

-- Recent status history
SELECT * FROM OrderStatusHistory ORDER BY UpdatedAt DESC LIMIT 10;
```

## Known Limitations

- Order status synchronization is near-real-time via polling, not websocket push.
- Legacy DBs may need migration backfills before all report fields are available.

live GCP link: <https://kings-market-app-1078601567030.us-east4.run.app/>
