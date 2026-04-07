# Post API Documentation

This document outlines all the API endpoints available for managing job posts in the ShramSetu application.

## Base URL
```
http://localhost:5000/api/posts
```

---

## Endpoints

### 1. Create a New Job Post
**POST** `/api/posts`

Create a new job posting for finding workers.

**Request Body:**
```json
{
  "userId": "64f5e2a1c1a2b3c4d5e6f7g7",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pin": "400001",
  "address": "Near Gateway of India, apartment complex",
  "requiredSkills": ["Electrician", "Plumber", "Custom Skill"],
  "expectedPrice": 5000,
  "stayAvailable": true,
  "foodAvailable": true,
  "workPhotos": [
    "https://example.com/photo1.jpg",
    "https://example.com/photo2.jpg"
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "_id": "64f5e3b2c1a2b3c4d5e6f7g8",
    "userId": "64f5e2a1c1a2b3c4d5e6f7g7",
    "location": {
      "city": "Mumbai",
      "state": "Maharashtra",
      "pin": "400001",
      "address": "Near Gateway of India, apartment complex"
    },
    "requiredSkills": ["Electrician", "Plumber", "Custom Skill"],
    "expectedPrice": 5000,
    "amenities": {
      "stayAvailable": true,
      "foodAvailable": true
    },
    "workPhotos": ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"],
    "status": "active",
    "views": 0,
    "applicants": [],
    "createdAt": "2024-04-07T10:30:00.000Z",
    "updatedAt": "2024-04-07T10:30:00.000Z"
  }
}
```

---

### 2. Get All Posts with Filtering
**GET** `/api/posts`

Retrieve all job posts with optional filtering and pagination.

**Query Parameters:**
- `city` (string, optional): Filter by city name
- `state` (string, optional): Filter by state name
- `skill` (string, optional): Filter by required skill
- `status` (string, optional): Filter by status (active, completed, cancelled) - default: active
- `skip` (number, optional): Number of posts to skip for pagination - default: 0
- `limit` (number, optional): Number of posts to return - default: 20

**Example Request:**
```
GET /api/posts?city=Mumbai&skill=Electrician&skip=0&limit=20
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f5e3b2c1a2b3c4d5e6f7g8",
      "userId": {
        "_id": "64f5e2a1c1a2b3c4d5e6f7g7",
        "fullName": "John Doe",
        "phoneNumber": "9876543210",
        "location": { "city": "Mumbai", "state": "Maharashtra" }
      },
      "location": { "city": "Mumbai", "state": "Maharashtra", "pin": "400001", "address": "..." },
      "requiredSkills": ["Electrician", "Plumber"],
      "expectedPrice": 5000,
      "amenities": { "stayAvailable": true, "foodAvailable": true },
      "workPhotos": ["..."],
      "status": "active",
      "views": 15,
      "createdAt": "2024-04-07T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 45,
    "skip": 0,
    "limit": 20,
    "hasMore": true
  }
}
```

---

### 3. Get Single Post by ID
**GET** `/api/posts/:id`

Retrieve detailed information about a specific job post. (Increments view count)

**URL Parameters:**
- `id` (string, required): Post ID

**Example Request:**
```
GET /api/posts/64f5e3b2c1a2b3c4d5e6f7g8
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "64f5e3b2c1a2b3c4d5e6f7g8",
    "userId": {
      "_id": "64f5e2a1c1a2b3c4d5e6f7g7",
      "fullName": "John Doe",
      "phoneNumber": "9876543210",
      "email": "john@example.com",
      "location": { "city": "Mumbai", "state": "Maharashtra" }
    },
    "location": { "city": "Mumbai", "state": "Maharashtra", "pin": "400001", "address": "..." },
    "requiredSkills": ["Electrician", "Plumber"],
    "expectedPrice": 5000,
    "amenities": { "stayAvailable": true, "foodAvailable": true },
    "workPhotos": ["..."],
    "status": "active",
    "views": 16,
    "applicants": [
      {
        "_id": "64f5e4c3d1a2b3c4d5e6f7g9",
        "workerId": { "_id": "...", "fullName": "Worker Name", "skills": ["Electrician"] },
        "appliedAt": "2024-04-07T11:00:00.000Z",
        "status": "pending"
      }
    ]
  }
}
```

---

### 4. Get Posts by User
**GET** `/api/posts/user/:userId`

Retrieve all posts created by a specific user.

**URL Parameters:**
- `userId` (string, required): User ID

