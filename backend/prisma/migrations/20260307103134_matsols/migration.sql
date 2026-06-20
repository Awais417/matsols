-- CreateTable
CREATE TABLE "PublicChatSession" (
    "id" TEXT NOT NULL,
    "visitorToken" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "programInterest" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AI_ACTIVE',
    "handoffRequestedAt" TIMESTAMP(3),
    "estimatedReplyMin" INTEGER,
    "estimatedReplyMax" INTEGER,
    "assignedAgentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublicChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PublicChatSession_visitorToken_key" ON "PublicChatSession"("visitorToken");

-- AddForeignKey
ALTER TABLE "PublicChatSession" ADD CONSTRAINT "PublicChatSession_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicChatMessage" ADD CONSTRAINT "PublicChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "PublicChatSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
