import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Uploads a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} path - The path where the file should be stored
 * @param {Object} metadata - Additional metadata for the file
 * @returns {Promise<{downloadURL: string, path: string}>} - The download URL and path of the uploaded file
 */
export const uploadFile = async (file, path, metadata = {}) => {
  try {
    console.log('Starting file upload to path:', path);
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Create a reference to the file in Firebase Storage
    const storageRef = ref(storage, path);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      ...metadata
    });
    
    console.log('File uploaded successfully:', snapshot);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL:', downloadURL);
    
    return {
      downloadURL,
      path: snapshot.ref.fullPath
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Gets the download URL for a file in Firebase Storage
 * @param {string} path - The path of the file in Firebase Storage
 * @returns {Promise<string>} - The download URL of the file
 */
export const getFileDownloadURL = async (path) => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting download URL:', error);
    throw error;
  }
}; 