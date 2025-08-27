import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImage(
  file: File,
  folder: string = 'dreamtrip'
): Promise<{ url: string; public_id: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        format: 'webp',
        quality: 'auto',
        fetch_format: 'auto',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        if (!result) {
          return reject(new Error('No result from Cloudinary'));
        }
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error('Error deleting image from Cloudinary:', error);
        return reject(error);
      }
      if (result?.result === 'ok') {
        resolve();
      } else {
        reject(new Error('Failed to delete image'));
      }
    });
  });
}

export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    crop?: string;
    format?: string;
  } = {}
): string {
  const { width, height, quality = 80, crop = 'fill', format = 'webp' } = options;
  
  const transformations = [
    format && `f_${format}`,
    quality && `q_${quality}`,
    width && `w_${width}`,
    height && `h_${height}`,
    crop && `c_${crop}`,
  ].filter(Boolean).join(',');

  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
}
