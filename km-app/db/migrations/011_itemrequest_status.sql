-- 011_itemrequest_status.sql
-- Adds review workflow columns to ItemRequest so storekeepers can
-- approve or reject customer item requests and track who acted on them.

ALTER TABLE `ItemRequest`
  ADD COLUMN `Status`      enum('pending','approved','rejected') NOT NULL DEFAULT 'pending' AFTER `Description`,
  ADD COLUMN `ReviewedBy`  varchar(255) DEFAULT NULL AFTER `Status`,
  ADD COLUMN `ReviewedAt`  datetime     DEFAULT NULL AFTER `ReviewedBy`;

-- Index for filtering by status on the management page
ALTER TABLE `ItemRequest`
  ADD KEY `idx_itemrequest_status` (`Status`);
