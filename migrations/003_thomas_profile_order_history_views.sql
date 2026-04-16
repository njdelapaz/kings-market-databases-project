-- DOCUMENTATION ONLY - DO NOT EXECUTE
-- Main schema file is now maintained directly in `hgr9ba_b.sql`.
-- This file is kept only as historical notes for the SQL optimization sprint.
--
-- Kings Market SQL Optimization Sprint (Thomas scope)
-- Sprint tasks (Thomas lead + Daksh):
--   1. Confirm schema supports profile/history API response needs without N+1 query patterns.
--   2. Define shared read models/views for profile and order-history pages.

-- --------------------------------------------------------
-- N+1 Problem Analysis
-- --------------------------------------------------------
-- Without these changes, a Next.js API route loading a customer's order history
-- would require:
--   1 query    →  SELECT * FROM CustomerOrder WHERE CustomerEmail = ?
--                 returns N orders
--   N queries  →  SELECT * FROM OrderItem WHERE OrderID = ? AND CustomerEmail = ?
--                 one per order
--   N*M queries → SELECT * FROM Item_R1 WHERE ItemID = ?
--                 one per line item per order
--                 + a second hit to Item_R2 for category
--
-- This is classic N+1. With 13 seeded orders and ~1 item each, that's already
-- 27+ queries for one page load. At real scale it is unacceptable.
--
-- Fixes applied to hgr9ba_b.sql:
--   1. Composite index (CustomerEmail, Timestamp) on CustomerOrder:
--      ORDER BY Timestamp DESC now uses an index range scan instead of
--      a filesort across all CustomerOrder rows.
--   2. vw_customer_profile view: one query returns all profile fields.
--   3. vw_order_history view: one query per customer returns
--      every order + every line item + item detail in a single JOIN.

-- --------------------------------------------------------
-- 1) Composite index for efficient user order timeline queries
-- --------------------------------------------------------

ALTER TABLE `CustomerOrder`
  ADD KEY `idx_customerorder_email_ts` (`CustomerEmail`, `Timestamp`);

-- --------------------------------------------------------
-- 2) Profile read model view
--    Consumer: GET /api/profile  (Next.js route handler)
--    Query:    SELECT * FROM vw_customer_profile WHERE Email = ?
--
--    Field decisions:
--      Email       - Customer_R1 PK; the auth identity passed in the JWT claim.
--      Username    - Customer_R2 display name; shown in the profile page header.
--      PhoneNumber - Customer_R1; the only other editable profile field in the schema.
--
--    Excluded intentionally:
--      PaymentInfo - raw Number/CVC/Exp_Date columns are a PCI/security issue.
--      The profile view must NOT expose them until Daksh's tokenization task
--      replaces those columns with a provider/token reference pattern.
-- --------------------------------------------------------

CREATE OR REPLACE VIEW `vw_customer_profile` AS
SELECT
  r1.`Email`,
  r2.`Username`,
  r1.`PhoneNumber`
FROM `Customer_R1` r1
JOIN `Customer_R2` r2 ON r2.`Email` = r1.`Email`;

-- --------------------------------------------------------
-- 3) Order history read model view
--    Consumer: GET /api/profile/orders  (Next.js route handler)
--    Query:    SELECT * FROM vw_order_history
--              WHERE CustomerEmail = ?
--              ORDER BY OrderTimestamp DESC
--              LIMIT ? OFFSET ?
--
--    Group by OrderID in the app layer to build per-order card UI.
--
--    Field decisions:
--      CustomerEmail      - ownership anchor; always filter on this.
--                           Prevents cross-user data exposure at the query level.
--      OrderID            - groups line items into a single order in the app layer.
--      OrderTimestamp     - order date for display and ORDER BY DESC.
--                           Covered by idx_customerorder_email_ts composite index.
--      OrderStatus        - NULL placeholder: CustomerOrder has no status column yet.
--                           Shrikar's sprint task adds pending/paid/ready/picked_up/cancelled.
--                           Placeholder column keeps the API contract shape stable
--                           so the profile page does not break when Shrikar's PR lands.
--      ItemID             - stable FK; used for "view item" catalog deep-links.
--      ItemSKU            - canonical item identifier added by Zaid (sprint 001).
--                           Safer than Name for "order again" links: Name is non-unique
--                           in Item_R1 (e.g. 'Long Grain Rice' has 7 rows at different
--                           prices). SKU uniquely identifies a purchasable variant.
--      OrderedQuantity    - quantity recorded on the order, not current stock.
--      ItemName           - human-readable label for the history card.
--      UnitPrice          - KNOWN GAP: currently Item_R1.Price (today's price).
--                           OrderItem has no PriceAtOrderTime column yet.
--                           Shrikar's commerce contract task should add it.
--                           Update this view to use it once the column exists.
--      ItemCategory       - from Item_R2 via item Name. Enables category grouping/
--                           filtering in the history UI without a per-item query.
--                           LEFT JOIN so items without a matching Item_R2 row are
--                           not silently dropped from history.
--      ItemStillAvailable - Item_R1.IsSelling boolean. Lets the UI render
--                           "order again" vs "no longer available" with no extra query.
-- --------------------------------------------------------

CREATE OR REPLACE VIEW `vw_order_history` AS
SELECT
  co.`CustomerEmail`,
  co.`OrderID`,
  co.`Timestamp`        AS `OrderTimestamp`,
  NULL                  AS `OrderStatus`,          -- placeholder: Shrikar sprint task
  oi.`ItemID`,
  ir1.`SKU`             AS `ItemSKU`,
  oi.`Quantity`         AS `OrderedQuantity`,
  ir1.`Name`            AS `ItemName`,
  ir1.`Price`           AS `UnitPrice`,             -- current price, not price at order time
  ir2.`Category`        AS `ItemCategory`,
  ir1.`IsSelling`       AS `ItemStillAvailable`
FROM `CustomerOrder` co
JOIN `OrderItem`    oi  ON oi.`OrderID`      = co.`OrderID`
                       AND oi.`CustomerEmail` = co.`CustomerEmail`
JOIN `Item_R1`      ir1 ON ir1.`ItemID`       = oi.`ItemID`
LEFT JOIN `Item_R2` ir2 ON ir2.`Name`         = ir1.`Name`;
