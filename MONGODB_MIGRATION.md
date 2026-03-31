# SQL to MongoDB Migration Guide

## Overview
Successfully migrated the backend from PostgreSQL to MongoDB using Mongoose ODM.

## What Changed

### 1. Database Configuration
- **Before**: PostgreSQL with pg library
- **After**: MongoDB with Mongoose
- **File**: `src/config/db.js`

### 2. Environment Variables
- **Before**: `DATABASE_URL` (PostgreSQL connection string)
- **After**: `MONGODB_URL` (MongoDB connection string)

Update your `.env` file:
```env
# MongoDB local development
MONGODB_URL=mongodb://localhost:27017/shrm-setu-dev

# OR MongoDB Atlas (cloud)
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/shrm-setu-dev?retryWrites=true&w=majority
```

### 3. New Models Created
All models are now Mongoose schemas located in `src/models/`:

- **User.js** - User schema (name, phone, email, password, role, profilePhoto, etc.)
- **Worker.js** - Worker profile (yearsOfExperience, workCertificate, shopPhotos, video)
- **Location.js** - Location info (city, state, pin, addressLines)
- **Skill.js** - Available skills (name, description, category)
- **WorkerSkill.js** - Worker-to-skill relationship (proficiencyLevel, yearsOfExperience)
- **Media.js** - Media files (photos, videos, documents)

### 4. Updated Model Files
All query functions updated to use Mongoose:

- `src/modules/user/user.model.js` - Mongoose queries
- `src/modules/location/location.model.js` - Mongoose queries
- `src/modules/skill/skill.model.js` - Mongoose queries
- `src/modules/worker/worker.model.js` - Mongoose queries
- `src/modules/media/media.model.js` - Mongoose queries
- `src/modules/worker-skill/worker-skill.model.js` - NEW

### 5. Server Initialization
- **Before**: Direct pool connection in db.js
- **After**: Async `connectDB()` called in server.js before starting

## Installation Steps

### 1. Install MongoDB (if local development)
```bash
# Windows: Download from https://www.mongodb.com/try/download/community
# OR use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. Update Dependencies
```bash
cd backend
npm install
# This will install mongoose and remove pg
```

### 3. Update Environment Variables
```bash
# Edit .env file
MONGODB_URL=mongodb://localhost:27017/shrm-setu-dev
NODE_ENV=development
PORT=5000
```

### 4. Start Server
```bash
npm run dev
```

You should see:
```
✅ Env loaded: true
✅ MongoDB connection successful
✅ Server running on port 5000
```

## Key Differences

### Collections (Tables)
| SQL Table | MongoDB Collection | Notes |
|-----------|-------------------|-------|
| users | users | Auto-created by Mongoose |
| worker_profiles | workers | Simplified structure |
| locations | locations | Updated field names |
| skills | skills | Same purpose |
| worker_skills | workerskills | Many-to-many relationship |
| media | medias | Simplified |

### Field Name Changes
- `user_id` → `userId` (camelCase)
- `phone_number` → `phone`
- `is_otp_verified` → `isOtpVerified`
- `created_at` → `createdAt` (auto timestamp)
- `updated_at` → `updatedAt` (auto timestamp)
- `shop_photos` → `shopPhotos`
- `introductory_video` → `introductoryVideo`

### Timestamps
Mongoose auto-manages timestamps with `{ timestamps: true }`:
- Automatic `createdAt` and `updatedAt` fields
- Automatically updated on save

## MongoDB Features Used

### 1. Relationships (References)
```javascript
userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true,
}
```

### 2. Validation
Built-in schema validation with `required`, `enum`, `unique`

### 3. Indexing
```javascript
// Unique compound index
workerSkillSchema.index({ workerId: 1, skillId: 1 }, { unique: true });
```

### 4. Population (Joins)
```javascript
// Automatically fetch related data
Worker.findOne({ userId })
  .populate('userId', 'name phone email')
```

## API Changes

### User Creation
```javascript
// Before (SQL)
await createUser('John', '9876543210', 'worker');

// After (MongoDB) - Same interface!
await createUser('John', '9876543210', 'worker');
```

### Getting Worker with Details
```javascript
// Now returns populated data
await getWorkerWithDetails(userId);
// Returns: { userId: { name, phone, email }, yearsOfExperience, ... }
```

### Adding Skills
```javascript
// New method
await addSkillToWorker(workerId, skillId, 'advanced', 5);

// Get skills with details
await getWorkerSkills(workerId);
// Includes skill name, description, category
```

## Rollback (if needed)

If you need to revert to PostgreSQL:
1. Keep the old db.js and models backed up
2. Change back to `pg` in package.json
3. Restore the original src/config/db.js
4. Run `npm install`

## Common Issues & Solutions

### Connection Error: "ECONNREFUSED"
- MongoDB not running locally
- **Fix**: Start MongoDB service or use cloud Atlas with correct URL

### ModuleNotFoundError: mongoose
- Dependencies not installed
- **Fix**: Run `npm install`

### Field not found
- Field names changed from snake_case to camelCase
- **Fix**: Update your queries to use new field names (userId, profilePhoto, etc.)

### Duplicate key error
- Trying to create user with existing phone/email
- **Fix**: Check unique constraints before creating

## Next Steps

1. ✅ Install MongoDB
2. ✅ Install dependencies: `npm install`
3. ✅ Update `.env` with MongoDB URL
4. ✅ Test connection: `npm run dev`
5. ⚠️ Test all API endpoints work with new models
6. 📝 Update API documentation with new response formats

## Support

All SQL schema files in `src/db/schema/` are no longer used.
For data migration from old PostgreSQL database, use MongoDB import tools or scripts.

---
**Migration Completed**: SQL → MongoDB (Mongoose)
**Date**: 2024
**Status**: Ready for testing
