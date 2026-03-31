# Service Marketplace Backend - Architecture & Design Guide

## 📐 Architecture Overview

This backend follows a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                      Express Routes                              │
│                  (module/*.routes.js)                            │
└───────────────┬──────────────────────────────┬──────────────────┘
                │                              │
┌───────────────▼──────────────┐  ┌───────────▼──────────────────┐
│     Controllers              │  │     Error Middleware          │
│  (*.controller.js)           │  │  (error.middleware.js)        │
│  - Request validation        │  │  - Error handling             │
│  - Response formatting       │  │  - Consistent error format    │
└───────────────┬──────────────┘  │                               │
                │                 └──────────────────────────────┘
┌───────────────▼────────────────────────────────────────────────┐
│                      Services                                   │
│                  (*.service.js)                                 │
│  - Business logic                                               │
│  - Validation rules                                             │
│  - Transaction handling                                         │
└───────────────┬────────────────────────────────────────────────┘
                │
┌───────────────▼────────────────────────────────────────────────┐
│                        Models                                   │
│                   (*.model.js)                                  │
│  - Database queries                                             │
│  - No business logic                                            │
│  - Pure data access                                             │
└───────────────┬────────────────────────────────────────────────┘
                │
┌───────────────▼────────────────────────────────────────────────┐
│                    PostgreSQL Database                          │
│  (users | worker_profiles | locations)                          │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow Example: Register Worker

```
1. POST /worker/register
   ↓
2. Express Router (worker.routes.js)
   ↓
3. Controller (registerWorkerController)
   - Validates input
   - Calls service
   ↓
4. Service (registerWorker)
   - Business logic validation
   - Calls model within transaction
   ↓
5. Model (createWorkerProfile, createUser)
   - Executes SQL queries
   - Database operations
   ↓
6. Database (PostgreSQL)
   - Inserts user
   - Inserts worker_profile
   - Returns data
   ↓
7. Service aggregates response
   ↓
8. Controller formats and sends JSON
   ↓
9. Response to client
```

---

## 📦 Module Structure

Each module follows this pattern for consistency:

```
modules/user/
├── user.model.js       # Data layer
├── user.service.js     # Business logic layer
├── user.controller.js  # Request handling layer
└── user.routes.js      # Route definitions
```

### Model Layer (user.model.js)
- Pure database queries
- No business logic
- Doesn't validate or transform data
- No error handling (throws errors up)

**Example:**
```javascript
export const getUserById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
};
```

### Service Layer (user.service.js)
- Business logic and validation
- Calls model functions
- Error handling and transformation
- Transaction coordination

**Example:**
```javascript
export const registerNormalUser = async (name, phoneNumber) => {
  if (!name || name.length === 0) {
    throw new Error('Name is required');
  }
  
  const existingUser = await getUserByPhoneNumber(phoneNumber);
  if (existingUser) {
    throw new Error('Phone number already registered');
  }
  
  return await createUser(name, phoneNumber);
};
```

### Controller Layer (user.controller.js)
- Request validation
- Calls service functions
- Formats responses
- Error handling for http status codes

**Example:**
```javascript
export const registerUser = async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;
    
    if (!name || !phoneNumber) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    
    const user = await registerNormalUser(name, phoneNumber);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```

### Routes Layer (user.routes.js)
- Express Router setup
- Route definitions
- Minimal logic

**Example:**
```javascript
router.post('/register', registerUser);
router.get('/:id', getUser);
```

---

## 🗄️ Database Design Principles

### 1. No Data Duplication
❌ WRONG (Duplication):
```sql
-- Users table
id | name | phone_number

-- Worker Profiles table
id | user_id | name | phone_number | bio
--    Duplicated!
```

✅ CORRECT (Our approach):
```sql
-- Users table
id | name | phone_number | role

-- Worker Profiles table
id | user_id | bio | experience_years
--    Just references user, no duplication
```

### 2. Foreign Key Relationships
```sql
-- User table
id (PK)
name
phone_number (UNIQUE)
role

-- Worker Profiles table
id (PK)
user_id (FK → users.id, UNIQUE)
--       ↑ Links to user, prevents multiple profiles per user
```

### 3. Cascading Deletes
```sql
CREATE TABLE worker_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL 
    REFERENCES users(id) ON DELETE CASCADE
  --                         ↑ Automatically deletes profile if user deleted
);
```

### 4. Role-Based Access
```sql
-- Single role field handles different user types
users.role = 'user' → Normal user
users.role = 'worker' → Can access worker_profiles
```

---

## 🔐 Transaction Handling: Worker Registration

Why transactions are important:

```javascript
// Without transaction (WRONG):
1. Insert into users
2. If user insert succeeds...
3. Insert into worker_profiles
4. If this fails, user exists but no profile!
   ^^^ DATA INCONSISTENCY

// With transaction (CORRECT):
BEGIN TRANSACTION
1. Insert into users
2. Insert into worker_profiles
COMMIT
// Both succeed or BOTH rolled back!
```

Our implementation:
```javascript
export const registerWorker = async (data) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Both operations use SAME client
    const user = await client.query('INSERT INTO users...');
    const profile = await client.query('INSERT INTO worker_profiles...');
    
    await client.query('COMMIT');
    return { user, profile };
  } catch (err) {
    await client.query('ROLLBACK'); // Undo everything
    throw err;
  } finally {
    client.release();
  }
};
```

---

## 📝 Error Handling Strategy

### Layered Error Handling

```
Model Layer → Throws raw database errors
    ↓
Service Layer → Transforms to business errors
    ↓
Controller Layer → Maps to HTTP status codes
    ↓
Middleware → Global error handler
    ↓
Client → Consistent JSON error response
```

### Error Response Format
```json
{
  "success": false,
  "error": "Error message"
}
```

### HTTP Status Codes
| Status | Meaning | Examples |
|--------|---------|----------|
| 201 | Created | POST requests succeed |
| 400 | Bad Request | Validation error, missing fields |
| 404 | Not Found | User/worker not found |
| 409 | Conflict | Duplicate phone number |
| 500 | Server Error | Unexpected errors |

---

## 🚀 Scalability Considerations

### 1. Adding New Modules
```
New feature: "Skills" for workers

Create:
  src/modules/skill/
  ├── skill.model.js
  ├── skill.service.js
  ├── skill.controller.js
  ├── skill.routes.js
  
Add to app.js:
  import skillRoutes from './src/modules/skill/skill.routes.js';
  app.use('/skill', skillRoutes);
```

### 2. Database Indexing
```sql
-- Already indexed (PK):
users.id
worker_profiles.id
locations.id

-- Add for performance:
CREATE INDEX idx_user_role ON users(role);
CREATE INDEX idx_worker_available ON worker_profiles(is_available);
CREATE INDEX idx_location_area ON locations(area_name);
```

### 3. Pagination (Future)
```javascript
// Service layer
export const getWorkers = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const result = await pool.query(
    'SELECT * FROM users WHERE role = $1 LIMIT $2 OFFSET $3',
    ['worker', limit, offset]
  );
  return result.rows;
};
```

---

## 🔄 Future Authentication

Current placeholder in `auth.middleware.js`:

```javascript
export const authenticateUser = (req, res, next) => {
  // TODO: Implement JWT validation
  next();
};
```

When implementing JWT:

```javascript
export const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

Then use in routes:
```javascript
router.get('/:id', authenticateUser, getWorker);
```

---

## 🧪 Testing Strategy (Future)

Structure for tests:
```
tests/
├── unit/
│   ├── user.service.test.js
│   ├── worker.service.test.js
│   └── location.service.test.js
├── integration/
│   ├── user.routes.test.js
│   ├── worker.routes.test.js
│   └── location.routes.test.js
└── setup.js
```

Example test:
```javascript
describe('User Service', () => {
  test('registerNormalUser should create user', async () => {
    const user = await registerNormalUser('John', '1234567890');
    expect(user.name).toBe('John');
    expect(user.role).toBe('user');
  });
});
```

---

## 📊 Performance Optimization

### Current State
- Connection pooling (pg library)
- Single database connection string
- Basic indexed primary keys

### Future Improvements
1. **Query optimization** - Analyze slow queries
2. **Caching** - Redis for frequently accessed data
3. **Load balancing** - Multiple server instances
4. **Database indexing** - Strategic indexes on queries
5. **API rate limiting** - Prevent abuse
6. **Pagination** - Limit result sets

---

## 🛡️ Security Considerations

### Current
- Basic input validation
- Foreign key constraints
- NO SQL injection (parameterized queries)
- Transaction safety

### Future
- JWT authentication
- Password hashing (bcrypt)
- Rate limiting
- CORS configuration
- Input sanitization
- Request logging
- HTTPS enforcement

---

## 📚 Naming Conventions

### Variables
- `camelCase` for variables and functions
- `snake_case` for database columns
- `PascalCase` for classes and types

### Files
- `module.model.js` - Database
- `module.service.js` - Business logic
- `module.controller.js` - Request handling
- `module.routes.js` - Routes

### Routes
- `/user` - User operations
- `/worker` - Worker operations
- `/location` - Location operations

---

## 🎯 Summary

This backend provides:
- ✅ Clean separation of concerns
- ✅ Scalable module-based structure
- ✅ Transaction support for data consistency
- ✅ No data duplication
- ✅ Clear error handling
- ✅ Ready for authentication
- ✅ Role-based system foundation
- ✅ Comprehensive documentation

The system is designed to be:
- **Easy to understand** - Clear layering and patterns
- **Easy to extend** - Add modules without modifying existing code
- **Easy to test** - Each layer can be tested independently
- **Easy to scale** - Modular structure supports growth
