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
          AllowedMethods: ["GET", "HEAD"],
          AllowedOrigins: [
            process.env.CLIENT_URL || "http://localhost:5173",
            "https://d2e8w9vgjfh4nu.cloudfront.net", // Add your CloudFront domain if you have one
            "https://canvas.localhost", // For html2canvas
            "https://localhost:*", // For local development
            "http://localhost:*", // For local development
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
  } catch (error) {
    console.error("❌ Failed to update S3 CORS policy:", error);
  }
};

export default s3Client;
