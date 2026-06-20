ALTER TABLE "SystemSetting"
DROP COLUMN IF EXISTS "maintenanceMode",
DROP COLUMN IF EXISTS "aiAgentVisible",
DROP COLUMN IF EXISTS "twoFactorAuth",
DROP COLUMN IF EXISTS "staffIpFiltering",
DROP COLUMN IF EXISTS "siteName";
