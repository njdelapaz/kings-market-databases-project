-- 005_restructure_paymentinfo.sql
-- Removes PCI-scope raw card fields and replaces them with a payment provider token.
-- The app must never receive raw card numbers; tokenization is done client-side
-- (e.g. Stripe.js) and the resulting token is stored here.
--
-- Legacy rows: last-4 and expiry are preserved; token set to a placeholder.
-- These legacy tokens are invalid for charging — accounts need to re-add a card.
-- We took out PaymentInfoToken because we're not actually running payment info via stripe for this project, so its an unecessary field.


-- Step 1: add nullable new columns alongside the old ones
ALTER TABLE `PaymentInfo`
  ADD COLUMN `Last4`              char(4)      NULL AFTER `Provider`,
  ADD COLUMN `ExpMonth`           tinyint      NULL AFTER `Last4`,
  ADD COLUMN `ExpYear`            smallint     NULL AFTER `ExpMonth`;

-- Step 2: backfill from legacy data (last 4 of card number, expiry month/year)
UPDATE `PaymentInfo`
SET
  `Last4`              = RIGHT(`Number`, 4),
  `ExpMonth`           = MONTH(`Exp_Date`),
  `ExpYear`            = YEAR(`Exp_Date`);

-- Step 3: enforce NOT NULL now that all rows are populated
ALTER TABLE `PaymentInfo`
  MODIFY `Last4`              char(4)      NOT NULL,
  MODIFY `ExpMonth`           tinyint      NOT NULL,
  MODIFY `ExpYear`            smallint     NOT NULL;

-- Step 4: drop the sensitive PCI-scope columns
ALTER TABLE `PaymentInfo`
  DROP COLUMN `Number`,
  DROP COLUMN `CVC`,
  DROP COLUMN `First_Name`,
  DROP COLUMN `Last_Name`,
  DROP COLUMN `Zip`,
  DROP COLUMN `Exp_Date`;

-- Step 5: add validation constraints on the surviving columns
ALTER TABLE `PaymentInfo`
  ADD CONSTRAINT `chk_payment_type`
    CHECK (`Type` IN ('credit', 'debit')),
  ADD CONSTRAINT `chk_payment_exp_month`
    CHECK (`ExpMonth` BETWEEN 1 AND 12),
  ADD CONSTRAINT `chk_payment_exp_year`
    CHECK (`ExpYear` >= 2024);
