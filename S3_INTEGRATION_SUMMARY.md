# AWS S3 Integration - Implementation Complete

## ✅ What's Done

### 1. **Configuration Files Created**
- `src/config/aws.js` - AWS S3 client with upload/delete functions
- `src/middlewares/upload.middleware.js` - Multer file handling middleware
- `.env.example` - Updated with AWS S3 credentials

### 2. **Modified Files**
- `src/controllers/auth.controller.js` - Added S3 upload logic to registration
- `src/routes/auth.routes.js` - Added multer file upload middleware
- `src/services/user.service.js` - Added media handling and WorkerProfile creation
- `package.json` - Added aws-sdk and multer dependencies

### 3. **Documentation**
- `S3_SETUP.md` - Complete setup guide with React Native examples

## 📦 Packages Added

```json
{
  "aws-sdk": "^2.1600.0",
  "multer": "^1.4.5-lts.1"
}
```

Install: `npm install`

## 🔧 Environment Variables Required

```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=bucket-name
```

## 📤 Registration Flow

**Before**: 
```
Form Data → Validation → User Created
```

**After**:
```
Form Data + Files → Validation → Upload to S3 → User Created + WorkerProfile with Media URLs
```

## 🎯 File Upload Endpoints

### POST /api/auth/register (With Files)

**Instead of JSON:**
```javascript
// Old (JSON):
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fullName, phoneNumber, ... })
});
```

**Use FormData:**
```javascript
// New (FormData for files):
const form = new FormData();
form.append('fullName', 'John Doe');
form.append('phoneNumber', '9876543210');
form.append('profilePhoto', photoFile);
form.append('shopPhotos', shopPhoto1);
form.append('shopPhotos', shopPhoto2);
form.append('introVideo', videoFile);

const response = await fetch('/api/auth/register', {
  method: 'POST',
  body: form,
  // Don't set Content-Type - FormData does it
});
```

## 🗂️ File Structure

```
backend/
├── src/
│   ├── config/
│   │   └── aws.js (NEW)
│   ├── controllers/
│   │   └── auth.controller.js (UPDATED)
│   ├── middlewares/
│   │   └── upload.middleware.js (NEW)
│   ├── routes/
│   │   └── auth.routes.js (UPDATED)
│   └── services/
│       └── user.service.js (UPDATED)
├── .env.example (UPDATED)
├── package.json (UPDATED)
└── S3_SETUP.md (NEW)
```

## 📝 API Changes

### Registration Now Supports

**Form Data Fields:**
- fullName (required)
- phoneNumber (required)
- email (optional)
- password (required)
- role (optional, defaults to 'user')
- city (required)
- state (required)
- pincode (required)
- addressLine1 (required)
- addressLine2 (optional)
- **profilePhoto (optional, file)**
- **shopPhotos (optional, multiple files)**
- **introVideo (optional, file)**

**File Constraints:**
- Images: JPEG, PNG, WebP (100MB max each)
- Videos: MP4, MOV, AVI, MKV (100MB max)
- Max 1 profile photo, 5 shop photos, 1 intro video

## ✨ Features

✅ **Automatic S3 Upload** - Files uploaded during registration  
✅ **Worker Profile Creation** - auto-creates with media for worker role  
✅ **File Validation** - type and size checks  
✅ **Public URLs** - files accessible immediately after upload  
✅ **Delete Support** - delete files from S3 via API  
✅ **Error Handling** - comprehensive error messages  

## 🚀 Next Steps

1. **Get AWS Credentials**
   - Create AWS account
   - Create S3 bucket
   - Create IAM user with S3 access

2. **Set Up Environment**
   ```bash
   cp .env.example .env
   # Edit .env with AWS credentials
   npm install
   ```

3. **Test Registration**
   - With Postman (multipart form data)
   - With Expo/React Native app
   - Verify files in S3 console

4. **Update Frontend**
   - Use FormData instead of JSON
   - Use file pickers (ImagePicker, DocumentPicker)
   - Send files to /api/auth/register

## 📚 Documentation

- **Full Setup Guide**: [S3_SETUP.md](S3_SETUP.md)
- **AWS SDK Docs**: [https://docs.aws.amazon.com/AWSJavaScriptSDK](https://docs.aws.amazon.com/AWSJavaScriptSDK)
- **Multer Docs**: [https://github.com/expressjs/multer](https://github.com/expressjs/multer)

## 🔒 Security Notes

- AWS credentials never exposed in API responses
- Files stored in public S3 (change ACL if needed)
- Multer validates file types and sizes
- Temporary buffer storage (not disk)

## ⚠️ Important

- **Never commit `.env` file** with real credentials
- **Use separate credentials** for dev vs production
- **Test with actual files** before production
- **Monitor S3 costs** - track file uploads
