# Service Marketplace API - Quick Test Reference

## 🚀 Quick Start Testing

### 1. Start Server
```bash
npm run dev
```

### 2. Test Health
```bash
curl http://localhost:5000/health
```

### 3. Run Automated Tests
```bash
# On macOS/Linux:
bash test-api.sh

# On Windows:
test-api.bat
```

---

## 📌 All Endpoints at a Glance

```
GET  /health                    ← Health Check
POST /user/register             ← Register User
POST /worker/register           ← Register Worker (transaction)
GET  /worker/:id                ← Get Worker (with profile + location)
POST /location/:userId          ← Add/Update Location
GET  /location/:userId          ← Get Location
DELETE /location/:userId        ← Delete Location
```

---

## 🧪 Quick Copy-Paste Tests

### Health Check
```bash
curl http://localhost:5000/health
```

### Register User (Success)
```bash
curl -X POST http://localhost:5000/user/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "phoneNumber": "1234567890"}'
```

### Register User (Error - Missing Phone)
```bash
curl -X POST http://localhost:5000/user/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe"}'
```

### Register User (Error - Short Phone)
```bash
curl -X POST http://localhost:5000/user/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "phoneNumber": "123"}'
```

### Register User (Error - Duplicate Phone)
```bash
curl -X POST http://localhost:5000/user/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Another", "phoneNumber": "1234567890"}'
```

### Register Worker (Success - Full)
```bash
curl -X POST http://localhost:5000/worker/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Smith", "phoneNumber": "9876543210", "experienceYears": 5, "bio": "Electrician"}'
```

### Register Worker (Success - Minimal)
```bash
curl -X POST http://localhost:5000/worker/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Bob Plumber", "phoneNumber": "5555555555"}'
```

### Register Worker (Error - Missing Name)
```bash
curl -X POST http://localhost:5000/worker/register \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "9876543210"}'
```

### Register Worker (Error - Negative Experience)
```bash
curl -X POST http://localhost:5000/worker/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "phoneNumber": "1111111111", "experienceYears": -5}'
```

### Get Worker (Success)
```bash
curl http://localhost:5000/worker/2
```

### Get Worker (Error - Invalid ID)
```bash
curl http://localhost:5000/worker/abc
```

### Get Worker (Error - Not Found)
```bash
curl http://localhost:5000/worker/9999
```

### Add Location (Success)
```bash
curl -X POST http://localhost:5000/location/2 \
  -H "Content-Type: application/json" \
  -d '{"latitude": 40.7128, "longitude": -74.0060, "areaName": "New York"}'
```

### Add Location (No Area Name)
```bash
curl -X POST http://localhost:5000/location/2 \
  -H "Content-Type: application/json" \
  -d '{"latitude": 40.7128, "longitude": -74.0060}'
```

### Add Location (Error - Bad Latitude)
```bash
curl -X POST http://localhost:5000/location/2 \
  -H "Content-Type: application/json" \
  -d '{"latitude": 91, "longitude": -74.0060}'
```

### Add Location (Error - Bad Longitude)
```bash
curl -X POST http://localhost:5000/location/2 \
  -H "Content-Type: application/json" \
  -d '{"latitude": 40.7128, "longitude": 181}'
```

### Add Location (Error - Missing Longitude)
```bash
curl -X POST http://localhost:5000/location/2 \
  -H "Content-Type: application/json" \
  -d '{"latitude": 40.7128}'
```

### Add Location (Error - User Not Found)
```bash
curl -X POST http://localhost:5000/location/9999 \
  -H "Content-Type: application/json" \
  -d '{"latitude": 40.7128, "longitude": -74.0060}'
```

### Get Location (Success)
```bash
curl http://localhost:5000/location/2
```

### Get Location (Error - Not Found)
```bash
curl http://localhost:5000/location/9999
```

### Delete Location (Success)
```bash
curl -X DELETE http://localhost:5000/location/2
```

### Delete Location (Error - Not Found)
```bash
curl -X DELETE http://localhost:5000/location/2
```

### 404 Route Not Found
```bash
curl http://localhost:5000/invalid/route
```

---

## ✅ Success Response Patterns

### User Registration
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "phoneNumber": "1234567890",
    "role": "user",
    "createdAt": "2026-03-23T10:30:00Z"
  }
}
```

### Worker Registration
```json
{
  "success": true,
  "message": "Worker registered successfully",
  "data": {
    "user": {
      "id": 2,
      "name": "Jane Smith",
      "phoneNumber": "9876543210",
      "role": "worker",
      "createdAt": "2026-03-23T10:35:00Z"
    },
    "workerProfile": {
      "id": 1,
      "userId": 2,
      "experienceYears": 5,
      "bio": "Electrician",
      "isAvailable": true,
      "createdAt": "2026-03-23T10:35:00Z"
    }
  }
}
```

### Get Worker
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 2,
      "name": "Jane Smith",
      "phoneNumber": "9876543210",
      "role": "worker",
      "createdAt": "2026-03-23T10:35:00Z"
    },
    "workerProfile": {
      "id": 1,
      "userId": 2,
      "experienceYears": 5,
      "bio": "Electrician",
      "isAvailable": true,
      "createdAt": "2026-03-23T10:35:00Z"
    },
    "location": {
      "id": 1,
      "latitude": 40.7128,
      "longitude": -74.0060,
      "areaName": "New York"
    }
  }
}
```

### Add Location
```json
{
  "success": true,
  "message": "Location updated successfully",
  "data": {
    "id": 1,
    "userId": 2,
    "latitude": 40.7128,
    "longitude": -74.0060,
    "areaName": "New York",
    "createdAt": "2026-03-23T10:45:00Z"
  }
}
```

