-- db/setup_db_users.sql
-- Run ONCE as a MySQL admin (root) to create least-privileged application users.
-- Replace every '...' with a strong, unique password.
-- Usage: mysql -u root -p < db/setup_db_users.sql

-- ---------------------------------------------------------------------------
-- App runtime user: read/write, no DDL, no DROP
-- ---------------------------------------------------------------------------
CREATE USER IF NOT EXISTS 'km_app'@'%' IDENTIFIED BY '...';

GRANT SELECT, INSERT, UPDATE
  ON hgr9ba_b.*
  TO 'km_app'@'%';

-- Allow DELETE only on audit/log tables where old rows are pruned by the app
GRANT DELETE ON hgr9ba_b.UpdateCart        TO 'km_app'@'%';
GRANT DELETE ON hgr9ba_b.UpdateInventory   TO 'km_app'@'%';
GRANT DELETE ON hgr9ba_b.AdminDataOperation TO 'km_app'@'%';

-- ---------------------------------------------------------------------------
-- Migration user: full DDL, only from localhost
-- ---------------------------------------------------------------------------
CREATE USER IF NOT EXISTS 'km_migrate'@'localhost' IDENTIFIED BY '...';
GRANT ALL PRIVILEGES ON hgr9ba_b.* TO 'km_migrate'@'localhost';

-- ---------------------------------------------------------------------------
-- Read-only user: reporting, exports, debugging
-- ---------------------------------------------------------------------------
CREATE USER IF NOT EXISTS 'km_readonly'@'localhost' IDENTIFIED BY '...';
GRANT SELECT ON hgr9ba_b.* TO 'km_readonly'@'localhost';

FLUSH PRIVILEGES;
