# Admin Operations Runbook (Zaid)

This runbook covers day-to-day admin data operations for the Kings Market project.

Scope:
- Inventory import/export
- Transaction export
- Operation verification
- Backup/restore safety steps

Primary tables:
- `Item_R1`, `Item_R2`
- `AdminDataOperation`
- `CustomerOrder`, `OrderItem`
- `UpdateInventory`

---

## 1) Preconditions

- App is running (`km-app`)
- Database is reachable
- Admin APIs are available under:
  - `/api/admin/import/inventory`
  - `/api/admin/export/inventory`
  - `/api/admin/export/transactions`
  - `/api/admin/reports`

Required request context:
- `storekeeperEmail` must be provided for import/export/report actions.

---

## 2) Inventory Import (JSON/CSV)

Endpoint:
- `POST /api/admin/import/inventory`

Supported formats:
- `json`
- `csv`

Minimum required fields per row:
- `sku`
- `name`
- `quantity` (>= 0)
- `price` (>= 0)

Optional:
- `category`
- `isSelling`

Example JSON body:

```json
{
  "storekeeperEmail": "edymoke2@hatena.ne.jp",
  "format": "json",
  "filename": "inventory_batch.json",
  "content": [
    {
      "sku": "KM-900001",
      "name": "Demo Trail Mix",
      "category": "Snacks",
      "quantity": 18,
      "price": 5.5,
      "isSelling": 1
    }
  ]
}
```

Success criteria:
- API returns `success: true`
- `AdminDataOperation` has a new row with `OperationType='import'` and `Status='success'`
- Imported items are visible in `/api/admin/items`

Failure behavior:
- Validation failures return `400` with row-level messages
- Runtime failures return `500` and operation should be logged as `failed`

---

## 3) Inventory Export

Endpoint:
- `GET /api/admin/export/inventory`

Query params:
- `storekeeperEmail` (required)
- `format=json|csv` (optional, default `json`)
- `includeInactive=true|false` (optional)

Success criteria:
- `200` response
- File-like payload returned for CSV
- `AdminDataOperation` row created with `OperationType='export'`, `EntityType='inventory'`

---

## 4) Transaction Export

Endpoint:
- `GET /api/admin/export/transactions`

Query params:
- `storekeeperEmail` (required)
- `format=json|csv` (optional, default `json`)

Success criteria:
- `200` response
- Includes order line details (`OrderID`, `CustomerEmail`, `ItemID`, `Quantity`, `LineTotal`)
- `AdminDataOperation` row created with `EntityType='transactions'`

---

## 5) Admin Reporting Checks

Endpoint:
- `GET /api/admin/reports`

Use to verify:
- operation status counts
- recent import/export runs
- recent inventory updates
- basic transaction summary

Post-operation sanity checks:
1. Operation appears in `recentOperations`
2. Status bucket increments correctly
3. Imported items appear in inventory query/export

---

## 6) Rollback Playbook (Practical Class-Project Version)

Use this when a bad import is detected.

1. Identify bad operation:
   - Find the latest `AdminDataOperation` row by `RequestedAt`.
2. Determine affected SKU/item set:
   - From source file used in that operation.
3. Apply corrective import:
   - Re-import corrected data for same SKUs.
4. If an item should be hidden quickly:
   - Soft-disable by setting `IsSelling = 0`.
5. Verify via:
   - `/api/admin/items`
   - `/api/admin/export/inventory`
   - `/api/admin/reports`

Note:
- For this class project, rollback is done through corrective import + soft-disable workflow.

---

## 7) Backup and Restore (Cloud SQL or Local MySQL)

### Backup (logical dump)

```bash
mysqldump -u <user> -p hgr9ba_b > backup_YYYYMMDD.sql
```

### Restore

```bash
mysql -u <user> -p hgr9ba_b < backup_YYYYMMDD.sql
```

Safety:
- Take backup before large imports
- Record backup filename in your deployment notes

---

## 8) GCP Cloud SQL Access (Proxy)

Authenticate:

```bash
gcloud auth application-default login
```

Run proxy (macOS example):

```bash
./cloud-sql-proxy kings-market-491600:us-east4:kings-market-db --port 3306
```

Then use local DB host settings (`127.0.0.1:3306`) in app env.

---

## 9) Minimal Release Checklist (Admin Scope)

- Import endpoint works for JSON and CSV
- Inventory export works for JSON and CSV
- Transaction export works for JSON and CSV
- Admin report endpoint returns valid summary
- `AdminDataOperation` logs new actions correctly
- At least one known-good backup exists
