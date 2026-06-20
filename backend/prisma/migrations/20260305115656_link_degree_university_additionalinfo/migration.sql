-- AlterTable
ALTER TABLE "Degree" ADD COLUMN     "additionalInfo" TEXT,
ADD COLUMN     "universityId" TEXT;

-- AlterTable
ALTER TABLE "University" ADD COLUMN     "additionalInfo" TEXT;

-- AddForeignKey
ALTER TABLE "Degree" ADD CONSTRAINT "Degree_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;
