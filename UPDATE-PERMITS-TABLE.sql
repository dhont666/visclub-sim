-- ============================================================================
-- VISCLUB SIM - UPDATE PERMITS TABLE
-- ============================================================================
-- Add approval/rejection metadata columns to permits table
-- Run this in phpMyAdmin after creating the database
-- ============================================================================

-- Add new columns if they don't exist
ALTER TABLE `permits`
ADD COLUMN IF NOT EXISTS `approved_by` VARCHAR(100) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `approved_date` DATETIME DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `rejected_by` VARCHAR(100) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `rejected_date` DATETIME DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `rejection_reason` TEXT DEFAULT NULL;

-- Verify columns were added
DESCRIBE `permits`;

-- ============================================================================
-- DONE!
-- ============================================================================
-- The permits table now has columns for tracking:
-- - Who approved/rejected a permit
-- - When it was approved/rejected
-- - Reason for rejection (optional)
-- ============================================================================
