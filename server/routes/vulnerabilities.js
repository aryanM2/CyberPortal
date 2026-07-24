const express = require('express');
const router = express.Router();
const {
  createVulnerability,
  getVulnerabilities,
  getVulnerability,
  updateVulnerability,
  deleteVulnerability,
  updateVulnerabilityStatus,
  getVulnerabilityStats,
  getVulnerabilitiesByAssessment,
} = require('../controllers/vulnerabilityController');
const { protect } = require('../middleware/auth');
const { authorizeAdmin } = require('../middleware/admin');
const { validate } = require('../middleware/validation');
const {
  createVulnerabilityValidation,
  updateVulnerabilityValidation,
  vulnerabilityIdValidation,
} = require('../validators/vulnerabilityValidator');

/**
 * @route   POST /api/vulnerabilities
 * @desc    Create new vulnerability
 * @access  Private (Admin only)
 */
router.post('/', protect, authorizeAdmin, createVulnerabilityValidation, validate, createVulnerability);

/**
 * @route   GET /api/vulnerabilities
 * @desc    Get all vulnerabilities
 * @access  Private (Admin: all, Customer: through their assessments)
 */
router.get('/', protect, getVulnerabilities);

/**
 * @route   GET /api/vulnerabilities/stats
 * @desc    Get vulnerability statistics
 * @access  Private (Admin only)
 */
router.get('/stats', protect, authorizeAdmin, getVulnerabilityStats);

/**
 * @route   GET /api/vulnerabilities/assessment/:assessmentId
 * @desc    Get vulnerabilities by assessment
 * @access  Private (Admin: all, Customer: own assessments)
 */
router.get('/assessment/:assessmentId', protect, getVulnerabilitiesByAssessment);

/**
 * @route   GET /api/vulnerabilities/:id
 * @desc    Get single vulnerability
 * @access  Private (Admin: all, Customer: through their assessments)
 */
router.get('/:id', protect, vulnerabilityIdValidation, validate, getVulnerability);

/**
 * @route   PUT /api/vulnerabilities/:id
 * @desc    Update vulnerability
 * @access  Private (Admin only)
 */
router.put('/:id', protect, authorizeAdmin, vulnerabilityIdValidation, validate, updateVulnerabilityValidation, validate, updateVulnerability);

/**
 * @route   PATCH /api/vulnerabilities/:id/status
 * @desc    Update vulnerability status
 * @access  Private (Admin only)
 */
router.patch('/:id/status', protect, authorizeAdmin, vulnerabilityIdValidation, validate, updateVulnerabilityStatus);

/**
 * @route   DELETE /api/vulnerabilities/:id
 * @desc    Delete vulnerability
 * @access  Private (Admin only)
 */
router.delete('/:id', protect, authorizeAdmin, vulnerabilityIdValidation, validate, deleteVulnerability);

module.exports = router;
