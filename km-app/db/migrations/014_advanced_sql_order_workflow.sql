-- 014_advanced_sql_order_workflow.sql
-- Advanced SQL features used directly by UI flows:
-- 1) before_orderitem_insert trigger enforces stock + deducts inventory.
-- 2) place_order_from_tempcart stored procedure powers checkout.
-- 3) order-status history trigger enables timeline/status audit in UI.

CREATE TABLE IF NOT EXISTS `TempCart` (
  `CustomerEmail` varchar(255) NOT NULL,
  `ItemID` int(11) NOT NULL,
  `Quantity` int(11) NOT NULL,
  PRIMARY KEY (`CustomerEmail`, `ItemID`),
  KEY `idx_tempcart_item` (`ItemID`),
  CONSTRAINT `fk_tempcart_customer`
    FOREIGN KEY (`CustomerEmail`) REFERENCES `Customer_R1` (`Email`) ON DELETE CASCADE,
  CONSTRAINT `fk_tempcart_item`
    FOREIGN KEY (`ItemID`) REFERENCES `Item_R1` (`ItemID`) ON DELETE RESTRICT,
  CONSTRAINT `chk_tempcart_quantity_positive`
    CHECK (`Quantity` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `OrderStatusHistory` (
  `HistoryID` bigint NOT NULL AUTO_INCREMENT,
  `OrderID` int(11) NOT NULL,
  `CustomerEmail` varchar(255) NOT NULL,
  `OldStatus` enum('pending','processing','ready_for_pickup','picked_up','cancelled') DEFAULT NULL,
  `NewStatus` enum('pending','processing','ready_for_pickup','picked_up','cancelled') NOT NULL,
  `CancelReason` varchar(255) DEFAULT NULL,
  `UpdatedAt` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`HistoryID`),
  KEY `idx_orderstatushistory_order` (`OrderID`, `CustomerEmail`, `UpdatedAt`),
  CONSTRAINT `fk_orderstatushistory_order`
    FOREIGN KEY (`OrderID`, `CustomerEmail`) REFERENCES `CustomerOrder` (`OrderID`, `CustomerEmail`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TRIGGER IF EXISTS `before_orderitem_insert_enforce_stock`;
CREATE TRIGGER `before_orderitem_insert_enforce_stock`
BEFORE INSERT ON `OrderItem`
FOR EACH ROW
BEGIN
  DECLARE current_qty INT;

  IF NEW.Quantity <= 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Quantity must be positive';
  END IF;

  SELECT Quantity INTO current_qty
  FROM Item_R1
  WHERE ItemID = NEW.ItemID
  FOR UPDATE;

  IF current_qty IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Item does not exist';
  END IF;

  IF current_qty < NEW.Quantity THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Insufficient stock for item';
  END IF;

  UPDATE Item_R1
  SET Quantity = Quantity - NEW.Quantity
  WHERE ItemID = NEW.ItemID;
END;

DROP TRIGGER IF EXISTS `after_customerorder_status_update`;
CREATE TRIGGER `after_customerorder_status_update`
AFTER UPDATE ON `CustomerOrder`
FOR EACH ROW
BEGIN
  IF (OLD.Status <> NEW.Status) OR (COALESCE(OLD.CancelReason, '') <> COALESCE(NEW.CancelReason, '')) THEN
    INSERT INTO OrderStatusHistory
      (OrderID, CustomerEmail, OldStatus, NewStatus, CancelReason, UpdatedAt)
    VALUES
      (NEW.OrderID, NEW.CustomerEmail, OLD.Status, NEW.Status, NEW.CancelReason, NOW());
  END IF;
END;

DROP PROCEDURE IF EXISTS `place_order_from_tempcart`;
CREATE PROCEDURE `place_order_from_tempcart`(
  IN p_customer_email VARCHAR(255),
  OUT p_order_id INT
)
BEGIN
  DECLARE v_order_id INT;
  DECLARE v_item_count INT DEFAULT 0;
  DECLARE v_has_pending INT DEFAULT 0;

  SELECT COUNT(*) INTO v_item_count
  FROM TempCart
  WHERE CustomerEmail = p_customer_email;

  IF v_item_count = 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cart is empty';
  END IF;

  SELECT EXISTS(
    SELECT 1
    FROM CustomerOrder
    WHERE CustomerEmail = p_customer_email
      AND Status IN ('pending', 'processing', 'ready_for_pickup')
  ) INTO v_has_pending;

  IF v_has_pending = 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Customer has an active order in progress';
  END IF;

  INSERT INTO CustomerOrder (CustomerEmail, Timestamp, Status, StatusUpdatedAt)
  VALUES (p_customer_email, NOW(), 'pending', NOW());

  SET v_order_id = LAST_INSERT_ID();

  INSERT INTO OrderItem (CustomerEmail, OrderID, ItemID, Quantity)
  SELECT
    p_customer_email,
    v_order_id,
    tc.ItemID,
    tc.Quantity
  FROM TempCart tc
  WHERE tc.CustomerEmail = p_customer_email;

  DELETE FROM TempCart
  WHERE CustomerEmail = p_customer_email;

  SET p_order_id = v_order_id;
END;
