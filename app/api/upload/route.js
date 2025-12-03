import { storage, bucketName } from "@/lib/gcs";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { filename, contentType } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Missing filename or contentType" }, { status: 400 });
    }

    if (!bucketName) {
      return NextResponse.json({ error: "Server misconfiguration: GCS_BUCKET_NAME is missing" }, { status: 500 });
    }

    // Create a reference to the file
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filename);

    // Generate a signed URL for uploading
    // Valid for 15 minutes
    const [uploadUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType,
    });

    // Generate a signed URL for reading (valid for 7 days)
    // This allows the frontend to display the image immediately after upload
    const [readUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return NextResponse.json({ 
      uploadUrl, 
      readUrl,
      storagePath: filename 
    });

  } catch (error) {
    console.error("GCS Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
