import mongoose from 'mongoose';

/**
 * WorkerProfile Schema - Worker-specific Data
 * Stores data unique to workers
 * DO NOT duplicate user data (name, phone, address) - use userId reference
 */
const workerProfileSchema = new mongoose.Schema(
  {
    // Reference to User
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },

    // Experience
    experienceYears: {
      type: Number,
      default: 0,
      min: [0, 'Experience years cannot be negative'],
    },

    // Availability
    isAvailable: {
      type: Boolean,
      default: true,
    },

    // Skills (array of strings or references)
    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    // Media (Embedded Object)
    media: {
      profilePhoto: {
        type: String, // URL only
        default: null,
      },
      shopPhotos: [
        {
          type: String, // Array of URLs
        },
      ],
      introductoryVideo: {
        type: String, // URL only
        default: null,
      },
    },

    // Certificate (Embedded Object)
    certificate: {
      fileUrl: {
        type: String, // URL only
        default: null,
      },
      verifiedAt: Date,
      verifiedBy: mongoose.Schema.Types.ObjectId, // Admin user ID
    },

    // Professional Info
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    hourlyRate: {
      type: Number,
      min: [0, 'Hourly rate cannot be negative'],
    },

    // Rating & Reviews
    rating: {
      averageRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
    },

    // Verification Status
    isVerified: {
      type: Boolean,
      default: false,
    },

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
  {
    timestamps: true,
  }
);

/**
 * Indexes for performance
 */
workerProfileSchema.index({ userId: 1 });
workerProfileSchema.index({ isAvailable: 1 });
workerProfileSchema.index({ skills: 1 });
workerProfileSchema.index({ isVerified: 1 });
workerProfileSchema.index({ rating: -1 });

/**
 * Pre-populate User data when querying
 */
workerProfileSchema.pre(/^find/, function () {
  if (this.options._recursed) {
    return;
  }
  this.populate({
    path: 'userId',
    select: 'fullName phoneNumber email location isPhoneVerified isActive',
  });
});

export default mongoose.model('WorkerProfile', workerProfileSchema);
