CREATE TYPE "public"."activity_type" AS ENUM('run', 'walk', 'ride', 'hike', 'swim');--> statement-breakpoint
ALTER TABLE "user_preferences" RENAME COLUMN "on_boarding" TO "on_boarded";--> statement-breakpoint
ALTER TABLE "activities" ALTER COLUMN "type" SET DATA TYPE "public"."activity_type" USING "type"::"public"."activity_type";