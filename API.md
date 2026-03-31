# Service Marketplace Backend - API Documentation

## Base URL
```
http://localhost:5000
```

## Health Check
```
GET /health
```
Response:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

---

## User Endpoints

### Register Normal User
```
POST /user/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "phoneNumber": "1234567890"
}
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
    "createdAt": "2026-03-23T10:30:00Z"
  }
}
```

**Error Response (409 Conflict):**
```json
{
  "success": false,
  "error": "Phone number already registered"
}
```

---

## Worker Endpoints

### Register Worker
```
POST /worker/register
```

**Request Body:**
```json
{
  "name": "Jane Smith",
  "phoneNumber": "9876543210",
  "experienceYears": 5,
  "bio": "Professional electrician with 5 years of experience"
}
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
      "createdAt": "2026-03-23T10:35:00Z"
    },
    "workerProfile": {
      "id": 1,
      "userId": 2,
      "experienceYears": 5,
      "bio": "Professional electrician with 5 years of experience",
      "isAvailable": true,
      "createdAt": "2026-03-23T10:35:00Z"
    }
  }
}
```

**Notes:**
- Creates both user and worker_profiles in a single transaction
- `experienceYears` defaults to 0 if not provided
- `bio` is optional

---

### Get Worker Details
```
GET /worker/:id
```

**Path Parameters:**
- `id` (integer): User ID of the worker

**Response (200 OK):**
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
      "bio": "Professional electrician with 5 years of experience",
      "isAvailable": true,
      "createdAt": "2026-03-23T10:35:00Z"
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

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Worker not found"
}
```

---

## Location Endpoints

### Add or Update Location
```
POST /location/:userId
```

**Path Parameters:**
- `userId` (integer): User ID

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "areaName": "New York, NY"
}
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
    "createdAt": "2026-03-23T10:40:00Z"
  }
}
```

**Validation:**
- `latitude`: Required, must be between -90 and 90
- `longitude`: Required, must be between -180 and 180
- `areaName`: Optional

---

### Get Location
```
GET /location/:userId
```

**Path Parameters:**
- `userId` (integer): User ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 2,
    "latitude": 40.7128,
    "longitude": -74.0060,
    "areaName": "New York, NY",
    "createdAt": "2026-03-23T10:40:00Z"
  }
}
```

---

### Delete Location
```
DELETE /location/:userId
```

**Path Parameters:**
- `userId` (integer): User ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Location deleted successfully"
}
```

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "Error description"
}
```

**Common HTTP Status Codes:**
- `200 OK` - Successful GET request
- `201 Created` - Successful POST request
- `400 Bad Request` - Invalid request data or validation error
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate phone number or similar conflict
- `500 Internal Server Error` - Server error

---

## Data Validation Rules

### Phone Number
- Format: 10-15 digits
- Must be unique across all users
- Required for registration

### Name
- Required for registration
- No specific format restrictions
- Non-empty string

### Experience Years (Worker)
- Must be a non-negative integer
- Defaults to 0

### Coordinates (Location)
- Latitude: -90 to 90
- Longitude: -180 to 180
- Both required for location creation

---

## Example Workflow

1. **Register a normal user:**
   ```bash
   POST /user/register
   {
     "name": "Alice Johnson",
     "phoneNumber": "5555555555"
   }
   ```

2. **Register a worker:**
   ```bash
   POST /worker/register
   {
     "name": "Bob Smith",
     "phoneNumber": "4444444444",
     "experienceYears": 3,
     "bio": "Plumber"
   }
   ```

3. **Add worker location:**
   ```bash
   POST /location/2
   {
     "latitude": 40.7128,
     "longitude": -74.0060,
     "areaName": "New York"
   }
   ```

4. **Retrieve worker details:**
   ```bash
   GET /worker/2
   ```
   Returns user info + worker profile + location
