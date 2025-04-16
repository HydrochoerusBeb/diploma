/*
  Warnings:

  - You are about to drop the column `avatarUrl` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `avatarUrl` on the `MainCharacter` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Character" DROP COLUMN "avatarUrl",
ADD COLUMN     "avatar" BYTEA;

-- AlterTable
ALTER TABLE "Compain" ALTER COLUMN "self" SET DEFAULT floor(random() * 1000000)::int;

-- AlterTable
ALTER TABLE "MainCharacter" DROP COLUMN "avatarUrl",
ADD COLUMN     "avatar" BYTEA;

-- AlterTable
ALTER TABLE "Party" ALTER COLUMN "self" SET DEFAULT floor(random() * 1000000)::int;
