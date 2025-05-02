/*
  Warnings:

  - The `log` column on the `Party` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Compain" ALTER COLUMN "self" SET DEFAULT floor(random() * 1000000)::int;

-- AlterTable
ALTER TABLE "Party" DROP COLUMN "log",
ADD COLUMN     "log" JSONB,
ALTER COLUMN "self" SET DEFAULT floor(random() * 1000000)::int;
