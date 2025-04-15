# ☁️ CloudVault – A Secure Cloud-Based File Storage System

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white" alt="Google Cloud" />
</div>

## 📋 Overview

CloudVault is a secure cloud storage application that allows users to upload, manage, and download files with ease. Built with modern web technologies, it provides a seamless experience for storing and accessing your files from anywhere.

## ✨ Features

- **Secure Authentication**: Firebase Authentication for user management
- **File Management**: Upload, download, and delete files
- **Cloud Storage**: Google Cloud Storage integration for reliable file storage
- **Responsive Design**: Works on desktop and mobile devices
- **User-Friendly Interface**: Intuitive UI with clear feedback
- **Real-time Updates**: Instant file list updates

## 🛠️ Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express
- **Authentication**: Firebase Admin SDK
- **Storage**: Google Cloud Storage
- **Styling**: CSS3, Flexbox, Grid

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Cloud account with Storage API enabled
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cloud-vault.git
   cd cloud-vault
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**
   - Create a `.env` file in the backend directory with the following variables:
     ```
     PORT=5001
     ```
   - Create a `.env` file in the frontend directory with the following variables:
     ```
     REACT_APP_API_URL=http://localhost:5001
     ```

4. **Set up Google Cloud Storage**
   - Create a service account in Google Cloud Console
   - Download the service account key JSON file
   - Place it in the `backend` directory as `service-account-key.json`
   - Create a bucket named `cloud-vault-bucket` in Google Cloud Storage

5. **Set up Firebase**
   - Create a Firebase project
   - Enable Authentication with Email/Password provider
   - Download the Firebase Admin SDK service account key
   - Place it in the `backend` directory as `firebase-admin-key.json`

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm start
   ```

3. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`

## 📁 Project Structure

```
cloud-vault/
├── backend/                # Backend server code
│   ├── server.js           # Express server setup
│   ├── service-account-key.json  # Google Cloud service account key
│   └── firebase-admin-key.json   # Firebase Admin SDK key
├── frontend/               # Frontend React application
│   ├── public/             # Static files
│   └── src/                # React source code
│       ├── components/     # React components
│       ├── App.js          # Main application component
│       └── index.js        # Entry point
└── README.md               # Project documentation
```

## 🔒 Security

- All API endpoints are protected with Firebase Authentication
- Files are stored securely in Google Cloud Storage
- Service account keys are kept private and not committed to version control
- CORS is configured to allow only specific origins

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 📝 API Documentation

### Authentication

- **POST /api/auth/register**: Register a new user
- **POST /api/auth/login**: Login an existing user

### Files

- **GET /api/files**: Get list of user's files
- **POST /api/upload**: Upload a new file
- **DELETE /api/files/:fileName**: Delete a file
- **GET /api/files/:filePath*/download**: Get a signed URL for file download

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgments

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Firebase](https://firebase.google.com/)
- [Google Cloud Storage](https://cloud.google.com/storage)

## 📞 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter) - email@example.com

Project Link: [https://github.com/yourusername/cloud-vault](https://github.com/yourusername/cloud-vault)

