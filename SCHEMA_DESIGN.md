# Service Marketplace MongoDB Schema Documentation

## Overview

This document describes the MongoDB schema design for a service marketplace application where users can register as either normal users or service workers (electricians, plumbers, painters, etc.).

The design follows best practices:
- ✅ Separation of concerns (Users vs WorkerProfiles)
- ✅ No data duplication
- ✅ Secure password storage (hashed with bcrypt)
- ✅ Proper indexing for performance
- ✅ Embedded documents for related data
- ✅ References (ObjectId) for relationships

---

## Collections Structure

### 1. Users Collection

**Purpose**: Stores base identity and authentication data for all users (both regular users and workers)

**Schema**:
```javascript
{
  _id: ObjectId,
  
  // Identity
  fullName: String (required, min 3 chars),
  phoneNumber: String (required, unique, 10 digits),
  isPhoneVerified: Boolean (default: false),
  
  // Email & Authentication
  email: String (optional, unique),
  passwordHash: String (required, never shown in responses),
  
  // Role
  role: enum ['user', 'worker'] (default: 'user'),
  
  // Location (Embedded)
  location: {
    city: String,
    state: String,
    pincode: String,
    addressLine1: String,
    addressLine2: String
  },
  
  // Account Status
  isActive: Boolean (default: true),
  
  // Timestamps
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes**:
```javascript
{ phoneNumber: 1 }      // For phone-based lookups
{ email: 1 }            // For email-based lookups
{ role: 1 }             // For filtering by role
{ createdAt: -1 }       // For sorting
```

**Key Security Features**:
- `passwordHash` is excluded from JSON responses by default
- Passwords hashed using bcrypt (10 salt rounds)
- Never return password in API responses
- Phone number validated as 10 digits
- Email validated with regex

---

### 2. WorkerProfile Collection

**Purpose**: Stores worker-specific data. Only created if user.role === 'worker'

**Schema**:
```javascript
{
  _id: ObjectId,
  
  // Reference to User
  userId: ObjectId (required, unique, ref: 'User'),
  
  // Experience
  experienceYears: Number (default: 0, min: 0),
  
  // Availability
  isAvailable: Boolean (default: true),
  
  // Skills
  skills: [String],  // ['plumbing', 'repairs', 'installation']
  
  // Media (Embedded)
  media: {
    profilePhoto: String (URL only),
    shopPhotos: [String] (URLs only),
    introductoryVideo: String (URL only)
  },
  
  // Certificate (Embedded)
  certificate: {
    fileUrl: String (URL only),
    verifiedAt: Date,
    verifiedBy: ObjectId (Admin user ID)
  },
  
  // Professional Info
  bio: String (max 500 chars),
  hourlyRate: Number (min: 0),
  
  // Rating & Reviews
  rating: {
    averageRating: Number (0-5, default: 0),
    totalReviews: Number (default: 0)
  },
  
  // Verification Status
  isVerified: Boolean (default: false),
  
  // Timestamps
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes**:
```javascript
{ userId: 1 }                    // For quick lookups by user
{ isAvailable: 1 }               // For filtering available workers
{ skills: 1 }                    // For skill-based search
{ isVerified: 1 }                // For filtering verified workers
{ 'rating.averageRating': -1 }   // For sorting by rating
{ userId: 1, isAvailable: 1 }    // Compound index
```

**Key Features**:
- DO NOT store name, phone, email, or address (referenced from User)
- Media stored as URLs only (from S3/CDN)
- Automatic population of user data when queried
- Ratings auto-calculated from reviews

---

## Data Access Patterns

### Registration Flow

**1. Normal User Registration**:
```javascript
// Only create User document
await User.create({
  fullName: 'John User',
  phoneNumber: '9876543210',
  email: 'john@example.com',
  passwordHash: await bcrypt.hash(password, 10),
  role: 'user'
})
```

**2. Worker Registration**:
```javascript
// Step 1: Create User with role: 'worker'
const user = await User.create({
  fullName: 'Raj Electrician',
  phoneNumber: '9876543211',
  email: 'raj@example.com',
  passwordHash: await bcrypt.hash(password, 10),
  role: 'worker',
  location: {
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    addressLine1: 'ABC Street'
  }
})

// Step 2: Create WorkerProfile
const workerProfile = await WorkerProfile.create({
  userId: user._id,
  experienceYears: 5,
  skills: ['electrical-wiring', 'repairs', 'installations'],
  bio: 'Experienced electrician with 5 years',
  hourlyRate: 500
})
```

### Fetching Worker Data

**Get full worker profile**:
```javascript
// WorkerProfile auto-populates User data
const workerProfile = await WorkerProfile.findOne({ userId: userId })
// Returns:
{
  _id: ObjectId,
  userId: {
    _id: ObjectId,
    fullName: 'Raj Electrician',
    phoneNumber: '9876543211',
    email: 'raj@example.com',
    location: { ... }
  },
  experienceYears: 5,
  skills: ['electrical-wiring', 'repairs'],
  rating: { averageRating: 4.5, totalReviews: 12 },
  ...
}
```

### Login Flow

```javascript
// 1. Find user by email or phone
const user = await User.findOne({
  $or: [{ email }, { phoneNumber }]
}).select('+passwordHash')  // Include password for comparison

// 2. Compare password
const isValid = await bcrypt.compare(password, user.passwordHash)

// 3. Return user (without password)
return user.toSafeJSON()  // Custom method removes passwordHash
```

---

## Field Naming Conventions

| SQL | MongoDB | Reason |
|-----|---------|--------|
| user_id | userId | camelCase standard in MongoDB |
| phone_number | phoneNumber | camelCase |
| password_hash | passwordHash | camelCase |
| is_phone_verified | isPhoneVerified | camelCase |
| experience_years | experienceYears | camelCase |
| shop_photos | shopPhotos | camelCase |
| intro_video | introductoryVideo | More descriptive |
| created_at | createdAt | camelCase + Mongoose auto timestamp |
| updated_at | updatedAt | camelCase + Mongoose auto timestamp |

---

## Important Rules

### 1. NO Data Duplication

❌ **WRONG** - Don't store user info in WorkerProfile:
```javascript
{
  userId: ObjectId,
  fullName: 'Name',      // ❌ WRONG - duplicated from User
  phoneNumber: '123',    // ❌ WRONG - duplicated from User
  email: 'abc@xyz.com'   // ❌ WRONG - duplicated from User
}
```

✅ **CORRECT** - Reference via userId:
```javascript
{
  userId: ObjectId,      // ✅ Just the reference
  experienceYears: 5,    // ✅ Worker-specific only
  skills: ['skill1']     // ✅ Worker-specific only
}
```

### 2. Media Storage

✅ **CORRECT** - Store URLs only:
```javascript
media: {
  profilePhoto: 'https://s3.amazonaws.com/bucket/photo.jpg',
  shopPhotos: ['https://s3.amazonaws.com/bucket/shop1.jpg'],
  introductoryVideo: 'https://cdn.example.com/video.mp4'
}
```

❌ **WRONG** - Don't embed file data:
```javascript
media: {
  profilePhoto: <Buffer ...>  // ❌ Never store file data
}
```

### 3. Password Security

✅ **CORRECT** - Never expose hash:
```javascript
return {
  _id: user._id,
  fullName: user.fullName,
  phoneNumber: user.phoneNumber
  // ✅ passwordHash NOT included
}
```

❌ **WRONG**:
```javascript
return {
  ...user,
  passwordHash: user.passwordHash  // ❌ NEVER
}
```

---

## Query Examples

### Find worker by phone and fetch profile
```javascript
const user = await User.findOne({ phoneNumber: '9876543210' })
const workerProfile = await WorkerProfile.findOne({ userId: user._id })
  .populate('userId', 'fullName phoneNumber email location')

// Or with aggregation
const result = await WorkerProfile.aggregate([
  { $match: { userId: user._id } },
  { $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'userDetails'
    }
  }
])
```

### Get all available electricians with avg rating > 4.0
```javascript
const electricians = await WorkerProfile.find({
  skills: 'electrical-wiring',
  isAvailable: true,
  'rating.averageRating': { $gte: 4.0 }
}).populate('userId', 'fullName phoneNumber location')
  .sort({ 'rating.averageRating': -1 })
```

### Search workers by location
```javascript
const workersInCity = await User.find({
  role: 'worker',
  'location.city': 'Mumbai'
})

// Then get their profiles
const profiles = await WorkerProfile.find({
  userId: { $in: workersInCity.map(u => u._id) }
})
```

### Update worker availability
```javascript
await WorkerProfile.findOneAndUpdate(
  { userId: userId },
  { isAvailable: false },
  { new: true }
)
```

---

## API Endpoints Pattern

### User Endpoints
```
POST   /api/users/register     - Create new user
POST   /api/users/login        - Login user
GET    /api/users/:id          - Get user profile
PATCH  /api/users/:id          - Update user profile
PATCH  /api/users/:id/password - Change password
DELETE /api/users/:id          - Deactivate account
```

### Worker Endpoints
```
POST   /api/workers            - Create worker profile
GET    /api/workers/:userId    - Get worker profile
PATCH  /api/workers/:userId    - Update worker profile
GET    /api/workers            - List all workers
GET    /api/workers/available  - Get available workers
GET    /api/workers/skills/:skill  - Get workers by skill
PATCH  /api/workers/:userId/media - Upload media
```

---

## Service Layer Methods

### User Service (`user.service.js`)
- `registerUser(userData)` - Register new user
- `loginUser(identifier, password)` - Login user
- `getUserById(userId)` - Fetch user by ID
- `updateUserProfile(userId, updateData)` - Update profile
- `updateUserLocation(userId, locationData)` - Update location
- `updatePassword(userId, oldPassword, newPassword)` - Change password
- `verifyPhoneNumber(userId)` - Mark phone as verified
- `getAllUsers(skip, limit)` - Admin: list all users
- `getWorkerUsers(skip, limit)` - Get all workers

### Worker Service (`worker.service.js`)
- `createWorkerProfile(userId, profileData)` - Create profile
- `getWorkerProfileByUserId(userId)` - Fetch profile
- `updateWorkerProfile(userId, updateData)` - Update profile
- `updateWorkerMedia(userId, mediaData)` - Update media
- `addSkill(userId, skill)` - Add skill
- `removeSkill(userId, skill)` - Remove skill
- `toggleAvailability(userId, isAvailable)` - Set availability
- `getAvailableWorkers(skip, limit)` - List available workers
- `getWorkersBySkill(skill, skip, limit)` - Search by skill
- `getTopWorkers(limit)` - Get top-rated workers
- `updateRating(userId, newRating)` - Update rating

---

## Authentication Utils (`auth.utils.js`)

- `hashPassword(password)` - Hash password with bcrypt
- `comparePassword(plain, hash)` - Verify password match
- `validatePasswordStrength(password)` - Check password requirements

---

## Validation Utils (`validation.utils.js`)

- `validatePhoneNumber(phone)` - 10 digit validation
- `validateEmail(email)` - Email format validation
- `validatePincode(pincode)` - 6 digit pincode
- `validateUrl(url)` - URL format validation
- `validateRole(role)` - Check valid roles

---

## File Structure

```
backend/
├── src/
│   ├── models/
│   │   ├── User.js                 # User schema with auth methods
│   │   ├── Worker.js               # WorkerProfile schema
│   │   └── index.js                # Model exports
│   ├── services/
│   │   ├── user.service.js         # User operations
│   │   ├── worker.service.js       # Worker operations
│   │   └── index.js                # Service exports
│   ├── utils/
│   │   ├── auth.utils.js           # Password hashing & comparison
│   │   ├── validation.utils.js     # Field validations
│   │   └── helpers.js              # Common utilities
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   └── server.js                   # Entry point
└── package.json
```

---

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Start MongoDB
3. ✅ Update `.env` with MONGODB_URL
4. ⚠️ Create API controllers and routes using these services
5. 📝 Add authentication middleware (JWT)
6. 🔒 Add role-based access control (RBAC)
7. 📤 Implement media upload to S3
8. ⭐ Create review/rating system
9. 🔍 Add advanced search and filtering

---

## Summary

**Key Principles**:
- ✅ Users collection: Identity + Auth (no worker-specific data)
- ✅ WorkerProfile collection: Worker-only data (no duplication)
- ✅ Secure passwords: hashed + never exposed
- ✅ Media as URLs: use S3/CDN for file storage
- ✅ Proper indexing: for query performance
- ✅ Service layer: business logic separated from controllers
- ✅ Utils: reusable validation and encryption functions

This schema is production-ready, scalable, and follows MongoDB best practices.
