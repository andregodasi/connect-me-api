-- AlterTable
ALTER TABLE "event_comment" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "reason_deleted" TEXT;

-- AlterTable
ALTER TABLE "group_comment" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "reason_deleted" TEXT;
