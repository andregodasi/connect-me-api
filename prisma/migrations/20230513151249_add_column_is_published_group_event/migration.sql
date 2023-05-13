/*
  Warnings:

  - You are about to drop the column `coverUrl` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `coverUrl` on the `group` table. All the data in the column will be lost.
  - You are about to drop the column `isUsed` on the `recovery_password` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `event_comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `group_comment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "event" DROP CONSTRAINT "event_groupId_fkey";

-- AlterTable
ALTER TABLE "event" DROP COLUMN "coverUrl",
DROP COLUMN "groupId",
ADD COLUMN     "cover_url" TEXT,
ADD COLUMN     "group_id" INTEGER,
ADD COLUMN     "is_publised" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "event_comment" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "group" DROP COLUMN "coverUrl",
ADD COLUMN     "cover_url" TEXT,
ADD COLUMN     "is_publised" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "group_comment" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "recovery_password" DROP COLUMN "isUsed",
ADD COLUMN     "is_used" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