### Get Location
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 2,
    "latitude": 40.7128,
    "longitude": -74.0060,
    "areaName": "New York",
    "createdAt": "2026-03-23T10:45:00Z"
  }
}
```

### Delete Location
```json
{
  "success": true,
  "message": "Location deleted successfully"
}
```

---

## ❌ Error Response Patterns

### Missing Fields
```json
{
  "success": false,
  "error": "Missing required fields: name, phoneNumber"
}
```

### Invalid Phone
```json
{
  "success": false,
  "error": "Invalid phone number format"
}
```

### Duplicate Phone
```json
{
  "success": false,
  "error": "Phone number already registered"
}
```

### Invalid Coordinates
```json
{
  "success": false,
  "error": "Latitude must be between -90 and 90"
}
```

### Not Found
```json
{
  "success": false,
  "error": "Worker not found"
}
```

### Invalid ID Format
```json
{
  "success": false,
  "error": "Invalid worker ID"
}
```

### Route Not Found
```json
{
  "success": false,
  "error": "Route not found: GET /invalid/route"
}
```

---

## 🧪 Testing Scenarios

### Scenario 1: Complete User Flow
```bash
# 1. Register normal user
curl -X POST http://localhost:5000/user/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "phoneNumber": "1111111111"}'
# Returns: id=1

# 2. Try duplicate (should fail)
curl -X POST http://localhost:5000/user/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice 2", "phoneNumber": "1111111111"}'
# Returns: error 409
```

### Scenario 2: Complete Worker Flow
```bash
# 1. Register worker
curl -X POST http://localhost:5000/worker/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Bob", "phoneNumber": "2222222222", "experienceYears": 3}'
# Returns: id=2

# 2. Add location
curl -X POST http://localhost:5000/location/2 \
  -H "Content-Type: application/json" \
  -d '{"latitude": 40.7128, "longitude": -74.0060, "areaName": "NYC"}'

# 3. Get worker with location
curl http://localhost:5000/worker/2
# Returns: worker + profile + location

# 4. Update location
curl -X POST http://localhost:5000/location/2 \
  -H "Content-Type: application/json" \
  -d '{"latitude": 51.5074, "longitude": -0.1278, "areaName": "London"}'

# 5. Delete location
curl -X DELETE http://localhost:5000/location/2

# 6. Verify deleted
curl http://localhost:5000/location/2
# Returns: error 404
```

### Scenario 3: Validation Testing
```bash
# Test all error cases
curl -X POST http://localhost:5000/user/register -H "Content-Type: application/json" -d '{}'
curl -X POST http://localhost:5000/user/register -H "Content-Type: application/json" -d '{"name":"Test"}'
curl -X POST http://localhost:5000/user/register -H "Content-Type: application/json" -d '{"name":"Test","phoneNumber":"123"}'
curl -X POST http://localhost:5000/location/1 -H "Content-Type: application/json" -d '{"latitude":91}'
curl -X POST http://localhost:5000/location/1 -H "Content-Type: application/json" -d '{"latitude":-91}'
curl -X POST http://localhost:5000/location/1 -H "Content-Type: application/json" -d '{"longitude":181}'
curl -X POST http://localhost:5000/location/1 -H "Content-Type: application/json" -d '{"longitude":-181}'
```

---

## 📊 HTTP Status Codes

| Code | Endpoint | Scenario |
|------|----------|----------|
| 200 | GET /worker/, GET /location | Success |
| 201 | POST /user/register, POST /worker/register, POST /location | Created |
| 400 | Any POST | Validation error |
| 404 | GET /worker, GET /location, DELETE /location | Not found |
| 409 | POST /user/register, POST /worker/register | Duplicate phone |
| 500 | Any | Unexpected error |

---

## 🛠️ Testing Tools

### Using curl
```bash
curl -X POST http://localhost:5000/user/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "phoneNumber": "1234567890"}'
```

### Using Postman
1. Create new request
2. Set method (POST/GET/DELETE)
3. Set URL
4. In Body tab, select "raw" and "JSON"
5. Paste JSON data
6. Click "Send"

### Using Thunder Client (VS Code)
1. Click Thunder Client extension
2. Create new request
3. Set method and URL
4. Add headers: Content-Type: application/json
5. Add JSON body
6. Send

### Using REST Client (VS Code)
1. Save file as `test.rest`
2. Use format from TESTING.md
3. Click "Send Request" above each request

---

## 📝 Test Execution Checklist

- [ ] Server is running (`npm run dev`)
- [ ] Database is initialized (`npm run db:migrate`)
- [ ] Can reach health endpoint (/health)
- [ ] Can register normal user
- [ ] Cannot register duplicate phone
- [ ] Can register worker
- [ ] Can get worker details
- [ ] Can add location
- [ ] Can update location
- [ ] Can get location
- [ ] Can delete location
- [ ] Gets 404 for invalid routes
- [ ] Error messages are clear

---

## 💡 Testing Tips

✅ **Copy userId from registration response** for use in subsequent requests
✅ **Test errors first** to verify validation works
✅ **Test boundary values** for coordinates (90, -90, 180, -180)
✅ **Test duplicates** to ensure unique constraints work
✅ **Test happy path** after errors work
✅ **Use automated scripts** (test-api.sh or test-api.bat) for regression testing
✅ **Save Postman collection** for team collaboration
✅ **Keep detailed notes** of test results

---

## 📚 Full Documentation

For complete details, see:
- **TESTING.md** - Comprehensive testing guide
- **API.md** - Complete API reference
- **SETUP.md** - Setup & troubleshooting
- **ARCHITECTURE.md** - Design details

---

Done! Everything is ready for testing! 🚀
