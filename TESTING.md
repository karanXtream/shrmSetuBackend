# Service Marketplace Backend - Complete API Testing Guide

## 📋 Table of Contents
1. [Setup](#setup)
2. [Health Check](#health-check)
3. [User APIs](#user-apis)
4. [Worker APIs](#worker-apis)
5. [Location APIs](#location-apis)
6. [Error Cases](#error-cases)

---

## Setup

### Prerequisites
- Server running: `npm run dev`
- Base URL: `http://localhost:5000`
- All requests use `Content-Type: application/json`

### Testing Tools
You can use any of these:
- **curl** (command line)
- **Postman** (GUI)
- **Thunder Client** (VS Code)
- **REST Client** (VS Code extension)

---

## Health Check

### ✅ GET /health
Check if server is running

**Request:**
```bash
curl http://localhost:5000/health
```

**Response (200 OK):**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

---

## User APIs

### ✅ POST /user/register
Register a new normal user

**Request - Valid:**
```bash
curl -X POST http://localhost:5000/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phoneNumber": "1234567890"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "phoneNumber": "1234567890",
    "role": "user",
    "createdAt": "2026-03-23T10:30:00.000Z"
  }
}
```

---

**Request - Missing Fields:**
```bash
curl -X POST http://localhost:5000/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe"
  }'
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Missing required fields: name, phoneNumber"
}
```

---

**Request - Short Phone Number:**
```bash
curl -X POST http://localhost:5000/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Smith",
    "phoneNumber": "123"
  }'
```

**Response (500 Error):**
```json
{
  "success": false,
  "error": "Invalid phone number format"
}
```

---

**Request - Duplicate Phone Number:**
```bash
curl -X POST http://localhost:5000/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Another John",
    "phoneNumber": "1234567890"
  }'
```

**Response (409 Conflict):**
```json
{
  "success": false,
  "error": "Phone number already registered"
}
```

---

## Worker APIs

### ✅ POST /worker/register
Register a new worker (creates user + worker profile in transaction)

**Request - Valid (Full Details):**
```bash
curl -X POST http://localhost:5000/worker/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "phoneNumber": "9876543210",
    "experienceYears": 5,
    "bio": "Professional electrician with 5 years of experience"
  }'
```

**Response (201 Created):**
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
      "createdAt": "2026-03-23T10:35:00.000Z"
    },
    "workerProfile": {
      "id": 1,
      "userId": 2,
      "experienceYears": 5,
      "bio": "Professional electrician with 5 years of experience",
      "isAvailable": true,
      "createdAt": "2026-03-23T10:35:00.000Z"
    }
  }
}
```

---

**Request - Minimal (experienceYears defaults to 0):**
```bash
curl -X POST http://localhost:5000/worker/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Plumber",
    "phoneNumber": "5555555555"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Worker registered successfully",
  "data": {
    "user": {
      "id": 3,
      "name": "Bob Plumber",
      "phoneNumber": "5555555555",
      "role": "worker",
      "createdAt": "2026-03-23T10:40:00.000Z"
    },
    "workerProfile": {
      "id": 2,
      "userId": 3,
      "experienceYears": 0,
      "bio": null,
      "isAvailable": true,
      "createdAt": "2026-03-23T10:40:00.000Z"
    }
  }
}
```

---

**Request - Missing Phone Number:**
```bash
curl -X POST http://localhost:5000/worker/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Constructor",
    "experienceYears": 3
  }'
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Missing required fields: name, phoneNumber"
}
```

---

**Request - Negative Experience Years:**
```bash
curl -X POST http://localhost:5000/worker/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Charlie Painter",
    "phoneNumber": "3333333333",
    "experienceYears": -5
  }'
```

**Response (500 Error):**
```json
{
  "success": false,
  "error": "Experience years must be a non-negative number"
}
```

---

**Request - Invalid Experience Years Type:**
```bash
curl -X POST http://localhost:5000/worker/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "David Carpenter",
    "phoneNumber": "4444444444",
    "experienceYears": "not a number"
  }'
