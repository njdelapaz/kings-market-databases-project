-- Kings Market SQL Optimization Sprint (Zaid scope)
-- Focus: item identity normalization groundwork, admin auditability,
-- and rollback-safe import/export operation tracking.
--
-- Notes:
-- 1) This migration is additive and does not remove existing tables.
-- 2) Keep existing UpdateInventory table for backward compatibility.
-- 3) App/API layer should start writing to new operation + audit tables.

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
-- 2) Admin data operation tracking (import/export)
-- --------------------------------------------------------

CREATE TABLE `AdminDataOperation` (
  `OperationID` bigint NOT NULL AUTO_INCREMENT,
  `StorekeeperEmail` varchar(255) NOT NULL,
  `OperationType` enum('import','export') NOT NULL,
  `EntityType` enum('inventory','transactions') NOT NULL,
  `DataFormat` enum('csv','json','xml','html') NOT NULL,
  `Status` enum('pending','validated','applied','failed','rolled_back') NOT NULL DEFAULT 'pending',
  `SourceFilename` varchar(255) DEFAULT NULL,
  `RequestedAt` datetime NOT NULL DEFAULT current_timestamp(),
  `CompletedAt` datetime DEFAULT NULL,
  `TotalRows` int DEFAULT NULL,
  `SuccessRows` int DEFAULT NULL,
  `FailedRows` int DEFAULT NULL,
  `ErrorSummary` text DEFAULT NULL,
  PRIMARY KEY (`OperationID`),
  KEY `idx_adminop_storekeeper_requested` (`StorekeeperEmail`, `RequestedAt`),
  KEY `idx_adminop_status` (`Status`),
  KEY `idx_adminop_type_entity` (`OperationType`, `EntityType`),
  CONSTRAINT `fk_adminop_storekeeper`
    FOREIGN KEY (`StorekeeperEmail`) REFERENCES `Storekeeper_R1` (`Email`)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `AdminDataOperationRowError` (
  `RowErrorID` bigint NOT NULL AUTO_INCREMENT,
  `OperationID` bigint NOT NULL,
  `RowNumber` int NOT NULL,
  `FieldName` varchar(100) DEFAULT NULL,
  `ErrorCode` varchar(64) NOT NULL,
  `ErrorMessage` varchar(500) NOT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`RowErrorID`),
  KEY `idx_adminoperr_operation_row` (`OperationID`, `RowNumber`),
  CONSTRAINT `fk_adminoperr_operation`
    FOREIGN KEY (`OperationID`) REFERENCES `AdminDataOperation` (`OperationID`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 3) Rich inventory audit table for admin changes
-- --------------------------------------------------------

CREATE TABLE `InventoryAuditEvent` (
  `EventID` bigint NOT NULL AUTO_INCREMENT,
  `ItemID` int(11) NOT NULL,
  `StorekeeperEmail` varchar(255) NOT NULL,
  `Action` enum(
    'create',
    'update',
    'soft_disable',
    'import_apply',
    'import_rollback'
  ) NOT NULL,
  `PreviousQuantity` int DEFAULT NULL,
  `NewQuantity` int DEFAULT NULL,
  `PreviousPrice` decimal(10,2) DEFAULT NULL,
  `NewPrice` decimal(10,2) DEFAULT NULL,
  `PreviousIsSelling` tinyint(1) DEFAULT NULL,
  `NewIsSelling` tinyint(1) DEFAULT NULL,
  `SourceOperationID` bigint DEFAULT NULL,
  `Notes` varchar(500) DEFAULT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`EventID`),
  KEY `idx_invaudit_item_created` (`ItemID`, `CreatedAt`),
  KEY `idx_invaudit_storekeeper_created` (`StorekeeperEmail`, `CreatedAt`),
  KEY `idx_invaudit_action` (`Action`),
  CONSTRAINT `fk_invaudit_item`
    FOREIGN KEY (`ItemID`) REFERENCES `Item_R1` (`ItemID`)
    ON DELETE RESTRICT,
  CONSTRAINT `fk_invaudit_storekeeper`
    FOREIGN KEY (`StorekeeperEmail`) REFERENCES `Storekeeper_R1` (`Email`)
    ON DELETE RESTRICT,
  CONSTRAINT `fk_invaudit_source_operation`
    FOREIGN KEY (`SourceOperationID`) REFERENCES `AdminDataOperation` (`OperationID`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

COMMIT;
