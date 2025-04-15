const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();
const port = process.env.PORT || 5001;

// Enable CORS with specific options
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://127.0.0.1:3000', 'http://127.0.0.1:3002'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Initialize Firebase Admin
try {
  const serviceAccount = require('./service-account-key.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

// Check if service account key file exists
const checkServiceAccountKey = () => {
  const keyPath = path.join(__dirname, './service-account-key.json');
  try {
    if (!fs.existsSync(keyPath)) {
      console.error('Service account key file does not exist:', keyPath);
      return false;
    }
    
    const keyContent = fs.readFileSync(keyPath, 'utf8');
    const keyData = JSON.parse(keyContent);
    
    // Check if the key has the required fields
    if (!keyData.project_id || !keyData.private_key || !keyData.client_email) {
      console.error('Service account key is missing required fields');
      return false;
    }
    
    console.log('Service account key file exists and is valid');
    return true;
  } catch (error) {
    console.error('Error checking service account key:', error);
    return false;
  }
};

// Check service account key on server startup
if (!checkServiceAccountKey()) {
  console.error('WARNING: Service account key is invalid or missing. Authentication will fail.');
}

// Initialize Google Cloud Storage
let storage;
try {
  console.log('Attempting to initialize Google Cloud Storage...');
  storage = new Storage({
    keyFilename: path.join(__dirname, './service-account-key.json'),
    projectId: 'cloud-vault-88f26'
  });
  console.log('Google Cloud Storage initialized successfully');
} catch (error) {
  console.error('Error initializing Google Cloud Storage:', error);
  console.error('Error details:', {
    message: error.message,
    code: error.code,
    stack: error.stack
  });
  process.exit(1);
}

const bucket = storage.bucket('cloud-vault-bucket');

// Check if bucket exists and is accessible
const checkBucketAccess = async () => {
  try {
    console.log('Checking bucket access...');
    const [exists] = await bucket.exists();
    if (!exists) {
      console.error('Bucket does not exist or is not accessible');
      return false;
    }
    console.log('Bucket exists and is accessible');
    return true;
  } catch (error) {
    console.error('Error checking bucket access:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return false;
  }
};

// Check bucket access on server startup
checkBucketAccess().then(accessible => {
  if (!accessible) {
    console.error('WARNING: Google Cloud Storage bucket is not accessible. File operations will fail.');
    console.error('Please check your service account key and ensure it has the necessary permissions.');
    console.error('You may need to regenerate your service account key from the Google Cloud Console.');
  }
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// Middleware to verify Firebase ID token
const authenticateUser = async (req, res, next) => {
  try {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check Firebase Admin status
    const firebaseStatus = admin.apps.length > 0 ? 'ok' : 'error';
    
    // Check Google Cloud Storage status
    let storageStatus = 'unknown';
    let bucketStatus = 'unknown';
    
    try {
      // Check if storage is initialized
      if (storage) {
        storageStatus = 'ok';
        
        // Check if bucket exists and is accessible
        const [exists] = await bucket.exists();
        bucketStatus = exists ? 'ok' : 'error';
      } else {
        storageStatus = 'error';
      }
    } catch (error) {
      console.error('Error checking storage status:', error);
      storageStatus = 'error';
      bucketStatus = 'error';
    }
    
    // Check service account key
    const serviceAccountStatus = checkServiceAccountKey() ? 'ok' : 'error';
    
    res.status(200).json({ 
      status: 'ok', 
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      services: {
        firebase: firebaseStatus,
        storage: storageStatus,
        bucket: bucketStatus,
        serviceAccount: serviceAccountStatus
      }
    });
  } catch (error) {
    console.error('Error in health check:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Error checking server health',
      error: error.message
    });
  }
});

// Upload file to Google Cloud Storage
app.post('/api/upload', authenticateUser, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user.uid;
    const fileName = req.body.fileName || req.file.originalname;
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${fileName}`;
    const filePath = `users/${userId}/files/${uniqueFileName}`;
    
    // Create a write stream to Google Cloud Storage
    const file = bucket.file(filePath);
    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
        metadata: {
          userId,
          originalName: fileName,
          uploadedAt: new Date().toISOString(),
          size: req.file.size.toString()
        }
      },
      resumable: false
    });

    // Handle stream events
    stream.on('error', (error) => {
      console.error('Error uploading to GCS:', error);
      res.status(500).json({ error: 'Error uploading file' });
    });

    stream.on('finish', async () => {
      try {
        // Get the public URL without making the file public
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
        
        // Return the file details
        res.status(200).json({
          success: true,
          file: {
            name: fileName,
            uniqueName: uniqueFileName,
            type: req.file.mimetype,
            size: req.file.size,
            userId,
            downloadURL: publicUrl,
            path: filePath,
            createdAt: new Date().toISOString(),
            lastAccessed: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error('Error getting download URL:', error);
        res.status(500).json({ error: 'Error getting download URL' });
      }
    });

    // Pipe the file buffer to the stream
    stream.end(req.file.buffer);
  } catch (error) {
    console.error('Error in upload endpoint:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's files
app.get('/api/files', authenticateUser, async (req, res) => {
  try {
    // Check if bucket is accessible first
    const [bucketExists] = await bucket.exists();
    if (!bucketExists) {
      console.error('Bucket does not exist or is not accessible');
      return res.status(503).json({ 
        error: 'Storage service unavailable',
        details: 'Google Cloud Storage bucket is not accessible'
      });
    }
    
    const userId = req.user.uid;
    console.log(`Attempting to list files for user: ${userId}`);
    
    // List files in the user's directory
    const [files] = await bucket.getFiles({
      prefix: `users/${userId}/files/`
    });
    
    console.log(`Found ${files.length} files for user ${userId}`);
    
    const userFiles = files.map(file => {
      try {
        const metadata = file.metadata;
        console.log(`Processing file: ${file.name}, metadata:`, metadata);
        return {
          name: metadata.originalName || file.name.split('/').pop(),
          uniqueName: file.name.split('/').pop(),
          type: metadata.contentType,
          size: parseInt(metadata.size || '0'),
          userId,
          downloadURL: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
          path: file.name,
          createdAt: metadata.uploadedAt || new Date().toISOString(),
          lastAccessed: new Date().toISOString()
        };
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError);
        // Skip this file but continue processing others
        return null;
      }
    }).filter(file => file !== null); // Remove any null entries from failed processing
    
    console.log(`Successfully processed ${userFiles.length} files for user ${userId}`);
    res.status(200).json({ files: userFiles });
  } catch (error) {
    console.error('Error listing files:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });
    
    // Provide more specific error messages based on the error type
    if (error.code === 'ENOENT') {
      return res.status(404).json({ 
        error: 'Storage path not found',
        details: 'The requested storage path does not exist'
      });
    } else if (error.code === 'PERMISSION_DENIED') {
      return res.status(403).json({ 
        error: 'Permission denied',
        details: 'You do not have permission to access this resource'
      });
    } else if (error.code === 'UNAUTHENTICATED') {
      return res.status(401).json({ 
        error: 'Authentication failed',
        details: 'Your authentication token is invalid or expired'
      });
    } else {
      return res.status(500).json({ 
        error: 'Storage service error',
        details: error.message,
        code: error.code
      });
    }
  }
});

// Delete file
app.delete('/api/files/:fileName', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const fileName = req.params.fileName;
    const filePath = `users/${userId}/files/${fileName}`;
    
    await bucket.file(filePath).delete();
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Generate signed URL for file download
app.get('/api/files/:filePath*/download', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const filePath = req.params.filePath + (req.params[0] || '');
    
    // Verify that the file belongs to the user
    if (!filePath.startsWith(`users/${userId}/`)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const file = bucket.file(filePath);
    
    // Generate a signed URL that expires in 15 minutes
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000 // 15 minutes
    });

    res.json({ signedUrl });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({ error: 'Error generating download URL' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Create server instance
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
  console.log('CORS enabled for origins:', ['http://localhost:3000', 'http://localhost:3002']);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  server.close(() => {
    process.exit(1);
  });
}); 