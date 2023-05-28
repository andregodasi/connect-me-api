-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('REMOTE', 'IN_PERSON');

-- AlterTable
ALTER TABLE "event" ADD COLUMN     "link" TEXT,
ADD COLUMN     "type" "EventType" NOT NULL DEFAULT 'IN_PERSON',
ALTER COLUMN "address" DROP NOT NULL;
