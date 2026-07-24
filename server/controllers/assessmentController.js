const Assessment = require('../models/Assessment');
const { asyncHandler } = require('../middleware/validation');
const { ASSESSMENT_STATUS } = require('../config/constants');

/**
 * @desc    Create new assessment request
 * @route   POST /api/assessments
 * @access  Private (Customer)
 */
const createAssessment = asyncHandler(async (req, res, next) => {
  const {
    companyName,
    contactPerson,
    email,
    phone,
    assessmentType,
    scope,
    description,
    preferredDate,
  } = req.body;

  // Create assessment
  const assessment = await Assessment.create({
    customerId: req.user._id,
    companyName,
    contactPerson,
    email,
    phone,
    assessmentType,
    scope,
    description,
    preferredDate,
    createdBy: req.user._id,
  });

  res.status(201).json({
    status: 'success',
    message: 'Assessment request created successfully',
    data: { assessment },
  });
});

/**
 * @desc    Get all assessments
 * @route   GET /api/assessments
 * @access  Private (Admin: all, Customer: own)
 */
const getAssessments = asyncHandler(async (req, res, next) => {
  const { status, assessmentType, page = 1, limit = 10, search } = req.query;

  // Build query
  let query = {};

  // Admin can see all assessments, customer can only see their own
  if (req.user.role === 'customer') {
    query.customerId = req.user._id;
  }

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Filter by assessment type
  if (assessmentType) {
    query.assessmentType = assessmentType;
  }

  // Search by company name or contact person
  if (search) {
    query.$or = [
      { companyName: { $regex: search, $options: 'i' } },
      { contactPerson: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const assessments = await Assessment.find(query)
    .populate('customerId', 'name email company')
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Assessment.countDocuments(query);

  res.status(200).json({
    status: 'success',
    assessments,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

/**
 * @desc    Get single assessment
 * @route   GET /api/assessments/:id
 * @access  Private (Admin: all, Customer: own)
 */
const getAssessment = asyncHandler(async (req, res, next) => {
  const assessment = await Assessment.findById(req.params.id)
    .populate('customerId', 'name email company phone')
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name')
    .populate('updatedBy', 'name');

  if (!assessment) {
    return res.status(404).json({
      status: 'error',
      message: 'Assessment not found',
    });
  }

  // Check access: admin can access all, customer can only access own
  if (req.user.role === 'customer' && assessment.customerId._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to access this assessment',
    });
  }

  res.status(200).json({
    status: 'success',
    data: { assessment },
  });
});

/**
 * @desc    Update assessment
 * @route   PUT /api/assessments/:id
 * @access  Private (Admin: all, Customer: own with restrictions)
 */
const updateAssessment = asyncHandler(async (req, res, next) => {
  const assessment = await Assessment.findById(req.params.id);

  if (!assessment) {
    return res.status(404).json({
      status: 'error',
      message: 'Assessment not found',
    });
  }

  // Check access
  if (req.user.role === 'customer') {
    // Customers can only update their own assessments and only certain fields
    if (assessment.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this assessment',
      });
    }

    // Customers can only update specific fields
    const allowedFields = ['contactPerson', 'email', 'phone', 'scope', 'description', 'preferredDate'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    Object.assign(assessment, updates);
  } else {
    // Admins can update all fields
    Object.assign(assessment, req.body);
  }

  assessment.updatedBy = req.user._id;
  await assessment.save();

  const updatedAssessment = await Assessment.findById(assessment._id)
    .populate('customerId', 'name email company')
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name')
    .populate('updatedBy', 'name');

  res.status(200).json({
    status: 'success',
    message: 'Assessment updated successfully',
    data: { assessment: updatedAssessment },
  });
});

/**
 * @desc    Delete assessment
 * @route   DELETE /api/assessments/:id
 * @access  Private (Admin only)
 */
const deleteAssessment = asyncHandler(async (req, res, next) => {
  const assessment = await Assessment.findById(req.params.id);

  if (!assessment) {
    return res.status(404).json({
      status: 'error',
      message: 'Assessment not found',
    });
  }

  // Only admin can delete assessments
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to delete assessments',
    });
  }

  await assessment.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'Assessment deleted successfully',
  });
});

/**
 * @desc    Update assessment status
 * @route   PATCH /api/assessments/:id/status
 * @access  Private (Admin only)
 */
const updateAssessmentStatus = asyncHandler(async (req, res, next) => {
  const { status, assignedTo, startDate, completionDate, notes } = req.body;

  const assessment = await Assessment.findById(req.params.id);

  if (!assessment) {
    return res.status(404).json({
      status: 'error',
      message: 'Assessment not found',
    });
  }

  // Only admin can update status
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to update assessment status',
    });
  }

  assessment.status = status || assessment.status;
  assessment.assignedTo = assignedTo || assessment.assignedTo;
  assessment.startDate = startDate || assessment.startDate;
  assessment.completionDate = completionDate || assessment.completionDate;
  assessment.notes = notes || assessment.notes;
  assessment.updatedBy = req.user._id;

  await assessment.save();

  const updatedAssessment = await Assessment.findById(assessment._id)
    .populate('customerId', 'name email company')
    .populate('assignedTo', 'name email')
    .populate('updatedBy', 'name');

  res.status(200).json({
    status: 'success',
    message: 'Assessment status updated successfully',
    data: { assessment: updatedAssessment },
  });
});

/**
 * @desc    Get assessment statistics
 * @route   GET /api/assessments/stats
 * @access  Private (Admin only)
 */
const getAssessmentStats = asyncHandler(async (req, res, next) => {
  // Only admin can access stats
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to access statistics',
    });
  }

  const stats = await Assessment.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const totalAssessments = await Assessment.countDocuments();
  const byType = await Assessment.aggregate([
    {
      $group: {
        _id: '$assessmentType',
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    stats: {
      totalAssessments: totalAssessments,
      byStatus: stats,
      byType,
    },
  });
});

module.exports = {
  createAssessment,
  getAssessments,
  getAssessment,
  updateAssessment,
  deleteAssessment,
  updateAssessmentStatus,
  getAssessmentStats,
};
