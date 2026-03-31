import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
    },
    url: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ['photo', 'video', 'document'],
      required: true,
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
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

export default mongoose.model('Media', mediaSchema);
