-- 002_add_indexes_and_constraints.sql
-- Adds PKs, unique keys, secondary indexes, the SKU column, and all FK constraints.
-- Must run after 001 (tables exist) and before 003 (seed data must respect FKs).

-- Customer_R1
ALTER TABLE `Customer_R1`
  ADD PRIMARY KEY (`Email`),
  ADD UNIQUE KEY `uq_customer_r1_phone` (`PhoneNumber`);

-- Customer_R2
ALTER TABLE `Customer_R2`
  ADD PRIMARY KEY (`PhoneNumber`),
  ADD KEY `fk_customer_r2_r1` (`Email`);

ALTER TABLE `Customer_R2`
  ADD CONSTRAINT `fk_customer_r2_r1`
    FOREIGN KEY (`Email`) REFERENCES `Customer_R1` (`Email`) ON DELETE CASCADE;

-- Storekeeper_R1
ALTER TABLE `Storekeeper_R1`
  ADD PRIMARY KEY (`Email`),
  ADD UNIQUE KEY `uq_storekeeper_r1_phone` (`PhoneNumber`);

-- Storekeeper_R2
ALTER TABLE `Storekeeper_R2`
  ADD PRIMARY KEY (`PhoneNumber`),
  ADD KEY `fk_storekeeper_r2_r1` (`Email`);

ALTER TABLE `Storekeeper_R2`
  ADD CONSTRAINT `fk_storekeeper_r2_r1`
    FOREIGN KEY (`Email`) REFERENCES `Storekeeper_R1` (`Email`) ON DELETE CASCADE;

-- Item_R2
ALTER TABLE `Item_R2`
  ADD PRIMARY KEY (`Name`);

-- Item_R1: set PK, auto-generate SKU from ItemID, add unique key + CHECK constraints
-- SKU is a STORED generated column so inserts never need to specify it
-- and the unique constraint is satisfied automatically.
ALTER TABLE `Item_R1`
  ADD PRIMARY KEY (`ItemID`),
  ADD COLUMN `SKU` varchar(64)
      GENERATED ALWAYS AS (CONCAT('KM-', LPAD(`ItemID`, 6, '0'))) STORED
      NOT NULL
      AFTER `ItemID`,
  ADD UNIQUE KEY `uq_item_r1_sku` (`SKU`),
  ADD CONSTRAINT `chk_item_r1_quantity_nonnegative` CHECK (`Quantity` >= 0),
  ADD CONSTRAINT `chk_item_r1_price_nonnegative`   CHECK (`Price`    >= 0);

-- CustomerOrder
ALTER TABLE `CustomerOrder`
  ADD PRIMARY KEY (`OrderID`, `CustomerEmail`),
  ADD KEY `fk_customerorder_customer` (`CustomerEmail`);

ALTER TABLE `CustomerOrder`
  ADD CONSTRAINT `fk_customerorder_customer`
    FOREIGN KEY (`CustomerEmail`) REFERENCES `Customer_R1` (`Email`) ON DELETE CASCADE;

-- ItemRequest
ALTER TABLE `ItemRequest`
  ADD PRIMARY KEY (`ID`, `CustomerEmail`),
  ADD KEY `fk_itemrequest_customer` (`CustomerEmail`);

ALTER TABLE `ItemRequest`
  ADD CONSTRAINT `fk_itemrequest_customer`
    FOREIGN KEY (`CustomerEmail`) REFERENCES `Customer_R1` (`Email`) ON DELETE CASCADE;

-- OrderItem
ALTER TABLE `OrderItem`
  ADD PRIMARY KEY (`CustomerEmail`, `OrderID`, `ItemID`),
  ADD KEY `fk_orderitem_order` (`OrderID`, `CustomerEmail`),
  ADD KEY `fk_orderitem_item`  (`ItemID`);

ALTER TABLE `OrderItem`
  ADD CONSTRAINT `fk_orderitem_item`
    FOREIGN KEY (`ItemID`) REFERENCES `Item_R1` (`ItemID`),
  ADD CONSTRAINT `fk_orderitem_order`
    FOREIGN KEY (`OrderID`, `CustomerEmail`) REFERENCES `CustomerOrder` (`OrderID`, `CustomerEmail`) ON DELETE CASCADE;

-- PaymentInfo
ALTER TABLE `PaymentInfo`
  ADD PRIMARY KEY (`CustomerEmail`, `ID`),
  ADD UNIQUE KEY `uq_paymentinfo_id` (`ID`);

-- Added statement to make ID auto increment
ALTER TABLE `PaymentInfo `
  MODIFY COLUMN `ID` INT(11) NOT NULL AUTO_INCREMENT

-- Added statement to make CustomerEmail unique key, so payment info edits work properly.
ALTER TABLE `PaymentInfo` ADD UNIQUE KEY `unique_customer` (`CustomerEmail`);

ALTER TABLE `PaymentInfo`
  ADD CONSTRAINT `fk_paymentinfo_customer`
    FOREIGN KEY (`CustomerEmail`) REFERENCES `Customer_R1` (`Email`) ON DELETE CASCADE;

-- UpdateCart
ALTER TABLE `UpdateCart`
  ADD PRIMARY KEY (`CustomerEmail`, `ItemID`, `Timestamp`),
  ADD KEY `fk_updatecart_item` (`ItemID`);

ALTER TABLE `UpdateCart`
  ADD CONSTRAINT `fk_updatecart_customer`
    FOREIGN KEY (`CustomerEmail`) REFERENCES `Customer_R1` (`Email`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_updatecart_item`
    FOREIGN KEY (`ItemID`) REFERENCES `Item_R1` (`ItemID`);

-- UpdateInventory
ALTER TABLE `UpdateInventory`
  ADD PRIMARY KEY (`StorekeeperEmail`, `ItemID`, `Timestamp`),
  ADD KEY `fk_updateinventory_item` (`ItemID`);

ALTER TABLE `UpdateInventory`
  ADD CONSTRAINT `fk_updateinventory_item`
    FOREIGN KEY (`ItemID`) REFERENCES `Item_R1` (`ItemID`),
  ADD CONSTRAINT `fk_updateinventory_storekeeper`
    FOREIGN KEY (`StorekeeperEmail`) REFERENCES `Storekeeper_R1` (`Email`) ON DELETE CASCADE;

-- AdminDataOperation FK (PK/KEYs already set inline in CREATE TABLE)
ALTER TABLE `AdminDataOperation`
  ADD CONSTRAINT `fk_adminop_storekeeper`
    FOREIGN KEY (`StorekeeperEmail`) REFERENCES `Storekeeper_R1` (`Email`) ON DELETE RESTRICT;
