-- DropIndex
DROP INDEX "Compain_self_key";

-- AlterTable
ALTER TABLE "Compain" ALTER COLUMN "self" SET DEFAULT floor(random() * 1000000)::int;
