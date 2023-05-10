-- CreateTable
CREATE TABLE "event_comment" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fk_id_user" INTEGER NOT NULL,
    "fk_id_event" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "starts" INTEGER NOT NULL,

    CONSTRAINT "event_comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_comment_uuid_key" ON "event_comment"("uuid");

-- AddForeignKey
ALTER TABLE "event_comment" ADD CONSTRAINT "event_comment_fk_id_user_fkey" FOREIGN KEY ("fk_id_user") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_comment" ADD CONSTRAINT "event_comment_fk_id_event_fkey" FOREIGN KEY ("fk_id_event") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
