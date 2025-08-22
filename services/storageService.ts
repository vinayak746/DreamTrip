import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { getAuth } from 'firebase/auth';

const storage = getStorage();

export const uploadTripImage = async (file: File): Promise<string> => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User must be authenticated to upload images');
  }

  // Create a unique filename
  const fileExt = file.name.split('.').pop();
  const filename = `trip-images/${user.uid}/${uuidv4()}.${fileExt}`;
  const storageRef = ref(storage, filename);

  try {
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};
