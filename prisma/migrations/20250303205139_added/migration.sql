-- AlterTable
ALTER TABLE "Compain" ALTER COLUMN "self" SET DEFAULT floor(random() * 1000000)::int;

-- AlterTable
ALTER TABLE "Party" ALTER COLUMN "log" DROP NOT NULL;
