-- CreateTable
CREATE TABLE `Token` (
    `token` VARCHAR(191) NOT NULL,
    `type` ENUM('REFRESH', 'FORGOT_PASSWORD', 'ACCOUNT_ACRIVATION') NOT NULL,
    `expiredAt` DATETIME(3) NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Token_token_key`(`token`),
    INDEX `Token_type_idx`(`type`),
    INDEX `Token_userId_idx`(`userId`),
    PRIMARY KEY (`type`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Token` ADD CONSTRAINT `Token_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
