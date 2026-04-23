-- 006_add_missing_constraints.sql
-- Adds the constraints that were absent from the original schema.

-- OrderItem: line-item quantity must be at least 1
ALTER TABLE `OrderItem`
  ADD CONSTRAINT `chk_orderitem_quantity`
    CHECK (`Quantity` >= 1);

-- UpdateCart: only the three known cart actions are valid
ALTER TABLE `UpdateCart`
  ADD CONSTRAINT `chk_updatecart_action`
    CHECK (`Action` IN ('Add', 'Remove', 'SetQuantity'));

-- UpdateInventory: only the three known inventory actions are valid
ALTER TABLE `UpdateInventory`
  ADD CONSTRAINT `chk_updateinventory_action`
    CHECK (`Action` IN ('Restock', 'Adjust', 'Stop'));

-- OrderItem: direct FK to Customer_R1 (currently only transitive via CustomerOrder)
ALTER TABLE `OrderItem`
  ADD CONSTRAINT `fk_orderitem_customer`
    FOREIGN KEY (`CustomerEmail`) REFERENCES `Customer_R1` (`Email`);

-- Item_R1.Name must exist in Item_R2, ensuring every item has a known category.
-- Pre-flight check: SELECT DISTINCT Name FROM Item_R1 WHERE Name NOT IN (SELECT Name FROM Item_R2);
-- That query must return 0 rows before this migration is applied.
ALTER TABLE `Item_R1`
  ADD CONSTRAINT `fk_item_r1_r2`
    FOREIGN KEY (`Name`) REFERENCES `Item_R2` (`Name`);
