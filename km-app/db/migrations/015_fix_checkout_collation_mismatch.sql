-- 015_fix_checkout_collation_mismatch.sql
-- Fixes checkout failures caused by mixed collations in CustomerEmail comparisons.

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
  WHERE BINARY CustomerEmail = BINARY p_customer_email;

  IF v_item_count = 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cart is empty';
  END IF;

  SELECT EXISTS(
    SELECT 1
    FROM CustomerOrder
    WHERE BINARY CustomerEmail = BINARY p_customer_email
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
  WHERE BINARY tc.CustomerEmail = BINARY p_customer_email;

  DELETE FROM TempCart
  WHERE BINARY CustomerEmail = BINARY p_customer_email;

  SET p_order_id = v_order_id;
END;
