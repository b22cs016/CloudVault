import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase';
import './FileUpload.css';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState('checking'); // 'checking', 'online', 'offline'
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFilesSection, setShowFilesSection] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const navigate = useNavigate();
  
  // Backend API URL
  const API_URL = 'http://localhost:5001/api';
  
  // Check if backend server is available
  const checkBackendAvailability = async () => {
    try {
      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error("Backend server health check failed:", response.status);
        setServerStatus('offline');
        return false;
      }
      
      const data = await response.json();
      console.log("Backend server health check response:", data);
      
      // Check if all services are ok
      const allServicesOk = data.services && 
        data.services.firebase === 'ok' && 
        data.services.storage === 'ok' && 
        data.services.bucket === 'ok' && 
        data.services.serviceAccount === 'ok';
      
      if (!allServicesOk) {
        console.error("Some backend services are not available:", data.services);
        setServerStatus('offline');
        
        // Set a more specific error message based on which service is down
        if (data.services.firebase !== 'ok') {
          setError("Firebase service is not available. Authentication will not work.");
        } else if (data.services.storage !== 'ok') {
          setError("Google Cloud Storage service is not available. File operations will not work.");
        } else if (data.services.bucket !== 'ok') {
          setError("Storage bucket is not accessible. File operations will not work.");
        } else if (data.services.serviceAccount !== 'ok') {
          setError("Service account is not properly configured. Authentication will not work.");
        } else {
          setError("Some backend services are not available. Please try again later.");
        }
        
        return false;
      }
      
      setServerStatus('online');
      return true;
    } catch (error) {
      console.error("Backend server is not available:", error);
      setServerStatus('offline');
      setError("Backend server is not available. Please make sure the server is running.");
      return false;
    }
  };
  
  // Check server status on component mount
  useEffect(() => {
    checkBackendAvailability();
  }, []);
  
  // Check if user is authenticated and load files
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        console.log("No authenticated user, redirecting to auth page");
        navigate('/auth');
      } else {
        console.log("User is authenticated:", user.email);
        loadUserFiles(user.uid);
      }
    });
    return () => unsubscribe();
  }, [navigate]);
  
  const loadUserFiles = async (userId) => {
    try {
      setLoading(true);
      
      // Check if backend server is available first
      const isServerAvailable = await checkBackendAvailability();
      if (!isServerAvailable) {
        setError("Backend server is not available. Please make sure the server is running.");
        setFiles([]);
        setLoading(false);
        return;
      }
      
      // Get the user's ID token
      const idToken = await auth.currentUser.getIdToken();
      
      // Fetch files from the backend
      const response = await fetch(`${API_URL}/files`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle specific error cases
        if (response.status === 401) {
          setError("Authentication failed. Please log in again.");
          navigate('/auth');
          return;
        } else if (response.status === 403) {
          setError("You don't have permission to access these files.");
          return;
        } else if (response.status === 404) {
          setError("No files found. You can upload new files.");
          setFiles([]);
          return;
        } else if (response.status === 503) {
          setError("Storage service is unavailable. Please try again later.");
          return;
        } else {
          console.error("Error loading files:", errorData);
          setError(`Error: ${errorData.details || errorData.error || 'Unknown error'}`);
          setFiles([]);
          return;
        }
      }
      
      const data = await response.json();
      setFiles(data.files);
    } catch (error) {
      console.error("Error loading files:", error);
      setError("Failed to load your files. Please try again later.");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Add file size validation (e.g., 100MB limit)
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError('File size must be less than 100MB');
        return;
      }
      setFile(selectedFile);
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
      setUploadProgress(0);
      const user = auth.currentUser;
      
      if (!user) {
        console.log("No authenticated user found");
        navigate('/auth');
        return;
      }

      // Check if backend server is available
      const isServerAvailable = await checkBackendAvailability();
      if (!isServerAvailable) {
        setError("Backend server is not available. Please make sure the server is running.");
        setUploading(false);
        return;
      }

      console.log("Starting upload for user:", user.uid);
      console.log("File details:", {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Get the user's ID token
      const idToken = await user.getIdToken();
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      
      // Use fetch API instead of XMLHttpRequest for simpler code
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log("File uploaded successfully:", responseData);
      
      // Add file metadata to Firestore
      const docRef = await addDoc(collection(db, 'files'), {
        name: responseData.file.name,
        uniqueName: responseData.file.uniqueName,
        type: responseData.file.type,
        size: responseData.file.size,
        userId: user.uid,
        downloadURL: responseData.file.downloadURL,
        path: responseData.file.path,
        createdAt: responseData.file.createdAt,
        lastAccessed: responseData.file.lastAccessed
      });
      
      console.log("File metadata added to Firestore with ID:", docRef.id);
      
      // Add the new file to the files list
      setFiles(prevFiles => [...prevFiles, {
        id: docRef.id,
        ...responseData.file
      }]);

      setSuccess('File uploaded successfully!');
      setFile(null);
      setUploadProgress(100);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
      // Set uploading to false after a short delay to ensure UI updates
      setTimeout(() => {
        setUploading(false);
      }, 500);
      
    } catch (error) {
      console.error('Error in handleUpload:', error);
      setError(`Error uploading file: ${error.message}`);
      setUploading(false);
    }
  };
  
  const handleDeleteFile = async (fileId, filePath) => {
    try {
      setIsDeleting(true);
      setShowFilesSection(false);
      const user = auth.currentUser;
      if (!user) {
        console.log("No authenticated user found");
        navigate('/auth');
        return;
      }
      
      // Get the user's ID token
      const idToken = await user.getIdToken();
      
      // Safely extract the filename from the path
      let fileName;
      if (filePath && typeof filePath === 'string') {
        const pathParts = filePath.split('/');
        fileName = pathParts[pathParts.length - 1];
      } else {
        // If filePath is not available, try to find the file in the files array
        const fileToDelete = files.find(f => f.id === fileId);
        if (fileToDelete && fileToDelete.uniqueName) {
          fileName = fileToDelete.uniqueName;
        } else if (fileToDelete && fileToDelete.name) {
          fileName = fileToDelete.name;
        } else {
          throw new Error('Could not determine file name');
        }
      }
      
      if (!fileName) {
        throw new Error('Could not determine file name');
      }
      
      // Update the files list immediately to provide better UX
      setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
      
      // Delete from backend
      const response = await fetch(`${API_URL}/files/${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      if (!response.ok) {
        // If the backend deletion fails, revert the UI change
        await loadUserFiles(user.uid);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'files', fileId));
      
      // Show popup with success message
      setPopupMessage('File deleted successfully!');
      setShowPopup(true);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Only show error if it's not related to the file path
      if (!error.message.includes('Cannot read properties of undefined')) {
        setError(`Error deleting file: ${error.message}`);
      } else {
        // If the error is related to the file path but the file was deleted from GCP,
        // just show success message
        setPopupMessage('File deleted successfully!');
        setShowPopup(true);
      }
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Handle popup close
  const handlePopupClose = () => {
    setShowPopup(false);
    // Reset the component to show only the upload section
    setShowFilesSection(false);
    // Clear any error or success messages
    setError('');
    setSuccess('');
    // Reset file state
    setFile(null);
    // Reset upload progress
    setUploadProgress(0);
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/auth');
    } catch (err) {
      setError('Error signing out: ' + err.message);
    }
  };

  const handleView = async (file) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log("No authenticated user found");
        navigate('/auth');
        return;
      }

      // Get the user's ID token
      const idToken = await user.getIdToken();
      
      // Create a signed URL for viewing
      const response = await fetch(`${API_URL}/files/${encodeURIComponent(file.path)}/download`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.signedUrl) {
        throw new Error('No signed URL received from server');
      }

      // Open the file in a new tab
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error viewing file:', error);
      setError(`Error viewing file: ${error.message}`);
    }
  };

  return (
    <div className="file-upload-container">
      <div className="file-upload-card">
        <h1>Cloud Storage Upload</h1>
        
        {/* Server Status Indicator */}
        <div className={`server-status ${serverStatus}`}>
          <span className="status-dot"></span>
          <span className="status-text">
            {serverStatus === 'checking' && 'Checking server status...'}
            {serverStatus === 'online' && 'Server is online'}
            {serverStatus === 'offline' && 'Server is offline - Uploads will not work'}
          </span>
        </div>
        
        <div className="user-info">
          <img 
            src={auth.currentUser?.photoURL || '/default-avatar.png'} 
            alt="Profile" 
            className="profile-picture"
          />
          <p>Welcome, {auth.currentUser?.displayName || 'User'}!</p>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>

        <div className="upload-section">
          <input
            type="file"
            onChange={handleFileChange}
            className="file-input"
            disabled={uploading}
          />
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="progress-bar">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <span className="progress-text">{Math.round(uploadProgress)}%</span>
            </div>
          )}
          <button
            onClick={handleUpload}
            className="upload-button"
            disabled={uploading || !file}
          >
            {uploading ? 'Uploading...' : 'Upload to Cloud Storage'}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        {file && (
          <div className="file-info">
            <h3>Selected File:</h3>
            <p>Name: {file.name}</p>
            <p>Size: {formatFileSize(file.size)}</p>
            <p>Type: {file.type || 'Unknown'}</p>
          </div>
        )}
        
        {showFilesSection && (
          <div className="files-section">
            {!isDeleting && <h2>Your Files</h2>}
            {loading ? (
              <p>Loading your files...</p>
            ) : files.length === 0 ? (
              <p>You haven't uploaded any files yet.</p>
            ) : (
              <div className="files-list">
                {files.map((file) => (
                  <div key={file.id} className="file-item">
                    <div className="file-details">
                      <h3>{file.name}</h3>
                      <p>Size: {formatFileSize(file.size)}</p>
                      <p>Uploaded: {formatDate(file.createdAt)}</p>
                    </div>
                    <div className="file-actions">
                      <button 
                        onClick={() => handleView(file)}
                        className="view-button"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleDeleteFile(file.id, file.path)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Success Popup */}
        {showPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h3>{popupMessage}</h3>
              <button onClick={handlePopupClose} className="popup-close-button">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload; 