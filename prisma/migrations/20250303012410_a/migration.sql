/*
  Warnings:

  - You are about to drop the column `mema` on the `Compain` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Compain" DROP COLUMN "mema",
ALTER COLUMN "self" SET DEFAULT floor(random() * 1000000)::int;