**Query Parameters:**
- `status` (string, optional): Filter by status (active, completed, cancelled, all) - default: active
- `skip` (number, optional): Pagination skip - default: 0
- `limit` (number, optional): Pagination limit - default: 20

**Example Request:**
```
GET /api/posts/user/64f5e2a1c1a2b3c4d5e6f7g7?status=all&limit=10
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [...]
}
```

---

### 5. Update a Post
**PATCH** `/api/posts/:id`

Update an existing job post. Only the post owner can update.

**URL Parameters:**
- `id` (string, required): Post ID

**Request Body:** (All fields optional)
```json
{
  "city": "Bangalore",
  "state": "Karnataka",
  "pin": "560001",
  "address": "Updated address",
  "requiredSkills": ["Electrician", "AC Technician"],
  "expectedPrice": 6000,
  "stayAvailable": false,
  "foodAvailable": true,
  "workPhotos": ["..."],
  "status": "completed"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Post updated successfully",
  "data": { ... }
}
```

**Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Not authorized to update this post"
}
```

---

### 6. Delete a Post
**DELETE** `/api/posts/:id`

Delete a job post. Only the post owner can delete.

**URL Parameters:**
- `id` (string, required): Post ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

**Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Not authorized to delete this post"
}
```

---

### 7. Apply for a Post
**POST** `/api/posts/:id/apply`

Submit an application as a worker for a job post.

**URL Parameters:**
- `id` (string, required): Post ID

**Request Body:**
```json
{
  "workerId": "64f5e4d4e1a2b3c4d5e6f7g0"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": { ... }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "You have already applied for this post"
}
```

---

### 8. Update Applicant Status
**PATCH** `/api/posts/:id/applicant/:applicantId`

Accept or reject an application. Only the post owner can update.

**URL Parameters:**
- `id` (string, required): Post ID
- `applicantId` (string, required): Applicant ID

**Request Body:**
```json
{
  "status": "accepted"
}
```

Valid status values: `pending`, `accepted`, `rejected`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Applicant status updated successfully",
  "data": { ... }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Location details (city, state, pin, address) are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Not authorized to perform this action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Post not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Frontend Integration Example

