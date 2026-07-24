const express = require('express');
const router = express.Router();
const {
  createAssessment,
  getAssessments,
  getAssessment,
  updateAssessment,
  deleteAssessment,
  updateAssessmentStatus,
  getAssessmentStats,
} = require('../controllers/assessmentController');
const { protect } = require('../middleware/auth');
const { authorizeAdmin, authorizeCustomer, authorize } = require('../middleware/admin');
const { validate } = require('../middleware/validation');
const {
  createAssessmentValidation,
  updateAssessmentValidation,
  assessmentIdValidation,
} = require('../validators/assessmentValidator');

/**
 * @route   POST /api/assessments
 * @desc    Create new assessment request
 * @access  Private (Customer)
 */
router.post('/', protect, createAssessmentValidation, validate, createAssessment);

/**
 * @route   GET /api/assessments
 * @desc    Get all assessments
 * @access  Private (Admin: all, Customer: own)
 */
router.get('/', protect, getAssessments);

/**
 * @route   GET /api/assessments/stats
 * @desc    Get assessment statistics
 * @access  Private (Admin only)
 */
router.get('/stats', protect, authorizeAdmin, getAssessmentStats);

/**
 * @route   GET /api/assessments/:id
 * @desc    Get single assessment
 * @access  Private (Admin: all, Customer: own)
 */
router.get('/:id', protect, assessmentIdValidation, validate, getAssessment);

/**
 * @route   PUT /api/assessments/:id
 * @desc    Update assessment
 * @access  Private (Admin: all, Customer: own with restrictions)
 */
router.put('/:id', protect, assessmentIdValidation, validate, updateAssessmentValidation, validate, updateAssessment);

/**
 * @route   PATCH /api/assessments/:id/status
 * @desc    Update assessment status
 * @access  Private (Admin only)
 */
router.patch('/:id/status', protect, authorizeAdmin, assessmentIdValidation, validate, updateAssessmentStatus);

/**
 * @route   DELETE /api/assessments/:id
 * @desc    Delete assessment
 * @access  Private (Admin only)
 */
router.delete('/:id', protect, authorizeAdmin, assessmentIdValidation, validate, deleteAssessment);

module.exports = router;