```

**Response (500 Error):**
```json
{
  "success": false,
  "error": "Experience years must be a non-negative number"
}
```

---

### ✅ GET /worker/:id
Get worker details (user info + worker profile + location)

**Request - Valid:**
```bash
curl http://localhost:5000/worker/2
```

**Response (200 OK) - With Location:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 2,
      "name": "Jane Smith",
      "phoneNumber": "9876543210",
      "role": "worker",
      "createdAt": "2026-03-23T10:35:00.000Z"
    },
    "workerProfile": {
      "id": 1,
      "userId": 2,
      "experienceYears": 5,
      "bio": "Professional electrician with 5 years of experience",
      "isAvailable": true,
      "createdAt": "2026-03-23T10:35:00.000Z"
    },
    "location": {
      "id": 1,
      "latitude": 40.7128,
      "longitude": -74.0060,
      "areaName": "New York, NY"
    }
  }
}
```

---

**Response (200 OK) - Without Location:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 3,
      "name": "Bob Plumber",
      "phoneNumber": "5555555555",
      "role": "worker",
      "createdAt": "2026-03-23T10:40:00.000Z"
    },
    "workerProfile": {
      "id": 2,
      "userId": 3,
      "experienceYears": 0,
      "bio": null,
      "isAvailable": true,
      "createdAt": "2026-03-23T10:40:00.000Z"
    },
    "location": null
  }
}
```

---

**Request - Invalid ID (non-numeric):**
```bash
curl http://localhost:5000/worker/abc
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid worker ID"
}
```

---

**Request - Worker Not Found:**
```bash
curl http://localhost:5000/worker/9999
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Worker not found"
}
```

---

**Request - Normal User (role != worker):**
```bash
curl http://localhost:5000/worker/1
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Worker not found"
}
```

---

## Location APIs

### ✅ POST /location/:userId
Add or update location for a user

**Request - Valid:**
```bash
curl -X POST http://localhost:5000/location/2 \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060,
    "areaName": "New York, NY"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Location updated successfully",
  "data": {
    "id": 1,
    "userId": 2,
    "latitude": 40.7128,
    "longitude": -74.0060,
    "areaName": "New York, NY",
    "createdAt": "2026-03-23T10:45:00.000Z"
  }
}
```

---

**Request - Only Required Fields:**
```bash
curl -X POST http://localhost:5000/location/3 \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 34.0522,
    "longitude": -118.2437
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Location updated successfully",
  "data": {
    "id": 2,
    "userId": 3,
    "latitude": 34.0522,
    "longitude": -118.2437,
    "areaName": null,
    "createdAt": "2026-03-23T10:46:00.000Z"
  }
}
```

---

**Request - Missing Latitude:**
```bash
curl -X POST http://localhost:5000/location/2 \
  -H "Content-Type: application/json" \
  -d '{
    "longitude": -74.0060,
    "areaName": "New York"
  }'
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Missing required fields: latitude, longitude"
}
```

---

**Request - Invalid Latitude (> 90):**
```bash
curl -X POST http://localhost:5000/location/2 \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 91,
    "longitude": -74.0060
  }'
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Latitude must be between -90 and 90"
}
```

---

**Request - Invalid Latitude (< -90):**
```bash
curl -X POST http://localhost:5000/location/2 \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -95,
    "longitude": -74.0060
  }'
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Latitude must be between -90 and 90"
}
```

---

**Request - Invalid Longitude (> 180):**
```bash
curl -X POST http://localhost:5000/location/2 \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": 181
  }'
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Longitude must be between -180 and 180"
}
```

---

**Request - Invalid Longitude (< -180):**
```bash
curl -X POST http://localhost:5000/location/2 \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -181
  }'
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Longitude must be between -180 and 180"
}
```

---

**Request - Non-existent User:**
```bash
curl -X POST http://localhost:5000/location/9999 \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "User not found"
}
```

---

**Request - Invalid User ID (non-numeric):**
```bash
curl -X POST http://localhost:5000/location/invalid \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid user ID"
}
```

---

**Request - Update Existing Location:**
```bash
curl -X POST http://localhost:5000/location/2 \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 51.5074,
    "longitude": -0.1278,
    "areaName": "London, UK"
  }'
