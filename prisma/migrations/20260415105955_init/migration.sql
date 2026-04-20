-- AlterTable
ALTER TABLE `assessments` MODIFY `user_id` INTEGER NULL;

-- CreateIndex
CREATE INDEX `assessment_details_client_id_fkey` ON `assessment_details`(`client_id`);

-- AddForeignKey
ALTER TABLE `assessments` ADD CONSTRAINT `assessments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
