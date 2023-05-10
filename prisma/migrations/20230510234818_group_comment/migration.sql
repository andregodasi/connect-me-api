-- CreateTable
CREATE TABLE "group_comment" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fk_id_user" INTEGER NOT NULL,
    "fk_id_group" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "starts" INTEGER NOT NULL,

    CONSTRAINT "group_comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "group_comment_uuid_key" ON "group_comment"("uuid");

-- AddForeignKey
ALTER TABLE "group_comment" ADD CONSTRAINT "group_comment_fk_id_user_fkey" FOREIGN KEY ("fk_id_user") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_comment" ADD CONSTRAINT "group_comment_fk_id_group_fkey" FOREIGN KEY ("fk_id_group") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
