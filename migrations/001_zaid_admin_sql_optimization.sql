-- Kings Market SQL Optimization Sprint (Zaid scope)
-- Minimal class-project migration:
-- 1) Add stable item identity (`SKU`) for inventory operations.
-- 2) Add a simple admin import/export run log.

START TRANSACTION;

-- --------------------------------------------------------
-- 1) Item identity groundwork: add SKU to Item_R1
-- --------------------------------------------------------

ALTER TABLE `Item_R1`
  ADD COLUMN `SKU` varchar(64) NULL AFTER `ItemID`;

-- Deterministic backfill based on existing primary key.
UPDATE `Item_R1`
SET `SKU` = CONCAT('KM-', LPAD(`ItemID`, 6, '0'))
WHERE `SKU` IS NULL;

ALTER TABLE `Item_R1`
  MODIFY `SKU` varchar(64) NOT NULL;

ALTER TABLE `Item_R1`
  ADD UNIQUE KEY `uq_item_r1_sku` (`SKU`);

-- --------------------------------------------------------
-- 2) Basic admin import/export operation logging
-- --------------------------------------------------------

CREATE TABLE `AdminDataOperation` (
  `OperationID` bigint NOT NULL AUTO_INCREMENT,
  `StorekeeperEmail` varchar(255) NOT NULL,
  `OperationType` enum('import','export') NOT NULL,
  `EntityType` enum('inventory','transactions') NOT NULL,
  `DataFormat` enum('csv','json','xml','html') NOT NULL,
  `Status` enum('pending','success','failed') NOT NULL DEFAULT 'pending',
  `SourceFilename` varchar(255) DEFAULT NULL,
  `RequestedAt` datetime NOT NULL DEFAULT current_timestamp(),
  `CompletedAt` datetime DEFAULT NULL,
  `Notes` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`OperationID`),
  KEY `idx_adminop_storekeeper_requested` (`StorekeeperEmail`, `RequestedAt`),
  KEY `idx_adminop_status` (`Status`),
  KEY `idx_adminop_type_entity` (`OperationType`, `EntityType`),
  CONSTRAINT `fk_adminop_storekeeper`
    FOREIGN KEY (`StorekeeperEmail`) REFERENCES `Storekeeper_R1` (`Email`)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

COMMIT;
