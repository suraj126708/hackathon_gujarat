# QuickCourt - Basketball Community Platform

A full-stack web application for connecting basketball players and facility owners, built with React frontend and Node.js backend.

## 🏀 Features

- **User Registration & Authentication** with Firebase
- **Email OTP Verification** for secure account creation
- **User Profiles** with customizable information
- **Admin Dashboard** for user management
- **Responsive Design** for mobile and desktop

## 🔐 User Registration Flow

The application follows this secure registration process:

1. **User fills registration form** with email, password, and profile details
2. **Backend sends 6-digit OTP** to user's email address
3. **User enters OTP** in verification page
4. **Backend verifies OTP** and creates user account
5. **User is redirected** to landing page upon successful verification

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Gmail account with App Password
- Firebase project

### Backend Setup

1. **Clone and install dependencies:**

   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**

   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

3. **Set up email configuration:**

   - Enable 2FA on Gmail
   - Generate App Password
   - Add to .env file

4. **Start the server:**

   ```bash
   npm run dev
   ```

5. **Test email functionality:**
   ```bash
   node test-email.js
   ```

### Frontend Setup

1. **Install dependencies:**

   ```bash
   cd frontend
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

## 📧 Email OTP Configuration

### Required Environment Variables

```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
EMAIL_FROM_NAME=QuickCourt
FRONTEND_URL=http://localhost:5173
```

### Email Setup Steps

1. Enable 2-Factor Authentication on Gmail
2. Generate App Password for Mail
3. Add credentials to .env file
4. Test with `node test-email.js`

## 🔄 API Endpoints

### OTP Management

- `POST /api/otp/send-email` - Send OTP to email
- `POST /api/otp/verify-email` - Verify email OTP
- `POST /api/otp/send` - Send OTP to phone (legacy)
- `POST /api/otp/verify` - Verify phone OTP (legacy)

### Authentication

- `POST /api/auth/register` - Complete user registration
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Admin

- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role

## 🏗️ Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **Authentication**: Firebase Auth
- **Email**: Nodemailer + Gmail SMTP
- **Database**: MongoDB with Mongoose ODM

## 🔒 Security Features

- Firebase token-based authentication
- Email OTP verification (6 digits, 5-minute expiry)
- Rate limiting on OTP attempts (max 3 failures)
- Helmet.js security headers
- CORS configuration
- Input validation with express-validator

## 📱 User Experience

- **Responsive Design**: Works on all device sizes
- **Real-time Validation**: Password strength indicator
- **Smooth Navigation**: Seamless flow between pages
- **Error Handling**: Clear error messages and recovery options
- **Loading States**: Visual feedback during operations

## 🧪 Testing

### Backend Testing

```bash
cd backend
node test-email.js  # Test email functionality
```

### Frontend Testing

```bash
cd frontend
npm run build       # Test build process
```

## 🚀 Deployment

### Backend

- Set `NODE_ENV=production`
- Use Redis for OTP storage (instead of in-memory)
- Configure production MongoDB
- Set up proper CORS origins

### Frontend

- Build with `npm run build`
- Deploy to Vercel, Netlify, or similar
- Update `VITE_API_BASE_URL` for production

## 📝 Development Notes

- OTPs are currently stored in memory (use Redis in production)
- Email templates are basic HTML (customize for production)
- Firebase configuration is hardcoded (move to environment variables)
- Add comprehensive error logging for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.
