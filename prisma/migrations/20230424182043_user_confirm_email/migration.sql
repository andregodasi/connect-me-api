-- AlterTable
ALTER TABLE "user" ADD COLUMN     "confirmEmail" BOOLEAN NOT NULL DEFAULT false;

UPDATE "user" SET "confirmEmail" = true WHERE "email" IS NOT NULL;
