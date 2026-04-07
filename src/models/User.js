import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema - Base Identity & Authentication
 * Stores common user data and authentication credentials
 * Worker-specific data is stored in WorkerProfile collection
 */
const userSchema = new mongoose.Schema(
  {
    // Identity
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
    },

    // Contact Information
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      sparse: true,
      match: [/^\d{10}$/, 'Phone number must be 10 digits'],
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    // Email & Authentication
    email: {
      type: String,
      unique: true,
      sparse: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format'],
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Don't return passwordHash by default
    },

    // Role
    role: {
      type: String,
      enum: {
        values: ['user', 'worker'],
        message: 'Role must be either "user" or "worker"',
      },
      default: 'user',
    },

    // Location (Embedded)
    location: {
      city: String,
      state: String,
      pincode: String,
      addressLine1: String,
      addressLine2: String,
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
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
    toJSON: { select: '-passwordHash' }, // Never return password hash in JSON
  }
);

/**
 * Indexes for performance
 */
userSchema.index({ phoneNumber: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

/**
 * Middleware: Hash password before saving
 */
userSchema.pre('save', async function (next) {
  // Only hash if password is modified
  if (!this.isModified('passwordHash')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method: Compare password with hash
 * @param {string} plainPassword - Plain text password to compare
 * @returns {Promise<boolean>} - True if password matches
 */
userSchema.methods.comparePassword = async function (plainPassword) {
  try {
    return await bcrypt.compare(plainPassword, this.passwordHash);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};

/**
 * Instance method: Get safe user data (without password)
 */
userSchema.methods.toSafeJSON = function () {
  const userObject = this.toObject();
  delete userObject.passwordHash;
  return userObject;
};

export default mongoose.model('User', userSchema);