```

**Response (201 Created) - Updated:**
```json
{
  "success": true,
  "message": "Location updated successfully",
  "data": {
    "id": 1,
    "userId": 2,
    "latitude": 51.5074,
    "longitude": -0.1278,
    "areaName": "London, UK",
    "createdAt": "2026-03-23T10:45:00.000Z"
  }
}
```

---

### ✅ GET /location/:userId
Get location for a user

**Request - Valid:**
```bash
curl http://localhost:5000/location/2
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 2,
    "latitude": 51.5074,
    "longitude": -0.1278,
    "areaName": "London, UK",
    "createdAt": "2026-03-23T10:45:00.000Z"
  }
}
```

---

**Request - No Location Set:**
```bash
curl http://localhost:5000/location/3
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Location not found for this user"
}
```

---

**Request - Invalid User ID (non-numeric):**
```bash
curl http://localhost:5000/location/xyz
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid user ID"
}
```

---

**Request - Non-existent User:**
```bash
curl http://localhost:5000/location/9999
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "User not found"
}
```

---

### ✅ DELETE /location/:userId
Delete location for a user

**Request - Valid:**
```bash
curl -X DELETE http://localhost:5000/location/2
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Location deleted successfully"
}
```

---

**Request - Location Already Deleted:**
```bash
curl -X DELETE http://localhost:5000/location/2
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Location not found"
}
```

---

**Request - Invalid User ID (non-numeric):**
```bash
curl -X DELETE http://localhost:5000/location/invalid
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid user ID"
}
```

---

**Request - Non-existent User:**
```bash
curl -X DELETE http://localhost:5000/location/9999
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "User not found"
}
```

---

## Error Cases

### Common Error Scenarios

#### 1. Invalid JSON Format
```bash
curl -X POST http://localhost:5000/user/register \
  -H "Content-Type: application/json" \
  -d '{invalid json}'
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Unexpected token i in JSON at position 1"
}
```

---

#### 2. Route Not Found
```bash
curl http://localhost:5000/invalid/route
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Route not found: GET /invalid/route"
}
```

---

#### 3. Method Not Allowed (GET instead of POST)
```bash
curl http://localhost:5000/user/register
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Route not found: GET /user/register"
}
```

---

#### 4. Empty Request Body
```bash
curl -X POST http://localhost:5000/user/register \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Missing required fields: name, phoneNumber"
}
```

---

## Complete Testing Checklist

### ✅ User Registration
- [x] Valid user registration
- [x] Missing fields
- [x] Invalid phone format
- [x] Duplicate phone number

### ✅ Worker Registration
- [x] Valid worker registration (full details)
- [x] Valid worker registration (minimal)
- [x] Missing required fields
- [x] Invalid experience years (negative)
- [x] Invalid experience years (type)
- [x] Duplicate phone number

### ✅ Get Worker
- [x] Valid worker with location
- [x] Valid worker without location
- [x] Invalid ID format
- [x] Worker not found
- [x] Normal user (not a worker)

### ✅ Add Location
- [x] Valid location (all fields)
- [x] Valid location (only coordinates)
- [x] Missing latitude
- [x] Missing longitude
- [x] Invalid latitude (too high)
- [x] Invalid latitude (too low)
- [x] Invalid longitude (too high)
- [x] Invalid longitude (too low)
- [x] User not found
- [x] Invalid user ID
- [x] Update existing location

### ✅ Get Location
- [x] Valid location
- [x] Location not found
- [x] Invalid user ID
- [x] User not found

### ✅ Delete Location
- [x] Valid deletion
- [x] Already deleted
- [x] Invalid user ID
- [x] User not found

### ✅ Error Handling
- [x] Invalid JSON format
- [x] Route not found
- [x] Empty request body

---

## Postman Collection (JSON)

Save as `marketplace-api.postman_collection.json`:

```json
{
  "info": {
    "name": "Service Marketplace API",
    "description": "Complete API testing collection",
    "version": "1.0.0"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/health"
      }
    },
    {
      "name": "User - Register",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/user/register",
        "body": {
          "mode": "raw",
          "raw": "{\"name\": \"John Doe\", \"phoneNumber\": \"1234567890\"}"
        }
      }
    },
    {
      "name": "Worker - Register",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/worker/register",
        "body": {
          "mode": "raw",
          "raw": "{\"name\": \"Jane Smith\", \"phoneNumber\": \"9876543210\", \"experienceYears\": 5, \"bio\": \"Professional electrician\"}"
        }
      }
    },
    {
      "name": "Worker - Get Details",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/worker/2"
      }
    },
    {
      "name": "Location - Add/Update",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/location/2",
        "body": {
          "mode": "raw",
          "raw": "{\"latitude\": 40.7128, \"longitude\": -74.0060, \"areaName\": \"New York\"}"
        }
      }
    },
    {
      "name": "Location - Get",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/location/2"
      }
    },
    {
      "name": "Location - Delete",
      "request": {
        "method": "DELETE",
        "url": "{{baseUrl}}/location/2"
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000"
    }
  ]
}
```

---

## REST Client Extension (VS Code)

Save as `test-api.rest`:

```http
### Variables
@baseUrl = http://localhost:5000

