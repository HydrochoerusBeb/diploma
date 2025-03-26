-- AlterTable
ALTER TABLE "Compain" ADD COLUMN     "mema" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "self" SET DEFAULT floor(random() * 1000000)::int;
