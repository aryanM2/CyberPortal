const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  getReport,
  updateReport,
  deleteReport,
  approveReport,
  rejectReport,
  downloadPDF,
  getReportByAssessment,
} = require('../controllers/reportController');

/**
 * @route   PATCH /api/reports/:id/reject
 * @desc    Reject report
 * @access  Private (Admin only)
 */
const { protect } = require('../middleware/auth');

const { authorizeAdmin } = require('../middleware/admin');
const { validate } = require('../middleware/validation');
const {
  createReportValidation,
  updateReportValidation,
  reportIdValidation,
} = require('../validators/reportValidator');


router.patch('/:id/reject', protect, authorizeAdmin, reportIdValidation, validate, rejectReport);



/**
 * @route   POST /api/reports
 * @desc    Create new report
 * @access  Private (Admin only)
 */
router.post('/', protect, authorizeAdmin, createReportValidation, validate, createReport);

/**
 * @route   GET /api/reports
 * @desc    Get all reports
 * @access  Private (Admin: all, Customer: through their assessments)
 */
router.get('/', protect, getReports);

/**
 * @route   GET /api/reports/assessment/:assessmentId
 * @desc    Get report by assessment
 * @access  Private (Admin: all, Customer: own assessments)
 */
router.get('/assessment/:assessmentId', protect, getReportByAssessment);

/**
 * @route   GET /api/reports/:id
 * @desc    Get single report
 * @access  Private (Admin: all, Customer: through their assessments)
 */
router.get('/:id', protect, reportIdValidation, validate, getReport);

/**
 * @route   GET /api/reports/:id/pdf
 * @desc    Generate and download PDF report
 * @access  Private (Admin: all, Customer: own approved reports)
 */
router.get('/:id/pdf', protect, reportIdValidation, validate, downloadPDF);

/**
 * @route   PUT /api/reports/:id
 * @desc    Update report
 * @access  Private (Admin only)
 */
router.put('/:id', protect, authorizeAdmin, reportIdValidation, validate, updateReportValidation, validate, updateReport);

/**
 * @route   PATCH /api/reports/:id/approve
 * @desc    Approve report
 * @access  Private (Admin only)
 */
router.patch('/:id/approve', protect, authorizeAdmin, reportIdValidation, validate, approveReport);

/**
 * @route   DELETE /api/reports/:id
 * @desc    Delete report
 * @access  Private (Admin only)
 */
router.delete('/:id', protect, authorizeAdmin, reportIdValidation, validate, deleteReport);

module.exports = router;
