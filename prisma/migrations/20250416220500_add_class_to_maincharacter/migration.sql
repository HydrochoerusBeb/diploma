/*
  Warnings:

  - Added the required column `description` to the `Character` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level` to the `Character` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Character` table without a default value. This is not possible if the table is not empty.
  - Added the required column `class` to the `MainCharacter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `MainCharacter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level` to the `MainCharacter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `race` to the `MainCharacter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "class" TEXT,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "level" INTEGER NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "occupation" TEXT NOT NULL DEFAULT 'Unknown',
ADD COLUMN     "race" TEXT NOT NULL DEFAULT 'Unknown';

-- AlterTable
ALTER TABLE "Compain" ALTER COLUMN "self" SET DEFAULT floor(random() * 1000000)::int;

-- AlterTable
ALTER TABLE "MainCharacter" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "class" TEXT NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "level" INTEGER NOT NULL,
ADD COLUMN     "race" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Party" ALTER COLUMN "self" SET DEFAULT floor(random() * 1000000)::int;
