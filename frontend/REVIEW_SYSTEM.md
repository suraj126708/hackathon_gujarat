# Review System Documentation

## Overview

The review system allows users to view existing reviews for venues and add their own reviews with ratings, titles, content, and category-specific ratings.

## Components

### 1. AddReviews Component (`src/components/AddReviews.jsx`)

- **Purpose**: Allows authenticated users to add new reviews
- **Features**:
  - Overall rating (1-5 stars)
  - Optional review title
  - Required review content (10-1000 characters)
  - Optional category ratings (cleanliness, facilities, service, value, atmosphere)
  - Form validation
  - Success/error handling
  - Authentication required

### 2. ReviewsSection Component (`src/components/ReviewsSection.jsx`)

- **Purpose**: Displays existing reviews with advanced features
- **Features**:
  - Review cards with user info, ratings, and content
  - Filtering by rating (1-5 stars or all)
  - Sorting options (newest, oldest, highest, lowest, most helpful)
  - Pagination (5 reviews per page)
  - Helpful/unhelpful voting
  - Review reporting
  - Owner reply display
  - Category ratings display

## Integration in VenueDetails

The review system is integrated into the VenueDetails page with two sections:

1. **ReviewsSection**: Displays existing reviews at the top
2. **AddReviews**: Allows users to add new reviews below

## Backend API Endpoints

### Create Review

- **POST** `/api/reviews`
- **Auth**: Required
- **Body**:
  ```json
  {
    "groundId": "string",
    "rating": 5,
    "title": "Optional title",
    "content": "Review content"
  }
  ```

### Get Reviews by Ground

- **GET** `/api/reviews/ground/:groundId`
- **Query Params**:
  - `page`: Page number (default: 1)
  - `limit`: Reviews per page (default: 10)
  - `rating`: Filter by rating (1-5)
  - `category`: Filter by category
  - `sortBy`: Sort field (createdAt, rating, helpfulCount)
  - `sortOrder`: Sort direction (asc, desc)

### Mark Review Helpful

- **POST** `/api/reviews/:reviewId/helpful`
- **Auth**: Required

### Report Review

- **POST** `/api/reviews/:reviewId/report`
- **Auth**: Required
- **Body**: `{ "reason": "string" }`

## Database Schema

### Review Model Fields

- `reviewId`: Unique identifier
- `ground`: Ground ID reference
- `user`: User ID reference
- `rating`: Overall rating (1-5)
- `title`: Optional review title
- `content`: Review content
- `categoryRatings`: Object with category-specific ratings
- `status`: Review status (pending, approved, rejected, hidden)
- `images`: Array of review images
- `helpfulCount`: Number of helpful votes
- `helpfulUsers`: Array of users who marked as helpful
- `reportCount`: Number of reports
- `ownerReply`: Owner's response to review
- `createdAt`, `updatedAt`: Timestamps

## Features

### For Users

- Add reviews with comprehensive ratings
- View all reviews for a venue
- Filter and sort reviews
- Mark reviews as helpful
- Report inappropriate reviews

### For Venue Owners

- Reply to reviews
- View review analytics

### For Admins

- Moderate reviews
- Handle review reports
- Manage review status

## Usage

1. **Viewing Reviews**: Reviews are automatically displayed on the venue details page
2. **Adding Reviews**: Click "Add Your Review" button and fill out the form
3. **Filtering**: Use the filters button to sort and filter reviews
4. **Interacting**: Mark reviews as helpful or report inappropriate ones

## Authentication

- Adding reviews requires Firebase authentication
- User must be logged in to interact with reviews
- Token is stored in localStorage as "firebaseToken"

## Error Handling

- Form validation with user-friendly error messages
- API error handling with fallback messages
- Network error detection and user guidance

## Styling

- Uses Tailwind CSS for consistent design
- Responsive design for mobile and desktop
- Interactive elements with hover states
- Loading states and success/error indicators
