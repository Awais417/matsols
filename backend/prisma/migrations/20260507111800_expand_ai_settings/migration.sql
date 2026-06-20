-- AlterTable
ALTER TABLE "SystemSetting" ADD COLUMN "aiChatLimit" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN "officeAddress" TEXT NOT NULL DEFAULT 'Birmingham, United Kingdom',
ADD COLUMN "applicationPackages" TEXT NOT NULL DEFAULT '',
ADD COLUMN "staffInfo" TEXT NOT NULL DEFAULT '';