### Health Check
GET {{baseUrl}}/health

### User - Register
POST {{baseUrl}}/user/register
Content-Type: application/json

{
  "name": "John Doe",
  "phoneNumber": "1234567890"
}

### Worker - Register
POST {{baseUrl}}/worker/register
Content-Type: application/json

{
  "name": "Jane Smith",
  "phoneNumber": "9876543210",
  "experienceYears": 5,
  "bio": "Professional electrician"
}

### Worker - Get Details
GET {{baseUrl}}/worker/2

### Location - Add/Update
POST {{baseUrl}}/location/2
Content-Type: application/json

{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "areaName": "New York, NY"
}

### Location - Get
GET {{baseUrl}}/location/2

### Location - Delete
DELETE {{baseUrl}}/location/2

### Error - Missing Fields
POST {{baseUrl}}/user/register
Content-Type: application/json

{
  "name": "Incomplete"
}

### Error - Invalid Phone
POST {{baseUrl}}/user/register
Content-Type: application/json

{
  "name": "Test User",
  "phoneNumber": "123"
}

### Error - Invalid Latitude
POST {{baseUrl}}/location/2
Content-Type: application/json

{
  "latitude": 91,
  "longitude": -74.0060
}

### Error - Worker Not Found
GET {{baseUrl}}/worker/9999

### Error - Location Not Found
GET {{baseUrl}}/location/9999
```

---

## Manual Testing Flow

### Scenario 1: Complete Registration Flow

1. **Register normal user:**
   ```bash
   curl -X POST http://localhost:5000/user/register \
     -H "Content-Type: application/json" \
     -d '{"name": "Alice", "phoneNumber": "1111111111"}'
   ```
   Note the returned `id` (e.g., `1`)

2. **Register worker:**
   ```bash
   curl -X POST http://localhost:5000/worker/register \
     -H "Content-Type: application/json" \
     -d '{"name": "Bob", "phoneNumber": "2222222222", "experienceYears": 3}'
   ```
   Note the returned `user.id` (e.g., `2`)

3. **Add location for worker:**
   ```bash
   curl -X POST http://localhost:5000/location/2 \
     -H "Content-Type: application/json" \
     -d '{"latitude": 40.7128, "longitude": -74.0060, "areaName": "New York"}'
   ```

4. **Retrieve worker details:**
   ```bash
   curl http://localhost:5000/worker/2
   ```
   Should show user + profile + location

---

## Testing Tips

✅ **Record IDs** - Note user IDs from registration for use in other tests
✅ **Test Errors** - Verify error messages match expectations
✅ **Test Duplicates** - Try registering with same phone number twice
✅ **Test Boundaries** - Use max/min coordinate values
✅ **Test Edge Cases** - Empty strings, null values, special characters
✅ **Test Ordering** - Add location before retrieving worker
✅ **Test Updates** - Add location, then update it

---

## Status Codes Reference

| Code | Meaning | Common Cases |
|------|---------|--------------|
| 200 | OK | GET requests succeed |
| 201 | Created | POST requests succeed |
| 400 | Bad Request | Validation error, missing fields |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate phone number |
| 500 | Server Error | Unexpected error |

---

## Response Format Reference

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description"
}
```

---

Done! You now have a complete API testing guide with:
✅ All 7 endpoints
✅ Valid & error test cases for each
✅ Multiple request formats
✅ Complete response examples
✅ Testing checklist
✅ Postman collection
✅ REST Client setup
✅ Manual testing flows
