/*
  Warnings:

  - You are about to drop the column `whatsapp` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "whatsapp",
ADD COLUMN     "githubBio" TEXT,
ADD COLUMN     "githubFetchedAt" TIMESTAMP(3),
ADD COLUMN     "githubRepos" JSONB,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "openTo" TEXT[],
ADD COLUMN     "role" TEXT,
ADD COLUMN     "yearsExperience" INTEGER;

-- CreateTable
CREATE TABLE "ConnectRequest" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConnectRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConnectRequest_fromId_toId_key" ON "ConnectRequest"("fromId", "toId");

-- AddForeignKey
ALTER TABLE "ConnectRequest" ADD CONSTRAINT "ConnectRequest_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectRequest" ADD CONSTRAINT "ConnectRequest_toId_fkey" FOREIGN KEY ("toId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
