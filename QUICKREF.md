# Service Marketplace Backend - Quick Reference

## ✅ Completed Components

### Database
- [x] Users table schema with role field
- [x] Worker profiles table with foreign key
- [x] Locations table with GPS coordinates
- [x] Migration runner script
- [x] Proper indexing and constraints

### User Module
- [x] user.model.js - DB queries
- [x] user.service.js - Business logic
- [x] user.controller.js - Request handlers
- [x] user.routes.js - Routes
- [x] POST /user/register endpoint

### Worker Module
- [x] worker.model.js - DB queries
- [x] worker.service.js - Business logic with transactions
- [x] worker.controller.js - Request handlers
- [x] worker.routes.js - Routes
- [x] POST /worker/register endpoint (atomic transaction)
- [x] GET /worker/:id endpoint (combined data)

### Location Module
- [x] location.model.js - DB queries
- [x] location.service.js - Business logic
- [x] location.controller.js - Request handlers
- [x] location.routes.js - Routes
- [x] POST /location/:userId (add/update)
- [x] GET /location/:userId (retrieve)
- [x] DELETE /location/:userId (remove)

### Middleware
- [x] error.middleware.js - Error handling
- [x] auth.middleware.js - Auth placeholder
- [x] validation.middleware.js - Input validation

### Utilities
- [x] helpers.js - Common utility functions
- [x] Database connection pooling

### Documentation
- [x] README.md - Project overview
- [x] SETUP.md - Installation guide
- [x] API.md - API documentation
- [x] ARCHITECTURE.md - Architecture guide
- [x] .env.example - Environment template

---

## 📋 Database Tables

### users
```sql
id (PK)
name (VARCHAR 100)
phone_number (VARCHAR 15, UNIQUE)
role (user|worker)
created_at
```

### worker_profiles
```sql
id (PK)
user_id (FK → users.id, UNIQUE)
experience_years (INT, default 0)
bio (TEXT, optional)
is_available (BOOLEAN, default true)
created_at
```

### locations
```sql
id (PK)
user_id (FK → users.id, UNIQUE)
latitude (DECIMAL 10,8)
longitude (DECIMAL 11,8)
area_name (VARCHAR 255, optional)
created_at
```

---

## 🔌 API Endpoints

### User Endpoints
```
POST   /user/register           → Register normal user
GET    /health                  → Health check
```

### Worker Endpoints
```
POST   /worker/register         → Register worker (transaction)
GET    /worker/:id              → Get worker + profile + location
```

### Location Endpoints
```
POST   /location/:userId        → Add/update location
GET    /location/:userId        → Get location
DELETE /location/:userId        → Delete location
```

---

## 📁 Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js               ✅ PostgreSQL pool
│   │   └── env.js              ✅ Config
│   ├── db/
│   │   ├── migrate.js          ✅ Migration runner
│   │   └── schema/
│   │       ├── users.sql       ✅ Updated (added name)
│   │       ├── worker_profiles.sql ✅ Updated (removed name)
│   │       └── locations.sql   ✅ New
│   ├── modules/
│   │   ├── user/
│   │   │   ├── user.model.js           ✅
│   │   │   ├── user.service.js         ✅
│   │   │   ├── user.controller.js      ✅
│   │   │   └── user.routes.js          ✅
│   │   ├── worker/
│   │   │   ├── worker.model.js         ✅
│   │   │   ├── worker.service.js       ✅
│   │   │   ├── worker.controller.js    ✅
│   │   │   └── worker.routes.js        ✅
│   │   └── location/
│   │       ├── location.model.js       ✅
│   │       ├── location.service.js     ✅
│   │       ├── location.controller.js  ✅
│   │       └── location.routes.js      ✅
│   ├── middlewares/
│   │   ├── error.middleware.js         ✅
│   │   ├── auth.middleware.js          ✅
│   │   └── validation.middleware.js    ✅
│   ├── utils/
│   │   └── helpers.js                  ✅
│   └── server.js                       ✅
├── app.js                              ✅ Updated
├── package.json                        ✅ Updated
├── .env                                ✅ Configured
├── .env.example                        ✅ Template
├── README.md                           ✅
├── SETUP.md                            ✅
├── API.md                              ✅
├── ARCHITECTURE.md                     ✅
└── QUICKREF.md                         📋 This file
```

---

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure database:**
   - Update `.env` with your PostgreSQL URL
   - Example: `DATABASE_URL=postgresql://user:pass@localhost/db`

3. **Initialize database:**
   ```bash
   npm run db:migrate
   ```

4. **Start server:**
   ```bash
   npm run dev
   ```

5. **Test endpoints:**
   ```bash
   # Register normal user
   curl -X POST http://localhost:5000/user/register \
     -H "Content-Type: application/json" \
     -d '{"name":"John","phoneNumber":"1234567890"}'
   
   # Register worker
   curl -X POST http://localhost:5000/worker/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Jane","phoneNumber":"0987654321","experienceYears":3}'
   
   # Get worker
   curl http://localhost:5000/worker/1
   
   # Add location
   curl -X POST http://localhost:5000/location/1 \
     -H "Content-Type: application/json" \
     -d '{"latitude":40.7128,"longitude":-74.0060,"areaName":"NYC"}'
   ```

---

## 🔑 Key Features

✅ **No Data Duplication**
- Names stored only in users table
- Worker profiles only store worker-specific data
- Clean relationship via foreign keys

✅ **Transaction Safety**
- Worker registration creates user + profile atomically
- All-or-nothing approach prevents inconsistency

✅ **Role-Based Design**
- Single role field (user/worker)
- Easy to extend with RBAC

✅ **Clean Architecture**
- Model → Service → Controller → Routes
- Each layer has single responsibility
- Easy to test and maintain

✅ **Scalable Structure**
- Module-based design
- Add new features without modifying existing code
- Ready for future enhancements

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| README.md | Project overview |
| SETUP.md | Installation & configuration |
| API.md | Complete API reference |
| ARCHITECTURE.md | Design decisions & patterns |
| QUICKREF.md | This quick reference |

---

## 🛠️ npm Scripts

```bash
npm start              # Production server
npm run dev            # Development with nodemon
npm run db:migrate     # Initialize database
```

---

## 💪 What's Working

✅ Database schema with proper relationships
✅ User registration with validation
✅ Worker registration with automatic transaction
✅ Location management (add, get, delete)
✅ Combined worker details (user + profile + location)
✅ Error handling middleware
✅ Input validation
✅ Database migration automation
✅ Clean code organization

---

## 🎯 Next Steps (Optional)

1. **Authentication**
   - Implement JWT tokens
   - Add login endpoint
   - Protect routes with auth middleware

2. **Additional Features**
   - Worker skills/expertise categories
   - User ratings and reviews
   - Search and filtering
   - Job/service bookings

3. **Validation**
   - Email field (optional)
   - More sophisticated validation
   - Request logging

4. **Performance**
   - Query optimization
   - Redis caching
   - Database indexing

---

## 📞 Support

For detailed information, see:
- SETUP.md - Installation troubleshooting
- ARCHITECTURE.md - Design decisions
- API.md - Endpoint details
