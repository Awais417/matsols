-- DropIndex
DROP INDEX "Scholarship_degreeId_idx";

-- DropIndex
DROP INDEX "Scholarship_status_idx";

-- DropIndex
DROP INDEX "Scholarship_universityId_idx";

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "gpa" TEXT,
ADD COLUMN     "lastQualification" TEXT,
ADD COLUMN     "programInterest" TEXT;

-- AlterTable
ALTER TABLE "PublicChatSession" ADD COLUMN     "gpa" TEXT,
ADD COLUMN     "lastQualification" TEXT;