### Creating a Post (from the Post Form)
```javascript
const createPost = async (formData, userId) => {
  try {
    const response = await fetch('http://your-api-url/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        city: formData.city,
        state: formData.state,
        pin: formData.pin,
        address: formData.address,
        requiredSkills: formData.requiredSkills,
        expectedPrice: formData.price,
        stayAvailable: formData.stayAvailable,
        foodAvailable: formData.foodAvailable,
        workPhotos: formData.workPhotos
      })
    });

    const data = await response.json();
    if (data.success) {
      Alert.alert('Success', 'Post created successfully');
    } else {
      Alert.alert('Error', data.message);
    }
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

### Fetching Posts with Filters
```javascript
const fetchPosts = async (filters) => {
  try {
    const queryParams = new URLSearchParams({
      city: filters.city || '',
      skill: filters.skill || '',
      status: 'active',
      limit: 20
    });

    const response = await fetch(
      `http://your-api-url/api/posts?${queryParams}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
};
```

---

## Notes

- All location fields (city, state, address) are trimmed and validated
- PIN code must be exactly 6 digits
- Price must be a positive number
- At least one skill and one photo are required when creating a post
- Views are automatically incremented when a post is retrieved
- Timestamps are automatically managed (createdAt, updatedAt)
- Applicants can view their application status

## Troubleshooting

### Error: "Request body is empty"

This means the server didn't receive any data. Common causes:

**1. Missing or Wrong Content-Type Header**
```javascript
❌ WRONG:
fetch('http://your-api-url/api/posts', {
  method: 'POST',
  body: JSON.stringify(data)
});

✅ CORRECT:
fetch('http://your-api-url/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'  // REQUIRED!
  },
  body: JSON.stringify(data)
});
```

**2. Using FormData instead of JSON**
```javascript
❌ WRONG:
const formData = new FormData();
formData.append('userId', userId);
formData.append('city', city);
// ... more fields
fetch('http://your-api-url/api/posts', {
  method: 'POST',
  body: formData  // Don't send FormData for JSON API
});

✅ CORRECT:
fetch('http://your-api-url/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId,
    city,
    // ... more fields
  })
});
```

**3. Not actually sending the body**
```javascript
❌ WRONG:
const response = await fetch('http://your-api-url/api/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
  // Missing body!
});

✅ CORRECT:
const response = await fetch('http://your-api-url/api/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: '...',
    city: '...',
    state: '...',
    pin: '...',
    address: '...',
    requiredSkills: [],
    expectedPrice: 5000,
    stayAvailable: true,
    foodAvailable: true,
    workPhotos: []
  })
});
```

### Working Example for React Native / Expo

```javascript
import { Alert } from 'react-native';
import axios from 'axios';

const createPost = async (formData, userId) => {
  try {
    const payload = {
      userId,                           // User ID from login
      city: formData.city,
      state: formData.state,
      pin: formData.pin,
      address: formData.address,
      requiredSkills: formData.requiredSkills,  // Array of strings
      expectedPrice: Number(formData.price),     // Convert to number
      stayAvailable: Boolean(formData.stayAvailable),
      foodAvailable: Boolean(formData.foodAvailable),
      workPhotos: formData.workPhotos   // Array of image URIs or URLs
    };

    console.log('Sending post with payload:', payload);

    // Option 1: Using Axios (Recommended)
    const response = await axios.post(
      'http://your-api-url/api/posts',
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000  // 30 second timeout
      }
    );

    if (response.data.success) {
      Alert.alert('Success', 'Post created successfully!');
      return response.data.data;
    } else {
      Alert.alert('Error', response.data.message);
      return null;
    }

  } catch (error) {
    console.error('Error creating post:', error);
    
    if (error.response) {
      // Server responded with error
      Alert.alert('Server Error', error.response.data.message);
      console.error('Debug info:', error.response.data.debug);
    } else if (error.request) {
      // Request made but no response
      Alert.alert('Network Error', 'No response from server');
    } else {
      // Error in request setup
      Alert.alert('Error', error.message);
    }
    
    return null;
  }
};

// Alternative: Using Fetch API
const createPostFetch = async (formData, userId) => {
  try {
    const payload = {
      userId,
      city: formData.city,
      state: formData.state,
      pin: formData.pin,
      address: formData.address,
      requiredSkills: formData.requiredSkills,
      expectedPrice: Number(formData.price),
      stayAvailable: Boolean(formData.stayAvailable),
      foodAvailable: Boolean(formData.foodAvailable),
      workPhotos: formData.workPhotos
    };

    const response = await fetch('http://your-api-url/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'  // ← CRITICAL
      },
      body: JSON.stringify(payload)         // ← Must be stringified
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Server error:', data);
      Alert.alert('Error', data.message);
      if (data.debug) {
        console.error('Debug:', data.debug);
      }
      return null;
    }

    Alert.alert('Success', 'Post created successfully!');
    return data.data;

  } catch (error) {
    console.error('Error:', error);
    Alert.alert('Error', error.message);
    return null;
  }
};

export { createPost, createPostFetch };
```

### How to Test

1. **Using Postman (Correct Way):**

   **Step 1: Set up the request**
   - Method: **POST**
   - URL: `http://localhost:5000/api/posts`

   **Step 2: Set Headers**
   - Click on "Headers" tab
   - Make sure `Content-Type: application/json` is set
   - (Postman usually auto-sets this)

   **Step 3: Add Body** ⚠️ IMPORTANT!
   - Click on **"Body"** tab (not form-data, not x-www-form-urlencoded)
   - Select **"raw"** radio button (left side)
   - From the dropdown on the right, select **"JSON"** (not Text)
   - Paste this JSON:
   
   ```json
   {
     "userId": "64f5e2a1c1a2b3c4d5e6f7g7",
     "city": "Mumbai",
     "state": "Maharashtra",
     "pin": "400001",
     "address": "Test address here",
     "requiredSkills": ["Electrician", "Plumber"],
     "expectedPrice": 5000,
     "stayAvailable": true,
     "foodAvailable": true,
     "workPhotos": [
       "https://via.placeholder.com/300?text=Photo1",
       "https://via.placeholder.com/300?text=Photo2"
     ]
   }
   ```

   **Step 4: Send**
   - Click the blue **"Send"** button

   **Screenshot Reference:**
   ```
   ┌─ POST | http://localhost:5000/api/posts ─────────────────┐
   │                                                            │
   │ [Params] [Headers] [Body] [Tests] [Scripts]              │
   │                                                            │
   │ In Body tab:                                              │
   │ ⦿ form-data  ○ x-www-form-urlencoded  ⦿ raw  ○ binary   │
   │                                                            │
   │ [Dropdown showing "JSON"]                                 │
   │                                                            │
   │ {                                                          │
   │   "userId": "64f5e2a1c1a2b3c4d5e6f7g7",                 │
   │   "city": "Mumbai",                                       │
   │   ...                                                     │
   │ }                                                          │
   │                                                            │
   │ [Send] Button                                             │
   └────────────────────────────────────────────────────────────┘
   ```

2. **Common Postman Mistakes:**

   ❌ **WRONG - Using "form-data":**
   ```
   This sends data as key-value pairs, NOT JSON
   Body tab shows:
   - KEY-VALUE pairs like form fields
   - You type each field individually
   - Arrays don't work properly
   - This causes "bodyKeys: []" error
   
   Example (WRONG):
   [form-data selected]
   uid: 64f5e2a1c1a2b3c4d5e6f7g7
   city: Mumbai
   requiredSkills: ["Electrician"]  ← Breaks!
   ```

   ❌ **WRONG - Using "x-www-form-urlencoded":**
   ```
   Similar to form-data, sends URL-encoded data, not JSON
   ```

   ✅ **CORRECT - Use "raw" with "JSON":**
   ```
   Body tab select:
   ⦿ raw    (select this)
   ○ form-data
   ○ x-www-form-urlencoded
   ○ binary
   
   Then select JSON from dropdown on the right
   
   Then paste your JSON object:
   {
     "userId": "64f5e2a1c1a2b3c4d5e6f7g7",
     "city": "Mumbai",
     "state": "Maharashtra",
     "pin": "400001",
     "address": "Test address",
     "requiredSkills": ["Electrician", "Plumber"],
     "expectedPrice": 5000,
     "stayAvailable": true,
     "foodAvailable": true,
     "workPhotos": ["https://via.placeholder.com/300?text=Photo1"]
   }
   ```

3. **Verify Your JSON is Valid:**
   - Copy your JSON from Postman
   - Paste it here: https://jsonlint.com/
   - It should say "Valid JSON"
   - If it shows errors, fix them before sending

4. **Quick Postman Test (Copy-Paste):**
   - Create new request
   - POST to: `http://localhost:5000/api/posts`
   - Go to Body tab
   - Select "raw" and "JSON"
   - Paste this exactly:
   ```json
   {
     "userId": "test-user-123",
     "city": "Mumbai",
     "state": "Maharashtra",
     "pin": "400001",
     "address": "Test Address",
     "requiredSkills": ["Electrician"],
     "expectedPrice": 5000,
     "stayAvailable": true,
     "foodAvailable": true,
     "workPhotos": ["https://via.placeholder.com/300"]
   }
   ```
   - Send and check response

5. **If Still Getting Empty Body Error:**
   - Open browser DevTools (F12) → Network tab
   - Make the request from Postman
   - Right-click the request → Edit and resend
   - Check the "Request Payload" in the Network tab
   - It should show your JSON data
   - If it's empty, Postman isn't sending anything

   **OR: Check Server Logs**
   - Look at backend console output
   - You should see the request logged:
     ```
     [2024-04-07T10:30:00.000Z] POST /api/posts
     Headers: { 'content-type': 'application/json', ... }
     Body: { your data here }
     ```
   - If Body is empty `{}`, Postman didn't send data

2. **Using cURL:**
   ```bash
   curl -X POST http://localhost:5000/api/posts \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "64f5e2a1c1a2b3c4d5e6f7g7",
       "city": "Mumbai",
       "state": "Maharashtra",
       "pin": "400001",
       "address": "Test address",
       "requiredSkills": ["Electrician"],
       "expectedPrice": 5000,
       "stayAvailable": true,
       "foodAvailable": true,
       "workPhotos": ["https://example.com/photo.jpg"]
     }'
   ```

3. **Using Node.js/Browser Console:**
   - See `TEST_POST_API.js` file for complete examples
   - Run `testCreatePost()` to test the API

### Debug Response

If you get an error, the response will include debug info:

```json
{
  "success": false,
  "message": "Request body is empty. Make sure to send JSON with Content-Type: application/json header",
  "debug": {
    "contentType": "application/json",
    "bodyExists": false,
    "bodyKeys": []
  }
}
```

**What each debug field means:**
- `contentType`: The Content-Type header that was sent
- `bodyExists`: Whether req.body was populated
- `bodyKeys`: The actual keys received in the body

### Common Mistakes Checklist

- [ ] Content-Type header is set to `'application/json'`
- [ ] Using `JSON.stringify()` on the data
- [ ] All required fields are included: userId, city, state, pin, address, requiredSkills, expectedPrice, workPhotos
- [ ] requiredSkills is an array (even if just one skill)
- [ ] workPhotos is an array (even if just one photo)
- [ ] expectedPrice is a number, not a string
- [ ] stayAvailable and foodAvailable are booleans, not strings
- [ ] No typos in field names (case-sensitive)
