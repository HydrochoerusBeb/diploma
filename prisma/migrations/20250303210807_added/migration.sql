/*
  Warnings:

  - A unique constraint covering the columns `[self]` on the table `Party` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Compain" ALTER COLUMN "self" SET DEFAULT floor(random() * 1000000)::int;

-- AlterTable
ALTER TABLE "Party" ADD COLUMN     "self" INTEGER NOT NULL DEFAULT floor(random() * 1000000)::int;

-- CreateIndex
CREATE UNIQUE INDEX "Party_self_key" ON "Party"("self");
