-- CreateTable
CREATE TABLE "Degree" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "about" TEXT,
    "keyInformation" TEXT,
    "overview" TEXT,
    "structure" TEXT,
    "admissionRequirements" TEXT,
    "fees" TEXT,
    "scholarships" TEXT,
    "visaInfo" TEXT,
    "workPermit" TEXT,
    "tuitionFee" TEXT,
    "duration" TEXT,
    "applyDate" TEXT,
    "intake" TEXT,
    "campusLocation" TEXT,
    "taughtIn" TEXT,
    "universityAffiliation" TEXT,
    "progression" TEXT,
    "faqs" TEXT,
    "slug" TEXT NOT NULL,
    "level" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Degree_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "citizenship" TEXT,
    "targetCountry" TEXT,
    "status" TEXT NOT NULL DEFAULT 'New',
    "priority" TEXT NOT NULL DEFAULT 'med',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Update" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "image" TEXT,
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "expiryDate" TIMESTAMP(3),
    "ctaText" TEXT,
    "ctaLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Update_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT,
    "phone" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardAction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'task',
    "link" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "priority" TEXT NOT NULL DEFAULT 'med',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Submitted',
    "step" INTEGER NOT NULL DEFAULT 1,
    "appliedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'New',
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "University" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "image" TEXT,
    "websiteUrl" TEXT,
    "description" TEXT,
    "about" TEXT,
    "campusLife" TEXT,
    "admissionCriteria" TEXT,
    "rank" TEXT,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "aiAgentVisible" BOOLEAN NOT NULL DEFAULT true,
    "twoFactorAuth" BOOLEAN NOT NULL DEFAULT false,
    "staffIpFiltering" BOOLEAN NOT NULL DEFAULT false,
    "supportEmail" TEXT NOT NULL DEFAULT 'support@matsols.com',
    "supportPhone" TEXT NOT NULL DEFAULT '+44 123 456 7890',
    "siteName" TEXT NOT NULL DEFAULT 'MATSOLS',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Degree_slug_key" ON "Degree"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardAction" ADD CONSTRAINT "DashboardAction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
