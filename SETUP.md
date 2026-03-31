# Service Marketplace Backend - Setup Guide

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js              # Database connection pool
│   │   └── env.js             # Environment configuration
│   ├── db/
│   │   ├── migrate.js         # Database migration runner
│   │   ├── schema/
│   │   │   ├── users.sql      # Users table schema
│   │   │   ├── worker_profiles.sql
│   │   │   ├── locations.sql
│   │   │   └── ...
│   │   └── seed/              # (Optional) Seed data
│   ├── modules/
│   │   ├── user/
│   │   │   ├── user.model.js     # Database queries
│   │   │   ├── user.service.js   # Business logic
│   │   │   ├── user.controller.js # Request handlers
│   │   │   └── user.routes.js     # Route definitions
│   │   ├── worker/
│   │   │   ├── worker.model.js
│   │   │   ├── worker.service.js
│   │   │   ├── worker.controller.js
│   │   │   └── worker.routes.js
│   │   └── location/
│   │       ├── location.model.js
│   │       ├── location.service.js
│   │       ├── location.controller.js
│   │       └── location.routes.js
│   ├── middlewares/
│   │   ├── error.middleware.js       # Error handling
│   │   ├── auth.middleware.js        # Authentication (placeholder)
│   │   └── validation.middleware.js  # Request validation
│   ├── utils/                        # (For future utilities)
│   └── server.js                     # Server entry point
├── app.js                            # Express app setup
├── package.json
├── .env                              # Environment variables
├── API.md                            # API documentation
└── SETUP.md                          # This file
```

---

## Prerequisites

- **Node.js** v18.0.0 or higher
- **PostgreSQL** v12 or higher
- **npm** or **yarn** package manager

---

## Installation Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` folder:

```env
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/marketplace_db
PORT=5000
```

**Example with Neon (PostgreSQL as a Service):**
```env
DATABASE_URL=postgresql://neondb_owner:password@ep-xxxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 3. Initialize the Database

Run the migration script to create tables:

```bash
npm run db:migrate
```

This will:
- Drop existing tables (if any)
- Create the `users` table
- Create the `worker_profiles` table
- Create the `locations` table

### 4. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on `http://localhost:5000`

---

## Available Scripts

```bash
# Start the server
npm start

# Start with auto-reload (development)
npm run dev

# Initialize/recreate database
npm run db:migrate
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(15) UNIQUE NOT NULL,
  role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'worker')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Worker Profiles Table
```sql
CREATE TABLE worker_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  experience_years INTEGER DEFAULT 0,
  bio TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Locations Table
```sql
CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  area_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);
```

---

## Architecture Overview

### Design Principles

1. **Separation of Concerns**
   - `model.js`: Data access layer (queries)
   - `service.js`: Business logic layer
   - `controller.js`: Request handling layer
   - `routes.js`: Route definitions

2. **Transaction Support**
   - Worker registration uses database transactions to ensure data consistency
   - Both user and worker profile are created atomically

3. **No Data Duplication**
   - User names and phone numbers stored only in `users` table
   - `worker_profiles` references `users` via foreign key
   - Locations linked to users, not specific to workers

4. **Role-Based Access**
   - `users.role` field determines user type ('user' or 'worker')
   - Can be extended for role-based authorization

5. **Scalability**
   - Module-based structure allows easy addition of new features
   - Each module is independent and testable
   - Middleware can be easily added/extended

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/user/register` | Register a normal user |
| POST | `/worker/register` | Register a worker |
| GET | `/worker/:id` | Get worker details with location |
| POST | `/location/:userId` | Add/update user location |
| GET | `/location/:userId` | Get user location |
| DELETE | `/location/:userId` | Delete user location |

See [API.md](./API.md) for detailed endpoint documentation.

---

## Error Handling

All endpoints return structured error responses:

```json
{
  "success": false,
  "error": "Error description"
}
```

Common status codes:
- `200`: Success
- `201`: Created
- `400`: Bad request (validation error)
- `404`: Resource not found
- `409`: Conflict (duplicate phone number)
- `500`: Server error

---

## Future Enhancements

1. **Authentication & Authorization**
   - JWT token-based authentication
   - Role-based access control (RBAC)
   - Middleware placeholders already in place

2. **Additional Features**
   - Skills/expertise categories for workers
   - User ratings and reviews
   - Job/service bookings
   - Payment processing
   - Notifications system

3. **Database**
   - Search/filtering by location
   - Pagination for worker listings
   - Indexing for performance optimization

4. **Validation**
   - More sophisticated phone number validation
   - Email verification (if added)
   - Input sanitization

---

## Testing

Example API calls using `curl`:

### Register User
```bash
curl -X POST http://localhost:5000/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phoneNumber": "1234567890"
  }'
```

### Register Worker
```bash
curl -X POST http://localhost:5000/worker/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "phoneNumber": "9876543210",
    "experienceYears": 5,
    "bio": "Professional electrician"
  }'
```

### Get Worker
```bash
curl http://localhost:5000/worker/2
```

### Add Location
```bash
curl -X POST http://localhost:5000/location/2 \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060,
    "areaName": "New York, NY"
  }'
```

---

## Troubleshooting

### Database Connection Error
- Check if PostgreSQL is running
- Verify `DATABASE_URL` in `.env`
- Ensure database exists

### Migration Fails
- Check PostgreSQL permissions
- Try: `npm run db:migrate` again
- Check console output for specific error

### Port Already in Use
- Change `PORT` in `.env`
- Or kill process using port 5000

---

## Support

For issues or questions, refer to:
- [API.md](./API.md) - API documentation
- Database schema in `src/db/schema/`
- Module-specific code comments
