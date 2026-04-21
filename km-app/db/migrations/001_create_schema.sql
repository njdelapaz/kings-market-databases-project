-- 001_create_schema.sql
-- Creates all tables without PKs, FKs, or indexes (those are in 002).
-- Exception: AdminDataOperation retains its inline PK/KEYs because AUTO_INCREMENT requires a PK.

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

-- Base customer table (Email is the business identity)
CREATE TABLE `Customer_R1` (
  `Email`       varchar(255) NOT NULL,
  `PhoneNumber` varchar(20)  NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Customer username / login layer
CREATE TABLE `Customer_R2` (
  `PhoneNumber` varchar(20)  NOT NULL,
  `Username`    varchar(100) NOT NULL,
  `Email`       varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Base storekeeper table
CREATE TABLE `Storekeeper_R1` (
  `Email`       varchar(255) NOT NULL,
  `PhoneNumber` varchar(20)  NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Storekeeper username / login layer
CREATE TABLE `Storekeeper_R2` (
  `PhoneNumber` varchar(20)  NOT NULL,
  `Email`       varchar(255) NOT NULL,
  `Username`    varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Item category lookup (Name is the natural key shared with Item_R1)
CREATE TABLE `Item_R2` (
  `Name`     varchar(255) NOT NULL,
  `Category` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Inventory items (SKU added in 002 after PK is set)
CREATE TABLE `Item_R1` (
  `ItemID`    int(11)        NOT NULL,
  `Name`      varchar(255)   NOT NULL,
  `Quantity`  int(11)        NOT NULL,
  `Price`     decimal(10,2)  NOT NULL,
  `IsSelling` tinyint(1)     NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Customer orders header
CREATE TABLE `CustomerOrder` (
  `OrderID`       int(11)      NOT NULL,
  `CustomerEmail` varchar(255) NOT NULL,
  `Timestamp`     datetime     NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Order line items
CREATE TABLE `OrderItem` (
  `CustomerEmail` varchar(255) NOT NULL,
  `OrderID`       int(11)      NOT NULL,
  `ItemID`        int(11)      NOT NULL,
  `Quantity`      int(11)      NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Customer item requests (items not yet in inventory)
CREATE TABLE `ItemRequest` (
  `ID`            int(11)      NOT NULL,
  `CustomerEmail` varchar(255) NOT NULL,
  `Name`          varchar(255) NOT NULL,
  `Description`   text         DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Payment info (sensitive columns replaced by token in migration 005)
CREATE TABLE `PaymentInfo` (
  `ID`            int(11)      NOT NULL,
  `CustomerEmail` varchar(255) NOT NULL,
  `Type`          varchar(50)  NOT NULL,
  `Provider`      varchar(50)  NOT NULL,
  `First_Name`    varchar(100) NOT NULL,
  `Last_Name`     varchar(100) NOT NULL,
  `Number`        varchar(25)  NOT NULL,
  `Exp_Date`      date         NOT NULL,
  `CVC`           varchar(10)  NOT NULL,
  `Zip`           varchar(20)  NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Cart event log
CREATE TABLE `UpdateCart` (
  `ItemID`        int(11)      NOT NULL,
  `CustomerEmail` varchar(255) NOT NULL,
  `Action`        varchar(50)  NOT NULL,
  `Timestamp`     datetime     NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Inventory event log
CREATE TABLE `UpdateInventory` (
  `ItemID`           int(11)      NOT NULL,
  `StorekeeperEmail` varchar(255) NOT NULL,
  `Action`           varchar(50)  NOT NULL,
  `Timestamp`        datetime     NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Bulk import/export operations by storekeeper
-- PK/KEYs inline because AUTO_INCREMENT requires a PK in the CREATE statement.
CREATE TABLE `AdminDataOperation` (
  `OperationID`      bigint       NOT NULL AUTO_INCREMENT,
  `StorekeeperEmail` varchar(255) NOT NULL,
  `OperationType`    enum('import','export')             NOT NULL,
  `EntityType`       enum('inventory','transactions')    NOT NULL,
  `DataFormat`       enum('csv','json','xml','html')     NOT NULL,
  `Status`           enum('pending','success','failed')  NOT NULL DEFAULT 'pending',
  `SourceFilename`   varchar(255) DEFAULT NULL,
  `RequestedAt`      datetime     NOT NULL DEFAULT current_timestamp(),
  `CompletedAt`      datetime     DEFAULT NULL,
  `Notes`            varchar(500) DEFAULT NULL,
  PRIMARY KEY (`OperationID`),
  KEY `idx_adminop_storekeeper_requested` (`StorekeeperEmail`, `RequestedAt`),
  KEY `idx_adminop_status`                (`Status`),
  KEY `idx_adminop_type_entity`           (`OperationType`, `EntityType`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
