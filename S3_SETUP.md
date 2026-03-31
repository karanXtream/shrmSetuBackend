# AWS S3 File Upload Setup Guide

## Overview
Users can now upload photos and videos directly during registration, which are automatically uploaded to AWS S3.

## Setup Steps

### 1. Install Dependencies
```bash
npm install aws-sdk multer
```

### 2. Create AWS S3 Bucket

1. Go to [AWS Console](https://console.aws.amazon.com)
2. Navigate to **S3** > **Create Bucket**
3. Bucket name: `shrm-setu-marketplace` (or your choice)
4. Region: `us-east-1` (or your region)
5. Block Public Access: Uncheck "Block all public access"
6. Click **Create Bucket**

### 3. Create IAM User for S3 Access

1. Go to **IAM** > **Users** > **Create User**
2. Username: `shrm-setu-s3-user`
3. Attach policy: `AmazonS3FullAccess` (for bucket access)
4. Click **Create User**
5. In **Security Credentials**, create **Access Key**
6. Copy **Access Key ID** and **Secret Access Key**

### 4. Configure Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/shrm-setu

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET=shrm-setu-marketplace
```

### 5. File Upload Flow

#### During Registration (POST /api/auth/register)

**Request** (Form Data):
```
- Form Fields:
  fullName: "John Doe"
  phoneNumber: "9876543210"
  password: "Secure@Pass123"
  city: "Mumbai"
  state: "Maharashtra"
  pincode: "400001"
  addressLine1: "123 Main Street"
  role: "worker"

- Files:
  profilePhoto: [image file]
  shopPhotos: [image file 1, image file 2, ...]
  introVideo: [video file]
```

**Flow**:
1. User selects files in mobile app
2. Files sent as FormData to API
3. Multer middleware receives files in memory
4. AWS SDK uploads each file to S3
5. S3 returns public URL for each file
6. User created with media URLs in database
7. Response includes user data with media URLs

**Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "phoneNumber": "9876543210",
    "email": "",
    "role": "worker",
    "location": {
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "addressLine1": "123 Main Street"
    },
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 6. Worker Profile Creation

When a worker registers, a WorkerProfile is automatically created with media:

```javascript
{
  _id: ObjectId,
  userId: ObjectId,  // Reference to User
  media: {
    profilePhoto: "https://shrm-setu-marketplace.s3.us-east-1.amazonaws.com/...",
    shopPhotos: [
      "https://shrm-setu-marketplace.s3.us-east-1.amazonaws.com/...",
      "https://shrm-setu-marketplace.s3.us-east-1.amazonaws.com/..."
    ],
    introductoryVideo: "https://shrm-setu-marketplace.s3.us-east-1.amazonaws.com/..."
  },
  createdAt: Date,
  updatedAt: Date
}
```

## React Native Implementation

```javascript
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

const pickProfilePhoto = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.cancelled) {
    return result.assets[0];
  }
};

const pickShopPhotos = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultiple: true,
    quality: 0.8,
  });

  return result.assets || [];
};

const pickVideo = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'video/*',
  });

  return result;
};

const registerWorker = async (formData) => {
  const data = new FormData();

  // Add form fields
  data.append('fullName', formData.fullName);
  data.append('phoneNumber', formData.phoneNumber);
  data.append('password', formData.password);
  data.append('city', formData.city);
  data.append('state', formData.state);
  data.append('pincode', formData.pincode);
  data.append('addressLine1', formData.addressLine1);
  data.append('role', 'worker');

  // Add profile photo
  if (formData.profilePhoto) {
    data.append('profilePhoto', {
      uri: formData.profilePhoto.uri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    });
  }

  // Add shop photos
  if (formData.shopPhotos && formData.shopPhotos.length > 0) {
    formData.shopPhotos.forEach((photo, index) => {
      data.append('shopPhotos', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: `shop-${index}.jpg`,
      });
    });
  }

  // Add intro video
  if (formData.introVideo) {
    data.append('introVideo', {
      uri: formData.introVideo.uri,
      type: 'video/mp4',
      name: 'intro.mp4',
    });
  }

  try {
    const response = await fetch('http://your-server-ip:5000/api/auth/register', {
      method: 'POST',
      body: data,
      // Don't set Content-Type - FormData/fetch does it automatically
    });

    const json = await response.json();
    
    if (json.success) {
      console.log('Registration successful!', json.data);
      // Save user data, navigate to next screen
    } else {
      console.error('Registration failed:', json.message);
    }
  } catch (error) {
    console.error('Upload error:', error);
  }
};
```

## File Constraints

- **Profile Photo**: Max 1 file, 100MB limit, JPEG/PNG/WebP only
- **Shop Photos**: Max 5 files, 100MB limit each, JPEG/PNG/WebP only
- **Intro Video**: Max 1 file, 100MB limit, MP4/MOV/AVI/MKV only

## S3 Folder Structure

Files are organized by timestamp and random string:
```
s3://shrm-setu-marketplace/uploads/
  ├── 1705321800000-abc123-profile.jpg
  ├── 1705321800001-def456-shop1.jpg
  ├── 1705321800002-ghi789-shop2.jpg
  └── 1705321800003-jkl012-intro.mp4
```

## Delete Files Endpoint

To delete a file from S3:
```
DELETE /api/workers/:userId/shop-photo
Body: { photoUrl: "https://..." }
```

The `deleteFromS3` function automatically:
1. Extracts the key from S3 URL
2. Calls S3 delete operation
3. Returns success/failure

## Troubleshooting

### "InvalidAccessKeyId" Error
- Check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in `.env`
- Verify credentials are correct in AWS Console

### "NoSuchBucket" Error
- Check AWS_S3_BUCKET name matches your S3 bucket
- Verify bucket exists in AWS Console

### "Access Denied" Error
- Check IAM user has `AmazonS3FullAccess` policy
- Check bucket ACL allows public-read

### Files Not Uploaded
- Check multer file size limit (currently 100MB)
- Check file type matches allowed types
- Check network connection

## Production Checklist

- [ ] Create separate AWS IAM user for production (not root account)
- [ ] Enable versioning on S3 bucket
- [ ] Enable CloudFront CDN for faster downloads
- [ ] Set up S3 lifecycle policy to delete old files
- [ ] Enable S3 encryption at rest
- [ ] Set up CloudWatch monitoring for S3 bucket
- [ ] Test with actual mobile devices
- [ ] Set up error logging/monitoring

## Security Best Practices

1. **Never commit credentials** to git - use `.env` file
2. **Use separate credentials** for production vs development
3. **Enable MFA** on AWS account
4. **Restrict bucket access** - only allow your app IP
5. **Enable S3 bucket logging** for audit trail
6. **Set object expiration** to clean up old files
7. **Use signed URLs** for sensitive files (future enhancement)
