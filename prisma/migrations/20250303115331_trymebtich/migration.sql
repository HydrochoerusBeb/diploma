/*
  Warnings:

  - The `self` column on the `Compain` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Compain" DROP COLUMN "self",
ADD COLUMN     "self" INTEGER NOT NULL DEFAULT floor(random() * 1000000)::int;
