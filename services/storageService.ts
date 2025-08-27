import { getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../firebase/config';

// Maximum file size in bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed file types
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Validates the file before upload
 */
const validateFile = (file: File): void => {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error('Only JPG, PNG, and WebP images are allowed');
  }
  
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Image size must be less than 5MB');
  }
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

/**
 * Uploads multiple trip images to Cloudinary
 */
export const uploadTripImages = async (files: File[]): Promise<string[]> => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User must be authenticated to upload images');
  }

  try {
    // Validate all files first
    files.forEach(validateFile);
    
    // Upload files in parallel
    const uploadPromises = files.map(file => {
      const formData = new FormData();
      formData.append('file', file);
      
      return fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
    });
    
    const responses = await Promise.all(uploadPromises);
    
    // Check for any failed uploads
    const results = await Promise.all(
      responses.map(async (response, index) => {
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          console.error(`Failed to upload file ${files[index].name}:`, error);
          return null;
        }
        const data = await response.json();
        return data.url;
      })
    );
    
    // Filter out any failed uploads
    const uploadedUrls = results.filter((url): url is string => url !== null);
    
    if (uploadedUrls.length === 0) {
      throw new Error('All image uploads failed');
    }
    
    return uploadedUrls;
  } catch (error) {
    console.error('Error uploading files:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to upload images');
  }
};

/**
 * Deletes multiple images from Cloudinary
 */
export const deleteTripImages = async (imageUrls: string[]): Promise<void> => {
  try {
    // This would require a server-side API endpoint to handle deletion
    console.warn('Batch image deletion not implemented. Image URLs:', imageUrls);
  } catch (error) {
    console.error('Error deleting images:', error);
    throw new Error('Failed to delete images');
  }
};
