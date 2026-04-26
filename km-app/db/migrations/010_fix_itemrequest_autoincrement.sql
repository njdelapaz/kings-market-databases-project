-- 010_fix_itemrequest_autoincrement.sql
-- ItemRequest.ID was defined as plain INT with no AUTO_INCREMENT,
-- causing inserts that omit ID to fail with ERROR 1364.

SET FOREIGN_KEY_CHECKS = 0;
ALTER TABLE `ItemRequest` MODIFY `ID` INT NOT NULL AUTO_INCREMENT;
SET FOREIGN_KEY_CHECKS = 1;
