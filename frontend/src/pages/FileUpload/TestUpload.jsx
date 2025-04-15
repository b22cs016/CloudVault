import React, { useState } from 'react';
import { storage } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../../config/firebase';

const TestUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [downloadURL, setDownloadURL] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');
      setDownloadURL('');
      
      const user = auth.currentUser;
      if (!user) {
        setError('You must be logged in to upload files');
        return;
      }

      console.log('Starting upload test');
      console.log('File:', file.name, file.size, file.type);
      console.log('User:', user.uid);

      // Create a reference to the file in Firebase Storage
      const storageRef = ref(storage, `test/${user.uid}/${file.name}`);
      
      // Upload the file
      console.log('Uploading file...');
      const snapshot = await uploadBytes(storageRef, file);
      console.log('File uploaded successfully:', snapshot);
      
      // Get the download URL
      console.log('Getting download URL...');
      const url = await getDownloadURL(snapshot.ref);
      console.log('Download URL:', url);
      
      setDownloadURL(url);
      setSuccess('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(`Error uploading file: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Test File Upload</h1>
      <p>This is a simple test component to verify Firebase storage functionality.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="file"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ marginBottom: '10px' }}
        />
        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          style={{
            padding: '10px 20px',
            backgroundColor: uploading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: uploading ? 'not-allowed' : 'pointer'
          }}
        >
          {uploading ? 'Uploading...' : 'Upload Test File'}
        </button>
      </div>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ color: 'green', marginBottom: '10px' }}>
          {success}
        </div>
      )}
      
      {downloadURL && (
        <div style={{ marginTop: '20px' }}>
          <h3>Download URL:</h3>
          <a href={downloadURL} target="_blank" rel="noopener noreferrer">
            {downloadURL}
          </a>
        </div>
      )}
    </div>
  );
};

export default TestUpload; 