const express = require('express');
const router = express.Router();
const { storage } = require('../storage/gcp_storage'); // Import your GCP storage handler

// Check if file exists in GCP storage
router.get('/files/:filename/exists', async (req, res) => {
  const { filename } = req.params;

  try {
    const bucket = storage.bucket(process.env.GCP_BUCKET_NAME);
    const file = bucket.file(decodeURIComponent(filename)); // Decode the full path

    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({ exists: false, error: 'File not found in GCP storage' });
    }

    res.json({ exists: true });
  } catch (error) {
    console.error('Error checking file existence:', error);
    res.status(500).json({ error: 'Failed to check file existence' });
  }
});

// Confirm file existence after upload
router.post('/confirm-upload', async (req, res) => {
  const { idToken, responseData } = req.body;

  try {
    console.log('Checking file existence for:', responseData.file.uniqueName);

    const confirmResponse = await fetch(`${API_URL}/files/${responseData.file.uniqueName}/exists`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });

    if (!confirmResponse.ok) {
      if (confirmResponse.status === 404) {
        throw new Error('File upload confirmed, but file does not exist in GCP storage.');
      } else {
        throw new Error(`Failed to confirm file existence: ${confirmResponse.status}`);
      }
    }

    const data = await confirmResponse.json();
    res.json({ message: 'File existence confirmed', data });
  } catch (error) {
    console.error('Error confirming file upload:', error);
    res.status(500).json({ error: 'Failed to confirm file upload' });
  }
});

module.exports = router;