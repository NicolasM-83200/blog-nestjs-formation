/*
  Warnings:

  - You are about to drop the column `isAdmin` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Token_type_idx` ON `Token`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `isAdmin`,
    ADD COLUMN `role` ENUM('admin', 'user') NOT NULL DEFAULT 'user';
