# QuickCourt - Local Sport Booking Application

**Team:** 404_resolve  
**Team Members:**

1. Aditya Deshmukh
2. Suraj Gitte

**Team No:** 90

Deploplyed URL : https://hackathon-gujarat.vercel.app/
( this may take a time sometimes because we have used a render for backend and it has the buffer of 50s if not active for an hour)

---

## Project Overview

our app is a local sport booking application that allows users to book sports grounds, courts, and facilities. The application supports multiple user roles with different access levels and functionalities.

## Application Routes

### 🚀 Public Routes (No Authentication Required)

- **`/`** - Landing page
- **`/venues`** - Browse all available sports venues
- **`/venue-details/:groundId`** - View detailed information about a specific venue

### 🔐 Authentication Routes (Redirects logged-in users)

- **`/login`** - User login page
- **`/register`** - User registration page
- **`/otp-verification`** - OTP verification for registration
- **`/register-success`** - Registration success confirmation
- **`/reset-password`** - Password reset functionality

### 👤 User Profile Routes (Requires Authentication)

- **`/profile`** - Universal profile route (redirects based on user role)
- **`/user-profile`** - Player/User profile page
- **`/owner-profile`** - Facility Owner profile page

### 🏟️ Ground Management Routes (Requires Facility Owner Role)

- **`/add-ground`** - Add new sports ground/facility
- **`/edit-ground/:id`** - Edit existing ground details
- **`/my-grounds`** - View and manage owned grounds

### 📅 Booking Routes (Requires Authentication)

- **`/book-court/:groundId`** - Book a court/ground for specific sport
- **`/booking-success/:bookingId`** - Booking confirmation page

### 👑 Admin Routes (Requires Admin Role)

- **`/admin`** - Admin dashboard for system management

### 🚫 System Routes

- **`/unauthorized`** - Access denied page
- **`/*`** - Fallback route (redirects to home)

## User Roles & Access Levels

### 🎯 **Regular Users (Players)**

- Browse venues and view details
- Book courts/grounds
- Manage personal profile
- View booking history

### 🏢 **Facility Owners**

- All regular user permissions
- Add and manage sports grounds
- Edit ground information
- View ground-specific bookings

### 👑 **Administrators**

- All user and owner permissions
- System-wide management
- User management
- Analytics and reporting

## Technology Stack

### Frontend

- React.js with React Router
- Tailwind CSS for styling
- Context API for state management
- Firebase integration

### Backend

- Node.js with Express.js
- MongoDB with Mongoose
- Firebase Admin for authentication
- Razorpay for payments
- Cloudinary for image management

## Features

### 🔐 Authentication & Security

- Firebase-based user authentication
- Role-based access control
- Protected routes
- OTP verification

### 🏟️ Venue Management

- Multi-sport facility support
- Court/field selection
- Pricing management
- Availability tracking

### 📅 Booking System

- Real-time availability
- Multiple payment methods
- Booking confirmation
- Cancellation handling

### 💳 Payment Integration

- Razorpay payment gateway
- Multiple currency support
- Refund processing
- Payment status tracking

### 📱 User Experience

- Responsive design
- Modern UI/UX
- Real-time updates
- Mobile-friendly interface

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Firebase project
- Razorpay account

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run the application: `npm start`

## Environment Variables

```env
MONGODB_URI=your_mongodb_connection_string
FIREBASE_PROJECT_ID=your_firebase_project_id
RAZORPAY_KEY_ID=your_razorpay_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
```

## Contributing

This project was developed for the Odoo Hackathon by Team 404_resolve.
