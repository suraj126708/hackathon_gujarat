# QuickCourt Booking System Setup Guide

This guide explains how to set up and use the new booking system integrated with Razorpay payments.

## 🚀 Features

- **Court/Turf Booking**: Users can book courts for specific dates and times
- **Real-time Availability**: Check court availability before booking
- **Payment Integration**: Secure payments via Razorpay
- **Booking Management**: View, cancel, and manage bookings
- **Responsive Design**: Works on all devices

## 📋 Prerequisites

1. **Backend Server**: Node.js backend with MongoDB
2. **Frontend**: React frontend with Vite
3. **Razorpay Account**: For payment processing
4. **Firebase**: For user authentication

## 🔧 Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install razorpay
```

### 2. Environment Variables

Create a `.env` file in the backend directory with:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret

# Other existing variables...
MONGODB_URI=your_mongodb_uri
FIREBASE_PROJECT_ID=your_firebase_project_id
# ... etc
```

### 3. New Models Created

- **`models/Booking.js`**: Handles booking data
- **`models/Payment.js`**: Manages payment transactions

### 4. New Controllers

- **`controllers/bookingController.js`**: All booking operations

### 5. New Routes

- **`routes/bookingRoutes.js`**: API endpoints for bookings

### 6. Server Integration

The booking routes are automatically added to `server.js`.

## 🌐 Frontend Setup

### 1. New Pages Created

- **`Pages/CourtBooking.jsx`**: Main booking interface
- **`Pages/BookingSuccess.jsx`**: Success page after payment

### 2. Updated Pages

- **`Pages/Venues.jsx`**: Added "Book Now" buttons
- **`Pages/VenueDetails.jsx`**: Added booking section

### 3. New Routes

```jsx
// Booking routes - require authentication
<Route
  path="/book-court/:groundId"
  element={
    <ProtectedRoute>
      <CourtBooking />
    </ProtectedRoute>
  }
/>
<Route
  path="/booking-success/:bookingId"
  element={
    <ProtectedRoute>
      <BookingSuccess />
    </ProtectedRoute>
  }
/>
```

## 💳 Razorpay Setup

### 1. Test Mode (Recommended for Development)

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up for a test account
3. Get your test API keys:
   - Key ID: `rzp_test_...`
   - Key Secret: `...`

### 2. Production Mode

1. Complete KYC verification
2. Switch to live mode
3. Use live API keys

### 3. Webhook Setup (Optional)

For production, set up webhooks to handle payment status updates automatically.

## 🔐 API Endpoints

### Create Booking

```
POST /api/bookings
Authorization: Bearer <firebase_token>
Body: {
  groundId: "string",
  sport: "string",
  date: "YYYY-MM-DD",
  startTime: "HH:MM",
  duration: number,
  selectedCourts: ["string"],
  numberOfPlayers: number,
  specialRequests: "string"
}
```

### Verify Payment

```
POST /api/bookings/verify-payment
Authorization: Bearer <firebase_token>
Body: {
  bookingId: "string",
  razorpayOrderId: "string",
  razorpayPaymentId: "string",
  razorpaySignature: "string"
}
```

### Get User Bookings

```
GET /api/bookings/user?status=confirmed&page=1&limit=10
Authorization: Bearer <firebase_token>
```

### Cancel Booking

```
PUT /api/bookings/:bookingId/cancel
Authorization: Bearer <firebase_token>
Body: {
  reason: "string"
}
```

## 🎯 How to Use

### 1. User Journey

1. **Browse Venues**: User visits `/venues` page
2. **Select Venue**: Clicks on a venue card
3. **View Details**: Sees venue information at `/venue-details/:groundId`
4. **Book Court**: Clicks "Book Court Now" button
5. **Fill Details**: Completes booking form at `/book-court/:groundId`
6. **Payment**: Completes payment via Razorpay
7. **Confirmation**: Redirected to success page

### 2. Booking Form Fields

- **Sport**: Select from available sports
- **Date**: Choose booking date (future dates only)
- **Start Time**: Select from available time slots
- **Duration**: 1-8 hours
- **Courts**: Select specific courts/tables
- **Players**: Number of players
- **Special Requests**: Any additional requirements

### 3. Payment Flow

1. User fills booking form
2. Backend creates booking and payment records
3. Razorpay order is created
4. User completes payment
5. Payment is verified
6. Booking is confirmed

## 🛡️ Security Features

- **Authentication Required**: All booking operations require Firebase token
- **Input Validation**: Comprehensive validation using express-validator
- **Payment Verification**: Razorpay signature verification
- **Time Slot Validation**: Prevents double bookings
- **Role-based Access**: Ground owners can view their bookings

## 📱 Responsive Design

The booking system is fully responsive and works on:

- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🧪 Testing

### Test Data

Use test Razorpay cards:

- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002

### Test Scenarios

1. **Successful Booking**: Complete booking with successful payment
2. **Failed Payment**: Test payment failure handling
3. **Validation Errors**: Test form validation
4. **Authentication**: Test without valid token
5. **Double Booking**: Test time slot conflicts

## 🚨 Common Issues & Solutions

### 1. Razorpay Not Loading

- Check if Razorpay script is accessible
- Verify API keys are correct
- Check browser console for errors

### 2. Payment Verification Fails

- Ensure signature verification is working
- Check if payment data is complete
- Verify webhook configuration

### 3. Booking Creation Fails

- Check MongoDB connection
- Verify ground exists and is active
- Check time slot availability

### 4. Frontend Errors

- Check API endpoints are correct
- Verify authentication token
- Check browser console for errors

## 🔄 Future Enhancements

1. **Email Notifications**: Send booking confirmations via email
2. **SMS Notifications**: Send reminders via SMS
3. **Calendar Integration**: Sync with Google/Outlook calendars
4. **Recurring Bookings**: Allow weekly/monthly bookings
5. **Group Bookings**: Book multiple courts together
6. **Equipment Rental**: Add sports equipment booking
7. **Coach Booking**: Book sports coaches
8. **Tournament Management**: Organize sports tournaments

## 📞 Support

For technical support or questions:

1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check MongoDB connection and data integrity

## 📚 Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin)
- [Express.js Validation](https://express-validator.github.io/docs/)
- [MongoDB Schema Design](https://docs.mongodb.com/manual/data-modeling/)

---

**Note**: This system is designed for development and testing. For production use, ensure proper security measures, SSL certificates, and production-grade hosting.
