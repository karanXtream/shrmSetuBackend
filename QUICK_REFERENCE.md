# Service Marketplace MongoDB - Quick Reference

## Collections Overview

| Collection | Purpose | Count | Primary Key |
|-----------|---------|-------|-------------|
| **Users** | Identity + Auth for all users | N users | `_id` |
| **WorkerProfiles** | Worker-only data | W workers | `_id` + `userId (unique)` |

---

## Users Schema (Quick)

```javascript
{
  _id: ObjectId,
  fullName: String (required),
  phoneNumber: String (unique, 10 digits),
  isPhoneVerified: Boolean,
  email: String (unique, optional),
  passwordHash: String (hashed, never exposed),
  role: 'user' | 'worker',
  location: {
    city, state, pincode, addressLine1, addressLine2
  },
  isActive: Boolean,
  createdAt, updatedAt
}
```

---

## WorkerProfile Schema (Quick)

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users, unique),
  experienceYears: Number,
  isAvailable: Boolean,
  skills: ['skill1', 'skill2'],
  media: {
    profilePhoto: 'url',
    shopPhotos: ['url1', 'url2'],
    introductoryVideo: 'url'
  },
  certificate: {
    fileUrl: 'url',
    verifiedAt: Date,
    verifiedBy: ObjectId
  },
  bio: String (max 500),
  hourlyRate: Number,
  rating: {
    averageRating: Number (0-5),
    totalReviews: Number
  },
  isVerified: Boolean,
  createdAt, updatedAt
}
```

---

## User Registration Flow

### Normal User
```javascript
await registerUser({
  fullName: 'John',
  phoneNumber: '9876543210',
  email: 'john@example.com',
  password: 'Secure123!',
  role: 'user'
})
// Creates: User document only
```

### Worker
```javascript
// Step 1: Create user with role: 'worker'
await registerUser({
  fullName: 'Raj Electrician',
  phoneNumber: '9876543211',
  email: 'raj@example.com',
  password: 'Secure123!',
  role: 'worker'
})

// Step 2: Create worker profile
await createWorkerProfile(userId, {
  experienceYears: 5,
  skills: ['electrical-wiring', 'repairs'],
  bio: 'Senior electrician',
  hourlyRate: 500
})
// Creates: User + WorkerProfile documents
```

---

## Key Methods

### User Service

| Method | Purpose | Returns |
|--------|---------|---------|
| `registerUser(data)` | Register new user | User (no password) |
| `loginUser(identifier, password)` | Login user | User (no password) |
| `getUserById(userId)` | Fetch user | User |
| `updateUserProfile(userId, data)` | Update name/email | Updated user |
| `updateUserLocation(userId, location)` | Update address | Updated user |
| `updatePassword(userId, old, new)` | Change password | Updated user |
| `verifyPhoneNumber(userId)` | Mark phone verified | Updated user |
| `countUsersByRole()` | Get user stats | { totalUsers, totalWorkers } |

### Worker Service

| Method | Purpose | Returns |
|--------|---------|---------|
| `createWorkerProfile(userId, data)` | Create profile | WorkerProfile |
| `getWorkerProfileByUserId(userId)` | Fetch profile | WorkerProfile with User data |
| `updateWorkerProfile(userId, data)` | Update profile | Updated profile |
| `addSkill(userId, skill)` | Add skill | Updated profile |
| `removeSkill(userId, skill)` | Remove skill | Updated profile |
| `updateWorkerMedia(userId, media)` | Update photos/video | Updated profile |
| `toggleAvailability(userId, bool)` | Set available/busy | Updated profile |
| `getAvailableWorkers(skip, limit)` | List available | Array of workers |
| `getWorkersBySkill(skill, skip, limit)` | Search by skill | Array of workers |
| `getTopWorkers(limit)` | Get top-rated | Array of workers |
| `updateRating(userId, rating)` | Add rating | Updated profile |

---

## Authentication

### Password Security

```javascript
// Hashing (automatic on save)
import { hashPassword } from './utils/auth.utils.js'
const hash = await hashPassword('password')

