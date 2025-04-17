-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "alive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Compain" ALTER COLUMN "self" SET DEFAULT floor(random() * 1000000)::int;

-- AlterTable
ALTER TABLE "MainCharacter" ADD COLUMN     "alive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Party" ALTER COLUMN "self" SET DEFAULT floor(random() * 1000000)::int;
