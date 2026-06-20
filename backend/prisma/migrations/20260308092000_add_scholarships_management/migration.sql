-- CreateTable
CREATE TABLE "Scholarship" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" TEXT,
    "eligibility" TEXT,
    "deadline" TEXT,
    "image" TEXT,
    "ctaLink" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "universityId" TEXT,
    "degreeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scholarship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Scholarship_universityId_idx" ON "Scholarship"("universityId");

-- CreateIndex
CREATE INDEX "Scholarship_degreeId_idx" ON "Scholarship"("degreeId");

-- CreateIndex
CREATE INDEX "Scholarship_status_idx" ON "Scholarship"("status");

-- AddForeignKey
ALTER TABLE "Scholarship" ADD CONSTRAINT "Scholarship_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scholarship" ADD CONSTRAINT "Scholarship_degreeId_fkey" FOREIGN KEY ("degreeId") REFERENCES "Degree"("id") ON DELETE SET NULL ON UPDATE CASCADE;
