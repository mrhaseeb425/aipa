/*
  Warnings:

  - Added the required column `user_id` to the `assessments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `assessment_details` MODIFY `concern_level` INTEGER NULL;

-- AlterTable
ALTER TABLE `assessments` ADD COLUMN `user_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
