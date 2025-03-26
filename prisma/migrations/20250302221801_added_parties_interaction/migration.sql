/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `partyId` on the `Character` table. All the data in the column will be lost.
  - Added the required column `compainId` to the `Character` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Character` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Compain` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Compain` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Character" DROP CONSTRAINT "Character_partyId_fkey";

-- AlterTable
ALTER TABLE "Character" DROP COLUMN "createdAt",
DROP COLUMN "partyId",
ADD COLUMN     "compainId" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Compain" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "MainCharacter" (
    "id" TEXT NOT NULL,
    "compainId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "MainCharacter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartyCharacter" (
    "partyId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,

    CONSTRAINT "PartyCharacter_pkey" PRIMARY KEY ("partyId","characterId")
);

-- CreateTable
CREATE TABLE "PartyMainCharacter" (
    "partyId" TEXT NOT NULL,
    "mainCharacterId" TEXT NOT NULL,

    CONSTRAINT "PartyMainCharacter_pkey" PRIMARY KEY ("partyId","mainCharacterId")
);

-- AddForeignKey
ALTER TABLE "MainCharacter" ADD CONSTRAINT "MainCharacter_compainId_fkey" FOREIGN KEY ("compainId") REFERENCES "Compain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_compainId_fkey" FOREIGN KEY ("compainId") REFERENCES "Compain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyCharacter" ADD CONSTRAINT "PartyCharacter_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyCharacter" ADD CONSTRAINT "PartyCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyMainCharacter" ADD CONSTRAINT "PartyMainCharacter_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyMainCharacter" ADD CONSTRAINT "PartyMainCharacter_mainCharacterId_fkey" FOREIGN KEY ("mainCharacterId") REFERENCES "MainCharacter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
