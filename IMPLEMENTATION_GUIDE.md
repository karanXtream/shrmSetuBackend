# Service Marketplace MongoDB Implementation Guide

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

This installs:
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `express` - Web framework
- `dotenv` - Environment variables

### 2. Configure Environment

Create or update `.env`:
```env
# MongoDB Connection
MONGODB_URL=mongodb://localhost:27017/shrm-setu-dev

# OR use MongoDB Atlas (recommended for production)
# MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/shrm-setu-dev

# Server
NODE_ENV=development
PORT=5000
```

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service (Windows)
mongod

# Or with Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option B: MongoDB Atlas (Cloud)**
- Go to https://www.mongodb.com/cloud/atlas
- Create cluster
- Get connection string
- Update `.env` with your string

### 4. Start Server
```bash
npm run dev
```

Expected output:
```
✅ Env loaded: true
✅ MongoDB connection successful
✅ Server running on port 5000
```

---

## Schema Structure

### Users Collection

**Fields**:
- `fullName` - User's full name
- `phoneNumber` - 10-digit phone (unique)
- `email` - Email address (optional, unique)
- `passwordHash` - Bcrypt hashed password (never exposed)
- `role` - 'user' or 'worker'
- `location` - { city, state, pincode, addressLine1, addressLine2 }
- `isPhoneVerified` - Boolean
- `isActive` - Boolean (default: true)
- `createdAt`, `updatedAt` - Auto timestamps

**Sample Document**:
```javascript
{
  _id: ObjectId("..."),
  fullName: "Raj Sharma",
  phoneNumber: "9876543210",
  email: "raj@example.com",
  passwordHash: "$2a$10$...",  // Never shown in API
  role: "worker",
  location: {
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    addressLine1: "123 Main Street",
    addressLine2: "Apt 5"
  },
  isPhoneVerified: true,
  isActive: true,
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z")
}
```

### WorkerProfile Collection

**Fields**:
- `userId` - Reference to User (unique, required)
- `experienceYears` - Number of years (default: 0)
- `skills` - Array of skills
- `bio` - Professional bio (max 500 chars)
- `hourlyRate` - Hourly rate in currency
- `isAvailable` - Boolean (default: true)
- `isVerified` - Boolean (default: false)
- `media` - { profilePhoto, shopPhotos, introductoryVideo }
- `certificate` - { fileUrl, verifiedAt, verifiedBy }
- `rating` - { averageRating, totalReviews }
- `createdAt`, `updatedAt` - Auto timestamps

**Sample Document**:
```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),  // Reference to User
  experienceYears: 5,
  skills: ["electrical-wiring", "repairs", "installation"],
  bio: "Licensed electrician with 5 years experience",
  hourlyRate: 500,
  isAvailable: true,
  isVerified: true,
  media: {
    profilePhoto: "https://s3.example.com/photo.jpg",
    shopPhotos: [
      "https://s3.example.com/shop1.jpg",
      "https://s3.example.com/shop2.jpg"
    ],
    introductoryVideo: "https://cdn.example.com/intro.mp4"
  },
  certificate: {
    fileUrl: "https://s3.example.com/certificate.pdf",
    verifiedAt: ISODate("2024-01-10T00:00:00Z"),
    verifiedBy: ObjectId("...")
  },
  rating: {
    averageRating: 4.7,
    totalReviews: 23
  },
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z")
}
```

---

## API Usage Examples

### User Registration

```javascript
// Register as normal user
POST /api/auth/register
{
  "fullName": "John User",
  "phoneNumber": "9876543210",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "user"
}

Response:
{
  "_id": "507f1f77bcf86cd799439011",
  "fullName": "John User",
  "phoneNumber": "9876543210",
  "email": "john@example.com",
  "role": "user",
  "location": {},
  "isPhoneVerified": false,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Worker Registration

**Step 1: Create user with role 'worker'**
```javascript
POST /api/auth/register
{
  "fullName": "Raj Electrician",
  "phoneNumber": "9876543211",
  "email": "raj@example.com",
  "password": "SecurePass123!",
  "role": "worker"
}
```

**Step 2: Create worker profile**
```javascript
POST /api/workers
Headers: { Authorization: "Bearer token" }

{
  "experienceYears": 5,
  "skills": ["electrical-wiring", "repairs"],
  "bio": "Licensed electrician",
  "hourlyRate": 500
}

Response:
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "Raj Electrician",
    "phoneNumber": "9876543211",
    "email": "raj@example.com",
    "location": {}
  },
  "experienceYears": 5,
  "skills": ["electrical-wiring", "repairs"],
  "bio": "Licensed electrician",
  "hourlyRate": 500,
  "isAvailable": true,
  "rating": { "averageRating": 0, "totalReviews": 0 },
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Login

```javascript
POST /api/auth/login
{
  "identifier": "9876543210",  // Phone or email
  "password": "SecurePass123!"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "Raj Electrician",
    "phoneNumber": "9876543211",
    "role": "worker",
    "location": { ... }
  }
}
```

### Get Worker Profile

```javascript
GET /api/workers/507f1f77bcf86cd799439011
Headers: { Authorization: "Bearer token" }

Response:
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "Raj Electrician",
    "phoneNumber": "9876543211",
    "email": "raj@example.com",
    "location": {
      "city": "Mumbai",
      "state": "Maharashtra"
    }
  },
  "experienceYears": 5,
  "skills": ["electrical-wiring", "repairs"],
  "media": {
    "profilePhoto": "https://s3.example.com/photo.jpg",
    "shopPhotos": ["https://s3.example.com/shop1.jpg"],
    "introductoryVideo": "https://cdn.example.com/video.mp4"
  },
  "rating": { "averageRating": 4.7, "totalReviews": 23 },
  "isAvailable": true,
  "isVerified": true
}
```

