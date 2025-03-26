-- AlterTable
ALTER TABLE "Compain" ALTER COLUMN "self" SET DEFAULT floor(random() * 1000000)::text,
ALTER COLUMN "self" SET DATA TYPE TEXT;
