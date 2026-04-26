-- Fix UpdateCart Timestamp column to DATETIME(6) so NOW(6) inserts are stored
-- with microsecond precision, preventing PRIMARY KEY collisions when multiple
-- cart events occur within the same second for the same (CustomerEmail, ItemID).

ALTER TABLE `UpdateCart`
  MODIFY `Timestamp` datetime(6) NOT NULL DEFAULT current_timestamp(6);
