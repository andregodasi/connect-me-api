-- CreateTable
CREATE TABLE "user_event" (
    "id" SERIAL NOT NULL,
    "fk_id_user" INTEGER NOT NULL,
    "fk_id_event" INTEGER NOT NULL,

    CONSTRAINT "user_event_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_event" ADD CONSTRAINT "user_event_fk_id_user_fkey" FOREIGN KEY ("fk_id_user") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_event" ADD CONSTRAINT "user_event_fk_id_event_fkey" FOREIGN KEY ("fk_id_event") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