### Search Workers by Skill

```javascript
GET /api/workers/search?skill=electrical-wiring&limit=10
Headers: { Authorization: "Bearer token" }

Response:
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "userId": { ... },
    "experienceYears": 5,
    "skills": ["electrical-wiring", "repairs"],
    "rating": { "averageRating": 4.7, "totalReviews": 23 },
    "isAvailable": true
  },
  // ... more workers
]
```

### Update Worker Profile

```javascript
PATCH /api/workers/507f1f77bcf86cd799439011
Headers: { Authorization: "Bearer token" }

{
  "experienceYears": 6,
  "bio": "Senior licensed electrician with 6 years experience",
  "hourlyRate": 600
}
```

---

## Service Methods

### User Service

```javascript
import * as userService from './services/user.service.js'

// Register
const user = await userService.registerUser({
  fullName: 'John',
  phoneNumber: '9876543210',
  email: 'john@example.com',
  password: 'SecurePass123!',
  role: 'user'
})

// Login
const user = await userService.loginUser('9876543210', 'password')

// Get user
const user = await userService.getUserById(userId)

// Update
const updated = await userService.updateUserProfile(userId, {
  fullName: 'John Doe'
})

// Change password
const user = await userService.updatePassword(userId, oldPassword, newPassword)

// Verify phone
await userService.verifyPhoneNumber(userId)

// Count users
const stats = await userService.countUsersByRole()
```

### Worker Service

```javascript
import * as workerService from './services/worker.service.js'

// Create profile
const profile = await workerService.createWorkerProfile(userId, {
  experienceYears: 5,
  skills: ['skill1', 'skill2'],
  bio: 'Bio here',
  hourlyRate: 500
})

// Get profile
const profile = await workerService.getWorkerProfileByUserId(userId)

// Update profile
const updated = await workerService.updateWorkerProfile(userId, {
  experienceYears: 6,
  bio: 'Updated bio'
})

// Add skill
const updated = await workerService.addSkill(userId, 'new-skill')

// Update media
const updated = await workerService.updateWorkerMedia(userId, {
  profilePhoto: 'https://s3.../photo.jpg',
  shopPhotos: ['https://s3.../shop1.jpg'],
  introductoryVideo: 'https://cdn.../video.mp4'
})

// Get available workers
const workers = await workerService.getAvailableWorkers(0, 10)

// Get by skill
const workers = await workerService.getWorkersBySkill('electrical-wiring', 0, 10)

// Get top-rated
const topWorkers = await workerService.getTopWorkers(5)

// Toggle availability
await workerService.toggleAvailability(userId, false)

// User rating
await workerService.updateRating(userId, 4.5)

// Get stats
const stats = await workerService.getWorkerStats(userId)
```

---

## Key Security Features

### 1. Password Hashing
```javascript
// Passwords are NEVER stored in plain text
// Always hashed with bcrypt (10 salt rounds)
const passwordHash = await bcrypt.hash(password, 10)
```

### 2. Never Expose Passwords
```javascript
// user.toSafeJSON() automatically removes passwordHash
return user.toSafeJSON()  // ✅ Safe

// OR select in query
User.findById(id).select('-passwordHash')  // ✅ Safe
```

### 3. Input Validation
```javascript
// All inputs validated before storage
- Phone: 10 digits only
- Email: Valid format
- Pincode: 6 digits (India)
- Password: 8+ chars with uppercase, numbers, special chars
```

### 4. Unique Constraints
```javascript
// Prevent duplicate registrations
- phoneNumber: unique index
- email: unique index
```

---

## Troubleshooting

### "MongoDB connection failed"
- Is MongoDB running? (`mongod` command)
- Check `MONGODB_URL` in `.env`
- Verify MongoDB is accessible

### "Phone number already exists"
- User with this phone already registered
- Use different phone or login with existing account

### "Password doesn't meet requirements"
- Password must be 8+ chars
- Include uppercase, lowercase, numbers, special chars
- Example: `MyPassword123!`

### "Token expired"
- Get new token by logging in again
- Implement refresh token rotation

---

## File Organization

```
backend/
├── src/
│   ├── models/
│   │   ├── User.js              ← User schema with bcrypt
│   │   ├── Worker.js            ← WorkerProfile schema
│   │   └── index.js             ← Export all models
│   ├── services/
│   │   ├── user.service.js      ← User operations
│   │   ├── worker.service.js    ← Worker operations
│   │   └── index.js
│   ├── utils/
│   │   ├── auth.utils.js        ← Password hashing
│   │   ├── validation.utils.js  ← Input validation
│   │   └── helpers.js
│   ├── config/
│   │   └── db.js                ← MongoDB connection
│   ├── middleware/              ← Auth middleware, error handling
│   ├── controllers/             ← API handlers
│   ├── routes/                  ← API routes
│   └── server.js                ← Entry point
├── package.json
├── .env.example
└── SCHEMA_DESIGN.md             ← This document
```

---

## Next Steps

1. ✅ Understand the schema
2. ✅ Review service methods
3. ⚠️ Create API controllers using services
4. 🔐 Add JWT authentication middleware
5. 🎯 Implement role-based access control (RBAC)
6. 📤 Add media upload endpoints (S3 integration)
7. ⭐ Create review/rating system
8. 🔍 Add advanced search / filtering

This implementation provides a solid, secure foundation for your service marketplace!
