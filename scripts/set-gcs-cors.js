const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Try to load .env.local, then .env
if (fs.existsSync(path.resolve(process.cwd(), '.env.local'))) {
  dotenv.config({ path: '.env.local' });
} else if (fs.existsSync(path.resolve(process.cwd(), '.env'))) {
  dotenv.config({ path: '.env' });
}

async function setCors() {
  const bucketName = process.env.GCS_BUCKET_NAME || 'ncgc-storage-bucket';
  console.log(`Targeting bucket: ${bucketName}`);
  
  // Initialize storage
  let storage;
  if (process.env.GCS_CREDENTIALS) {
    try {
      const credentials = JSON.parse(process.env.GCS_CREDENTIALS);
      storage = new Storage({
        projectId: credentials.project_id,
        credentials,
      });
    } catch (error) {
      console.error("Failed to parse GCS_CREDENTIALS:", error);
      storage = new Storage();
    }
  } else {
    storage = new Storage();
  }

  const bucket = storage.bucket(bucketName);

  const corsConfiguration = [
    {
      maxAgeSeconds: 3600,
      method: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
      origin: ['*'], 
      responseHeader: ['Content-Type', 'Authorization', 'Content-Length', 'User-Agent', 'x-goog-resumable'],
    },
  ];

  try {
    // Check if bucket exists
    const [exists] = await bucket.exists();
    if (!exists) {
      console.log(`Bucket ${bucketName} does not exist. Creating it...`);
      try {
        await bucket.create({
          location: 'US', // Or 'EU', or 'ASIA' - defaulting to US standard
          standard: true,
        });
        console.log(`Bucket ${bucketName} created.`);
      } catch (createError) {
        console.error(`Failed to create bucket ${bucketName}:`, createError.message);
        return;
      }
    }

    await bucket.setCorsConfiguration(corsConfiguration);
    console.log(`CORS configuration set for bucket ${bucketName}`);
  } catch (error) {
    console.error('Error setting CORS configuration:', error);
  }
}

setCors();
