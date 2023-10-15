-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationKey" TEXT NOT NULL,
    "isFromMe" BOOLEAN NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "pushName" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);
