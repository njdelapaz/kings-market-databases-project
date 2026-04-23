-- 007_add_read_views.sql
-- Shared read-model views for the profile and order-history pages.
-- These let Thomas's pages fetch everything in one query instead of N+1 loops.

-- Full order history for a customer.
-- Usage: SELECT * FROM v_customer_order_history WHERE CustomerEmail = ?
CREATE OR REPLACE VIEW `v_customer_order_history` AS
SELECT
    co.CustomerEmail,
    co.OrderID,
    co.Timestamp                          AS OrderTimestamp,
    oi.ItemID,
    oi.Quantity,
    i.Name                                AS ItemName,
    i.Price                               AS ItemPrice,
    ROUND(oi.Quantity * i.Price, 2)       AS LineTotal
FROM CustomerOrder co
JOIN OrderItem oi ON co.OrderID = oi.OrderID AND co.CustomerEmail = oi.CustomerEmail
JOIN Item_R1   i  ON oi.ItemID  = i.ItemID;

-- Per-order summary (one row per order, total cost pre-calculated).
-- Usage: SELECT * FROM v_customer_order_summary WHERE CustomerEmail = ?
CREATE OR REPLACE VIEW `v_customer_order_summary` AS
SELECT
    co.CustomerEmail,
    co.OrderID,
    co.Timestamp                          AS OrderTimestamp,
    COUNT(oi.ItemID)                      AS ItemCount,
    SUM(oi.Quantity)                      AS TotalUnits,
    ROUND(SUM(oi.Quantity * i.Price), 2)  AS OrderTotal
FROM CustomerOrder co
JOIN OrderItem oi ON co.OrderID = oi.OrderID AND co.CustomerEmail = oi.CustomerEmail
JOIN Item_R1   i  ON oi.ItemID  = i.ItemID
GROUP BY co.CustomerEmail, co.OrderID, co.Timestamp;

-- Customer profile — joins both customer tables into one flat row.
-- Usage: SELECT * FROM v_customer_profile WHERE Email = ?
CREATE OR REPLACE VIEW `v_customer_profile` AS
SELECT
    r1.Email,
    r1.PhoneNumber,
    r2.Username
FROM Customer_R1 r1
JOIN Customer_R2 r2 ON r1.Email = r2.Email;
