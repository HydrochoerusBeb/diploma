/*
  Warnings:

  - Added the required column `userId` to the `Character` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Compain` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `MainCharacter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Party` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Compain" ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "self" SET DEFAULT floor(random() * 1000000)::int;

-- AlterTable
ALTER TABLE "MainCharacter" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Party" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Compain" ADD CONSTRAINT "Compain_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Party" ADD CONSTRAINT "Party_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MainCharacter" ADD CONSTRAINT "MainCharacter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
