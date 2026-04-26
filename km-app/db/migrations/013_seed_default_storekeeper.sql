-- 013_seed_default_storekeeper.sql
-- Adds a default demo John Storekeeper account.
-- demo password: Password

INSERT INTO `Storekeeper_R1` (`Email`, `PhoneNumber`)
VALUES ('storekeeper1@gmail.com', '135-792-4680')
ON DUPLICATE KEY UPDATE
  `PhoneNumber` = VALUES(`PhoneNumber`);

INSERT INTO `Storekeeper_R2` (`PhoneNumber`, `Email`, `Username`, `PasswordHash`)
VALUES (
  '135-792-4680',
  'storekeeper1@gmail.com',
  'johnstorekeeper',
  '$2a$12$1orXX1NK7UUOgqcjA6Yi9eL5l3vaO8KFFlcIxqOzwrMaqZE4hKdOO'
)
ON DUPLICATE KEY UPDATE
  `Email`        = VALUES(`Email`),
  `Username`     = VALUES(`Username`),
  `PasswordHash` = VALUES(`PasswordHash`);
