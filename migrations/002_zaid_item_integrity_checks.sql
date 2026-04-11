-- DOCUMENTATION ONLY - DO NOT EXECUTE
-- Canonical schema is now maintained directly in `hgr9ba_b.sql`.
-- This file is kept only as historical notes for the SQL optimization sprint.
--
-- Kings Market SQL Optimization Sprint (Zaid scope)
-- Minimal data integrity constraints for admin inventory writes.

ALTER TABLE `Item_R1`
  ADD CONSTRAINT `chk_item_r1_quantity_nonnegative` CHECK (`Quantity` >= 0),
  ADD CONSTRAINT `chk_item_r1_price_nonnegative` CHECK (`Price` >= 0);
