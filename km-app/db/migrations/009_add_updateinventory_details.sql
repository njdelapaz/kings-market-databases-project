-- 009_add_updateinventory_details.sql
-- Adds optional human-readable detail text for inventory audit events.
ALTER TABLE `UpdateInventory`
  ADD COLUMN `Details` varchar(255) DEFAULT NULL AFTER `Action`;