// Comparing (for login)
import { comparePassword } from './utils/auth.utils.js'
const isValid = await comparePassword('password', hash)

// Validation
import { validatePasswordStrength } from './utils/auth.utils.js'
const { isValid, errors } = validatePasswordStrength('pass')
// Requires: 8+ chars, uppercase, lowercase, number, special char
```

### Login Flow

```javascript
1. Find user by email/phone
2. Get user with passwordHash selected
3. Compare password with hash
4. Return user without passwordHash
```

---

## Key Rules

1. ✅ **NO data duplication** - Store name/phone in User only
2. ✅ **Media as URLs** - From S3/CDN, not embedded
3. ✅ **Never expose passwordHash** - Always exclude from responses
4. ✅ **Use references** - userId links WorkerProfile to User
5. ✅ **Validate inputs** - Phone, email, pincode formats
6. ✅ **Auto-populate** - WorkerProfile queries include User data

---

## Query Examples

### Find worker and get full profile
```javascript
const profile = await WorkerProfile.findOne({ userId })
  .populate('userId', 'fullName phoneNumber email location')
// Returns worker WITH user data
```

### Get available workers in city
```javascript
const users = await User.find({
  role: 'worker',
  'location.city': 'Mumbai'
})

const profiles = await WorkerProfile.find({
  userId: { $in: users.map(u => u._id) },
  isAvailable: true
})
```

### Search electricians
```javascript
const workers = await WorkerProfile.find({
  skills: 'electrical-wiring',
  isAvailable: true,
  'rating.averageRating': { $gte: 4.0 }
}).sort({ 'rating.averageRating': -1 })
```

---

## Environment Setup

**.env file**:
```env
MONGODB_URL=mongodb://localhost:27017/shrm-setu-dev
NODE_ENV=development
PORT=5000
```

**Or MongoDB Atlas**:
```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/db-name
```

---

## File Structure Reference

```
backend/src/
├── models/
│   ├── User.js           ← User schema + auth methods
│   ├── Worker.js         ← WorkerProfile schema
│   └── index.js
├── services/
│   ├── user.service.js   ← User operations
│   ├── worker.service.js ← Worker operations
│   └── index.js
├── utils/
│   ├── auth.utils.js     ← Password hashing/comparison
│   └── validation.utils.js
└── config/
    └── db.js             ← MongoDB connection
```

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| Connection refused | MongoDB not running | `mongod` or Docker start |
| Phone already exists | Duplicate registration | Use different phone |
| Invalid email | Bad format | Use format `user@example.com` |
| Password weak | Doesn't meet requirements | Add uppercase, number, special char |
| Token not found | Not logged in | Login first |
| Cast error | Invalid ObjectId | Verify ID format |

---

## Testing Workflow

### 1. Register Normal User
```javascript
POST /api/auth/register
{
  "fullName": "John User",
  "phoneNumber": "9876543210",
  "email": "john@example.com",
  "password": "MyPassword123!",
  "role": "user"
}
```

### 2. Register Worker
```javascript
// Register
POST /api/auth/register
{
  "fullName": "Raj Electrician",
  "phoneNumber": "9876543211",
  "email": "raj@example.com",
  "password": "MyPassword123!",
  "role": "worker"
}
// Save userId

// Create profile
POST /api/workers
{
  "experienceYears": 5,
  "skills": ["electrical-wiring"],
  "bio": "Experienced electrician",
  "hourlyRate": 500
}
```

### 3. Login
```javascript
POST /api/auth/login
{
  "identifier": "9876543210",
  "password": "MyPassword123!"
}
```

### 4. Get Profile
```javascript
GET /api/workers/[userId]
```

### 5. Search
```javascript
GET /api/workers/search?skill=electrical-wiring
```

---

## Reference Documents

- 📖 **SCHEMA_DESIGN.md** - Complete schema documentation
- 📖 **IMPLEMENTATION_GUIDE.md** - How to use services
- 📖 **MONGODB_MIGRATION.md** - Migration from SQL

---

**Status**: ✅ Production Ready
**Last Updated**: 2024-01-15
