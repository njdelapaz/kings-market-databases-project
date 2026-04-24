-- 008_nathan_catalog_indexes.sql
-- Catalog-performance indexes for the customer-facing catalog endpoint:
--   - Name   -> supports LIKE/search and ORDER BY name.
--   - Price  -> supports price range filters and ORDER BY price.
--   - (IsSelling, Quantity) -> covers the visibility + stock filter and
--       lets the planner short-circuit when only in-stock items are wanted.
--   - Item_R2 (Category, Name) -> supports category filters and the
--       JOIN back to Item_R1 on Name.

ALTER TABLE `Item_R1`
  ADD KEY `idx_item_r1_isselling_quantity` (`IsSelling`, `Quantity`),
  ADD KEY `idx_item_r1_name`               (`Name`),
  ADD KEY `idx_item_r1_price`              (`Price`);

ALTER TABLE `Item_R2`
  ADD KEY `idx_item_r2_category_name` (`Category`, `Name`);
