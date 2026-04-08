/*
  Warnings:

  - You are about to drop the column `user_id` on the `assessments` table. All the data in the column will be lost.
  - You are about to drop the column `opt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `opt_expiry` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[client_id,question_id]` on the table `assessment_details` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Assessments_client_name_key` ON `assessments`;

-- AlterTable
ALTER TABLE `assessment_details` MODIFY `notes` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `assessments` DROP COLUMN `user_id`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `opt`,
    DROP COLUMN `opt_expiry`,
    ADD COLUMN `otp` VARCHAR(191) NULL,
    ADD COLUMN `otp_expiry` DATETIME(3) NULL,
    MODIFY `phone` INTEGER NULL,
    MODIFY `profile_pic` VARCHAR(191) NULL DEFAULT '';

-- CreateTable
CREATE TABLE `assessment_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessment_detail_id` INTEGER NOT NULL,
    `image_url` VARCHAR(191) NOT NULL,
    `answer` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `assessment_details_client_id_question_id_key` ON `assessment_details`(`client_id`, `question_id`);

-- AddForeignKey
ALTER TABLE `assessment_categories` ADD CONSTRAINT `assessment_categories_assessments_id_fkey` FOREIGN KEY (`assessments_id`) REFERENCES `assessments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assessment_categories` ADD CONSTRAINT `assessment_categories_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assessment_details` ADD CONSTRAINT `assessment_details_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `assessments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assessment_details` ADD CONSTRAINT `assessment_details_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assessment_details` ADD CONSTRAINT `assessment_details_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question` ADD CONSTRAINT `question_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assessment_images` ADD CONSTRAINT `assessment_images_assessment_detail_id_fkey` FOREIGN KEY (`assessment_detail_id`) REFERENCES `assessment_details`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
