import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';

export const uploadFile = async (file, userId) => {
  try {
    // Create a reference to the file in Firebase Storage
    const storageRef = ref(storage, `users/${userId}/${file.name}`);
    
    // Upload the file
    await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    // Add file metadata to Firestore
    const fileData = {
      name: file.name,
      size: file.size,
      type: file.type,
      url: downloadURL,
      userId: userId,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, 'files'), fileData);
    
    return {
      id: docRef.id,
      ...fileData
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const getUserFiles = async (userId) => {
  try {
    const filesQuery = query(collection(db, 'files'), where('userId', '==', userId));
    const querySnapshot = await getDocs(filesQuery);
    
    const files = [];
    querySnapshot.forEach((doc) => {
      files.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return files;
  } catch (error) {
    console.error('Error getting user files:', error);
    throw error;
  }
};

export const deleteFile = async (fileId, userId) => {
  try {
    // Get the file document from Firestore
    const fileDoc = doc(db, 'files', fileId);
    const fileData = (await getDocs(fileDoc)).data();
    
    // Delete the file from Storage
    const storageRef = ref(storage, `users/${userId}/${fileData.name}`);
    await deleteObject(storageRef);
    
    // Delete the file document from Firestore
    await deleteDoc(fileDoc);
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}; 