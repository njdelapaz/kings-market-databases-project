-- 012_tj_combined.sql
-- Combines three TJ migrations into one to resolve duplicate numbering (009/010/011).
-- Fixes CustomerOrder.OrderID AUTO_INCREMENT, ItemRequest.ID AUTO_INCREMENT,
-- and adds Status/ReviewedBy/ReviewedAt review workflow columns to ItemRequest.

-- Fix CustomerOrder.OrderID: ensure AUTO_INCREMENT so inserts without explicit OrderID work.
SET FOREIGN_KEY_CHECKS = 0;
ALTER TABLE `CustomerOrder` MODIFY `OrderID` INT NOT NULL AUTO_INCREMENT;
SET FOREIGN_KEY_CHECKS = 1;

-- Fix ItemRequest.ID: ensure AUTO_INCREMENT so inserts without explicit ID work.
SET FOREIGN_KEY_CHECKS = 0;
ALTER TABLE `ItemRequest` MODIFY `ID` INT NOT NULL AUTO_INCREMENT;
SET FOREIGN_KEY_CHECKS = 1;

-- Add review workflow columns so storekeepers can approve/reject requests.
ALTER TABLE `ItemRequest`
  ADD COLUMN `Status`      enum('pending','approved','rejected') NOT NULL DEFAULT 'pending' AFTER `Description`,
  ADD COLUMN `ReviewedBy`  varchar(255) DEFAULT NULL AFTER `Status`,
  ADD COLUMN `ReviewedAt`  datetime     DEFAULT NULL AFTER `ReviewedBy`;

-- Index for filtering by status on the management page.
ALTER TABLE `ItemRequest`
  ADD KEY `idx_itemrequest_status` (`Status`);
