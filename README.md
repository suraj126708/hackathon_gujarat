# Full-Stack React + Node.js Application with Firebase Authentication

This is a complete full-stack application with React frontend and Node.js backend, featuring Firebase authentication with Google and email/password login.

## Project Structure

```
OdooHackathon/
├── frontend/          # React + Vite application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Home.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── firebase.js
│   │   └── App.jsx
│   └── package.json
├── backend/           # Node.js + Express server
│   ├── server.js
│   ├── env.example
│   └── package.json
└── README.md
```

## Features

- **Frontend (React + Vite)**
  - Modern React with Vite for fast development
  - Material-UI for beautiful components
  - React Router for navigation
  - Firebase Authentication
  - Protected routes
  - Responsive design

- **Backend (Node.js + Express)**
  - Express server with CORS
  - Firebase Admin SDK integration
  - JWT token verification
  - Protected API routes
  - User profile management

- **Authentication**
  - Email/Password registration and login
  - Google OAuth authentication
  - Secure token-based authentication
  - User session management

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase project setup

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable Authentication and add Google provider
4. Create a web app and get the configuration
5. Generate a service account key for the backend

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Update `src/firebase.js` with your Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 3. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file based on `env.example`:

```bash
cp env.example .env
```

Update the `.env` file with your Firebase Admin SDK credentials:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com
PORT=5000
NODE_ENV=development
```

## Running the Application

### Development Mode

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   The server will run on `http://localhost:5000`

2. **Start the frontend development server:**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

### Production Mode

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start the backend:**
   ```bash
   cd backend
   npm start
   ```

## API Endpoints

### Public Routes
- `GET /` - Server status
- `GET /api/profile` - Get user profile (requires authentication)

### Protected Routes (require Firebase token)
- `PUT /api/profile` - Update user profile
- `GET /api/user/:uid` - Get user data by UID

## Frontend Routes

- `/login` - Login page
- `/register` - Registration page
- `/home` - Protected home page (requires authentication)
- `/` - Redirects to login

## Technologies Used

### Frontend
- React 18
- Vite
- React Router DOM
- Material-UI
- Firebase SDK
- Axios

### Backend
- Node.js
- Express.js
- Firebase Admin SDK
- CORS
- dotenv
- bcryptjs
- jsonwebtoken

## Authentication Flow

1. User registers/logs in through Firebase Auth
2. Firebase returns a JWT token
3. Frontend stores the token
4. Backend verifies the token using Firebase Admin SDK
5. Protected routes are accessible with valid token

## Security Features

- Firebase Authentication for secure user management
- JWT token verification on backend
- Protected routes on both frontend and backend
- CORS configuration for API security
- Environment variables for sensitive data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 