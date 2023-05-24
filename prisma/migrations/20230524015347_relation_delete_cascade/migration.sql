-- DropForeignKey
ALTER TABLE "event" DROP CONSTRAINT "event_group_id_fkey";

-- DropForeignKey
ALTER TABLE "event_comment" DROP CONSTRAINT "event_comment_fk_id_event_fkey";

-- DropForeignKey
ALTER TABLE "event_comment" DROP CONSTRAINT "event_comment_fk_id_user_fkey";

-- DropForeignKey
ALTER TABLE "group_comment" DROP CONSTRAINT "group_comment_fk_id_group_fkey";

-- DropForeignKey
ALTER TABLE "group_comment" DROP CONSTRAINT "group_comment_fk_id_user_fkey";

-- DropForeignKey
ALTER TABLE "knowledge" DROP CONSTRAINT "knowledge_fk_id_user_fkey";

-- DropForeignKey
ALTER TABLE "recovery_password" DROP CONSTRAINT "recovery_password_fk_id_user_fkey";

-- DropForeignKey
ALTER TABLE "social_network" DROP CONSTRAINT "social_network_fk_id_user_fkey";

-- DropForeignKey
ALTER TABLE "user_event" DROP CONSTRAINT "user_event_fk_id_event_fkey";

-- DropForeignKey
ALTER TABLE "user_event" DROP CONSTRAINT "user_event_fk_id_user_fkey";

-- DropForeignKey
ALTER TABLE "user_group" DROP CONSTRAINT "user_group_fk_id_group_fkey";

-- DropForeignKey
ALTER TABLE "user_group" DROP CONSTRAINT "user_group_fk_id_user_fkey";

-- AddForeignKey
ALTER TABLE "user_group" ADD CONSTRAINT "user_group_fk_id_user_fkey" FOREIGN KEY ("fk_id_user") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_group" ADD CONSTRAINT "user_group_fk_id_group_fkey" FOREIGN KEY ("fk_id_group") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_event" ADD CONSTRAINT "user_event_fk_id_user_fkey" FOREIGN KEY ("fk_id_user") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_event" ADD CONSTRAINT "user_event_fk_id_event_fkey" FOREIGN KEY ("fk_id_event") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recovery_password" ADD CONSTRAINT "recovery_password_fk_id_user_fkey" FOREIGN KEY ("fk_id_user") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_network" ADD CONSTRAINT "social_network_fk_id_user_fkey" FOREIGN KEY ("fk_id_user") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge" ADD CONSTRAINT "knowledge_fk_id_user_fkey" FOREIGN KEY ("fk_id_user") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_comment" ADD CONSTRAINT "event_comment_fk_id_user_fkey" FOREIGN KEY ("fk_id_user") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_comment" ADD CONSTRAINT "event_comment_fk_id_event_fkey" FOREIGN KEY ("fk_id_event") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_comment" ADD CONSTRAINT "group_comment_fk_id_user_fkey" FOREIGN KEY ("fk_id_user") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_comment" ADD CONSTRAINT "group_comment_fk_id_group_fkey" FOREIGN KEY ("fk_id_group") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
