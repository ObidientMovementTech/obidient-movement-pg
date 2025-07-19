import { updateS3CorsPolicy } from './config/aws.js';

// Script to update S3 CORS policy
const updateCors = async () => {
  console.log('Updating S3 CORS policy...');
  await updateS3CorsPolicy();
  console.log('CORS update completed');
  process.exit(0);
};

updateCors().catch((error) => {
  console.error('Error updating CORS:', error);
  process.exit(1);
});
