import Post from '../models/Post.js';
import { uploadToS3, deleteFromS3 } from '../config/aws.js';

/**
 * Post Controller - Job posting operations
 */

/**
 * POST /api/posts
 * Create a new job post
 */
export const createPost = async (req, res) => {
  try {
    // Check if req.body exists
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error('Request body is empty:', {
        body: req.body,
        headers: req.headers,
        contentType: req.headers['content-type']
      });
      
      return res.status(400).json({
        success: false,
        message: 'Request body is empty. Make sure to send JSON with Content-Type: application/json header',
        debug: {
          contentType: req.headers['content-type'],
          bodyExists: !!req.body,
          bodyKeys: req.body ? Object.keys(req.body) : []
        }
      });
    }

    const {
      userId,
      city,
      state,
      pin,
      address,
      requiredSkills,
      expectedPrice,
      stayAvailable,
      foodAvailable,
      workPhotos,
    } = req.body;

    // Validate userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    // Validate required fields
    if (!city || !state || !pin || !address) {
      return res.status(400).json({
        success: false,
        message: 'Location details (city, state, pin, address) are required',
      });
    }

    if (!requiredSkills || requiredSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one skill is required',
      });
    }

    if (!expectedPrice) {
      return res.status(400).json({
        success: false,
        message: 'Expected price is required',
      });
    }

    if (!workPhotos || workPhotos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one work photo is required',
      });
    }

    // Validate PIN code format
    if (!/^\d{6}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        message: 'PIN code must be 6 digits',
      });
    }

    // Create post
    const post = await Post.create({
      userId,
      location: {
        city: city.trim(),
        state: state.trim(),
        pin,
        address: address.trim(),
      },
      requiredSkills: Array.isArray(requiredSkills)
        ? requiredSkills.map((skill) => skill.trim())
        : [requiredSkills.trim()],
      expectedPrice: Number(expectedPrice),
      amenities: {
        stayAvailable: Boolean(stayAvailable),
        foodAvailable: Boolean(foodAvailable),
      },
      workPhotos: Array.isArray(workPhotos) ? workPhotos : [workPhotos],
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating post',
    });
  }
};

/**
 * GET /api/posts
 * Get all posts with filtering and pagination
 * Query: { city, state, skill, status, skip, limit }
 */
export const getAllPosts = async (req, res) => {
  try {
    const { city, state, skill, status = 'active', skip = 0, limit = 20 } = req.query;

    // Build filter
    const filter = { status };

    if (city) {
      filter['location.city'] = { $regex: city, $options: 'i' };
    }

    if (state) {
      filter['location.state'] = { $regex: state, $options: 'i' };
    }

    if (skill) {
      filter.requiredSkills = { $in: [new RegExp(skill, 'i')] };
    }

    // Fetch posts with user details
    const posts = await Post.find(filter)
      .populate('userId', 'fullName phoneNumber location')
      .skip(Number(skip))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Post.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        total,
        skip: Number(skip),
        limit: Number(limit),
        hasMore: Number(skip) + Number(limit) < total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching posts',
    });
  }
};

/**
 * GET /api/posts/:id
 * Get a single post by ID
 */
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id)
      .populate('userId', 'fullName phoneNumber location email')
      .populate('applicants.workerId', 'fullName skills');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Increment views
    post.views += 1;
    await post.save();

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching post',
    });
  }
};

/**
 * GET /api/posts/user/:userId
 * Get all posts by a specific user
 */
export const getPostsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status = 'active', skip = 0, limit = 20 } = req.query;

    const filter = { userId };

    if (status !== 'all') {
      filter.status = status;
    }

    const posts = await Post.find(filter)
      .skip(Number(skip))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Post.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        total,
        skip: Number(skip),
        limit: Number(limit),
        hasMore: Number(skip) + Number(limit) < total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user posts',
    });
  }
};

/**
 * PATCH /api/posts/:id
 * Update a post
 */
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'Request body is required',
      });
    }

    const {
      userId,
      city,
      state,
      pin,
      address,
      requiredSkills,
      expectedPrice,
      stayAvailable,
      foodAvailable,
      workPhotos,
      status,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check ownership
    if (post.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post',
      });
    }

    // Update fields
    if (city) post.location.city = city.trim();
    if (state) post.location.state = state.trim();
    if (pin) post.location.pin = pin;
    if (address) post.location.address = address.trim();
    if (requiredSkills) post.requiredSkills = requiredSkills.map((skill) => skill.trim());
    if (expectedPrice) post.expectedPrice = Number(expectedPrice);
    if (stayAvailable !== undefined) post.amenities.stayAvailable = Boolean(stayAvailable);
    if (foodAvailable !== undefined) post.amenities.foodAvailable = Boolean(foodAvailable);
    if (workPhotos) post.workPhotos = workPhotos;
    if (status && ['active', 'completed', 'cancelled'].includes(status)) {
      post.status = status;
    }

    post.updatedAt = new Date();
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating post',
    });
  }
};

/**
 * DELETE /api/posts/:id
 * Delete a post
 */
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'Request body is required',
      });
    }

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check ownership
    if (post.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post',
      });
    }

    await Post.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting post',
    });
  }
};

/**
 * POST /api/posts/:id/apply
 * Apply for a job post as a worker
 */
export const applyForPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { workerId } = req.body;

    if (!workerId) {
      return res.status(400).json({
        success: false,
        message: 'Worker ID is required',
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if already applied
    const alreadyApplied = post.applicants.some(
      (app) => app.workerId.toString() === workerId
    );

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this post',
      });
    }

    // Add applicant
    post.applicants.push({
      workerId,
      appliedAt: new Date(),
      status: 'pending',
    });

    await post.save();

    res.status(200).json({
      success: true,
      message: 'Application submitted successfully',
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error applying for post',
    });
  }
};

/**
 * PATCH /api/posts/:id/applicant/:applicantId
 * Update applicant status
 */
export const updateApplicantStatus = async (req, res) => {
  try {
    const { id, applicantId } = req.params;
    
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'Request body is required',
      });
    }

    const { userId, status } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, accepted, or rejected',
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check ownership
    if (post.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update applicant status',
      });
    }

    const applicant = post.applicants.find((app) => app._id.toString() === applicantId);

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found',
      });
    }

    applicant.status = status;
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Applicant status updated successfully',
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating applicant status',
    });
  }
};

/**
 * POST /api/posts/upload
 * Upload job post images to S3
 * Returns array of S3 URLs
 */
export const uploadPostImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided',
      });
    }

    console.log(`Uploading ${req.files.length} images to S3...`);

    const uploadedUrls = [];

    // Upload each file to S3
    for (const file of req.files) {
      try {
        const url = await uploadToS3(
          file.buffer,
          file.originalname,
          file.mimetype
        );
        uploadedUrls.push(url);
        console.log(`✓ Uploaded: ${file.originalname} → ${url}`);
      } catch (error) {
        console.error(`✗ Failed to upload ${file.originalname}:`, error.message);
        throw error;
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully uploaded ${uploadedUrls.length} image(s)`,
      data: {
        images: uploadedUrls,
      },
    });
  } catch (error) {
    console.error('Image upload error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading images',
    });
  }
};
