-- 009_fix_orderid_autoincrement.sql
-- CustomerOrder.OrderID was defined as plain INT with no AUTO_INCREMENT,
-- causing inserts that omit OrderID to fail with ERROR 1364.
-- FK checks must be disabled temporarily because fk_orderitem_order references this column.

SET FOREIGN_KEY_CHECKS = 0;
ALTER TABLE `CustomerOrder` MODIFY `OrderID` INT NOT NULL AUTO_INCREMENT;
SET FOREIGN_KEY_CHECKS = 1;
