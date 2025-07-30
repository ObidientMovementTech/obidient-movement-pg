import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

// Configure AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION_NAME,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configure CORS policy for S3 bucket
export const updateS3CorsPolicy = async () => {
  try {
    const corsConfiguration = {
      CORSRules: [
        {
          AllowedHeaders: ["*"],
          AllowedMethods: ["GET", "HEAD", "POST"],
          AllowedOrigins: [
            "https://member.obidients.com", // Production domain
            "http://localhost:5173", // Local development
            "http://localhost:3000", // Alternative local port
            "http://localhost:4173", // Vite preview
            "http://localhost:5000", // Server proxy
            "https://localhost:5173", // HTTPS local
          ],
          ExposeHeaders: ["ETag"],
          MaxAgeSeconds: 3600,
        },
      ],
    };

    const command = new PutBucketCorsCommand({
      Bucket: process.env.AWS_STORAGE_BUCKET_NAME,
      CORSConfiguration: corsConfiguration,
    });

    await s3Client.send(command);
    console.log("✅ S3 CORS policy updated successfully");
    console.log("📋 Allowed origins:", corsConfiguration.CORSRules[0].AllowedOrigins);
  } catch (error) {
    console.error("❌ Failed to update S3 CORS policy:", error);
    throw error;
  }
};

export default s3Client;
