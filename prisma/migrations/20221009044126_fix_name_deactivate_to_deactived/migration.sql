/*
  Warnings:

  - The values [DEACTIVATE] on the enum `UserGroupStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserGroupStatus_new" AS ENUM ('PENDING', 'ACTIVATED', 'DEACTIVATED');
ALTER TABLE "user_group" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "user_group" ALTER COLUMN "status" TYPE "UserGroupStatus_new" USING ("status"::text::"UserGroupStatus_new");
ALTER TYPE "UserGroupStatus" RENAME TO "UserGroupStatus_old";
ALTER TYPE "UserGroupStatus_new" RENAME TO "UserGroupStatus";
DROP TYPE "UserGroupStatus_old";
ALTER TABLE "user_group" ALTER COLUMN "status" SET DEFAULT 'ACTIVATED';
COMMIT;
