-- CreateEnum
CREATE TYPE "EventNotificationType" AS ENUM ('NEW_EVENT', 'EVENT_DAY');

-- CreateTable
CREATE TABLE "event_notification" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "type" "EventNotificationType" NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "fk_id_user" INTEGER NOT NULL,
    "fk_id_event" INTEGER NOT NULL,

    CONSTRAINT "event_notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_notification_uuid_key" ON "event_notification"("uuid");

-- AddForeignKey
ALTER TABLE "event_notification" ADD CONSTRAINT "event_notification_fk_id_user_fkey" FOREIGN KEY ("fk_id_user") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_notification" ADD CONSTRAINT "event_notification_fk_id_event_fkey" FOREIGN KEY ("fk_id_event") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
