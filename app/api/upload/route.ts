import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Define Cloudinary upload result type
    interface CloudinaryUploadResult {
      secure_url: string;
      public_id: string;
      [key: string]: any; // For any additional properties
    }

    // Upload to Cloudinary
    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'dreamtrip',
          public_id: `${uuidv4()}-${Date.now()}`,
          resource_type: 'auto',
          format: 'webp',
          quality: 'auto',
        },
        (error: Error | undefined, result: CloudinaryUploadResult | undefined) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result);
          } else {
            reject(new Error('No result from Cloudinary'));
          }
        }
      );
      
      // Create a readable stream from the buffer
      const readable = require('stream').Readable.from(buffer);
      readable.pipe(uploadStream);
    });

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
}

// Add this to prevent Next.js from trying to handle this route with static generation
export const dynamic = 'force-dynamic';
