-- Add tracking_type column, migrate bodyweight data, drop bodyweight column
ALTER TABLE "exercises" ADD COLUMN "tracking_type" TEXT NOT NULL DEFAULT 'weight';

UPDATE "exercises" SET "tracking_type" = 'bodyweight' WHERE "bodyweight" = true;

ALTER TABLE "exercises" DROP COLUMN "bodyweight";
