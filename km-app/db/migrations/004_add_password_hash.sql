-- 004_add_password_hash.sql
-- Adds PasswordHash column to both user tables.
-- Existing accounts have empty hash; they must set a password via a reset flow.
-- The app uses bcryptjs to hash on registration and verify on login.

ALTER TABLE `Customer_R2`
  ADD COLUMN `PasswordHash` varchar(255) NOT NULL DEFAULT '' AFTER `Email`;

ALTER TABLE `Storekeeper_R2`
  ADD COLUMN `PasswordHash` varchar(255) NOT NULL DEFAULT '' AFTER `Email`;
