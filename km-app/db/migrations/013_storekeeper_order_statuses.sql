-- 013_storekeeper_order_statuses.sql
-- Adds order workflow status and cancellation reason support.
ALTER TABLE `CustomerOrder`
  ADD COLUMN `Status` enum('pending','processing','ready_for_pickup','picked_up','cancelled')
    NOT NULL DEFAULT 'pending' AFTER `Timestamp`,
  ADD COLUMN `CancelReason` varchar(255) DEFAULT NULL AFTER `Status`,
  ADD COLUMN `StatusUpdatedAt` datetime DEFAULT NULL AFTER `CancelReason`;

ALTER TABLE `CustomerOrder`
  ADD KEY `idx_customerorder_status_timestamp` (`Status`, `Timestamp`);
