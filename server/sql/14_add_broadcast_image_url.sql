-- Add image_url column to adminBroadcasts table for broadcast email images
ALTER TABLE "adminBroadcasts" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
