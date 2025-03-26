/*
  Warnings:

  - A unique constraint covering the columns `[self]` on the table `Compain` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Compain" ALTER COLUMN "self" SET DEFAULT floor(random() * 1000000)::int;

-- CreateIndex
CREATE UNIQUE INDEX "Compain_self_key" ON "Compain"("self");
