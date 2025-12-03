import { Storage } from '@google-cloud/storage';

// Initialize storage
// We try to parse the JSON credentials from the environment variable if it exists.
// Otherwise, we let the library handle authentication (e.g., via GOOGLE_APPLICATION_CREDENTIALS file or metadata server).
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
    // Fallback to default auth if parsing fails
    storage = new Storage();
  }
} else {
  // Fallback to default authentication (useful for local dev with key file)
  storage = new Storage();
}

export const bucketName = process.env.GCS_BUCKET_NAME; 
export { storage };
