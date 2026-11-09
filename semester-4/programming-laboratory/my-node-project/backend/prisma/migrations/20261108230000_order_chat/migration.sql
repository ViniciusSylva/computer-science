CREATE TYPE "ChatSenderRole" AS ENUM ('TABLE_CUSTOMER', 'KITCHEN');

CREATE TABLE "OrderChatMessage" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "senderRole" "ChatSenderRole" NOT NULL,
    "senderName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderChatMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OrderChatMessage_orderId_createdAt_idx" ON "OrderChatMessage"("orderId", "createdAt");

ALTER TABLE "OrderChatMessage"
ADD CONSTRAINT "OrderChatMessage_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
