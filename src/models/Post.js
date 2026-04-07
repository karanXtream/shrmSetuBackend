import mongoose from 'mongoose';

/**
 * Post Schema - Job Postings by Users
 * Stores job posting details posted by users looking for workers
 */
const postSchema = new mongoose.Schema(
  {
    // Reference to User
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },

    // Location
    location: {
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
      },
      pin: {
        type: String,
        required: [true, 'PIN code is required'],
        match: [/^\d{6}$/, 'PIN code must be 6 digits'],
      },
      address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
      },
    },

    // Skills Required
    requiredSkills: [
      {
        type: String,
        trim: true,
      },
    ],

    // Job Cost
    expectedPrice: {
      type: Number,
      required: [true, 'Expected price is required'],
      min: [0, 'Price cannot be negative'],
    },

    // Amenities
    amenities: {
      stayAvailable: {
        type: Boolean,
        default: false,
      },
      foodAvailable: {
        type: Boolean,
        default: false,
      },
    },

    // Work Photos
    workPhotos: [
      {
        type: String, // URLs of uploaded photos
      },
    ],

    // Status
    status: {
      type: String,
      enum: {
        values: ['active', 'completed', 'cancelled'],
        message: 'Status must be active, completed, or cancelled',
      },
      default: 'active',
    },

    // Engagement tracking
    views: {
      type: Number,
      default: 0,
    },
    applicants: [
      {
        workerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Worker',
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected'],
          default: 'pending',
        },
      },
    ],

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for faster queries
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ 'location.city': 1, status: 1 });

const Post = mongoose.model('Post', postSchema);

export default Post;
