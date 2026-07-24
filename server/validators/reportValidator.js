const { body, param } = require('express-validator');

/**
 * Validation rules for creating report
 */
const createReportValidation = [
  body('assessmentId')
    .notEmpty()
    .withMessage('Assessment ID is required')
    .isMongoId()
    .withMessage('Invalid assessment ID'),
  
  body('executiveSummary')
    .trim()
    .notEmpty()
    .withMessage('Executive summary is required')
    .isLength({ max: 10000 })
    .withMessage('Executive summary cannot exceed 10000 characters'),
  
  body('findings')
    .isArray()
    .withMessage('Findings must be an array'),
  
  body('findings.*.category')
    .trim()
    .notEmpty()
    .withMessage('Finding category is required'),
  
  body('findings.*.description')
    .trim()
    .notEmpty()
    .withMessage('Finding description is required'),
  
  body('findings.*.severity')
    .trim()
    .isIn(['critical', 'high', 'medium', 'low', 'info'])
    .withMessage('Invalid severity level'),
  
  body('riskScore')
    .notEmpty()
    .withMessage('Risk score is required')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Risk score must be between 0 and 100'),
  
  body('recommendations')
    .isArray()
    .withMessage('Recommendations must be an array'),
  
  body('recommendations.*.priority')
    .trim()
    .isIn(['critical', 'high', 'medium', 'low'])
    .withMessage('Invalid priority level'),
  
  body('recommendations.*.title')
    .trim()
    .notEmpty()
    .withMessage('Recommendation title is required'),
  
  body('recommendations.*.description')
    .trim()
    .notEmpty()
    .withMessage('Recommendation description is required'),
  
  body('vulnerabilityList')
    .optional()
    .isArray()
    .withMessage('Vulnerability list must be an array'),
  
  body('overallScore')
    .notEmpty()
    .withMessage('Overall score is required')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Overall score must be between 0 and 100'),
  
  body('methodology')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Methodology cannot exceed 5000 characters'),
  
  body('scope')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Scope cannot exceed 2000 characters'),
  
  body('limitations')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Limitations cannot exceed 2000 characters'),
  
  body('conclusion')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Conclusion cannot exceed 5000 characters'),
];

/**
 * Validation rules for updating report
 */
const updateReportValidation = [
  body('executiveSummary')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 10000 })
    .withMessage('Executive summary cannot exceed 10000 characters'),
  
  body('findings')
    .optional({ checkFalsy: true })
    .isArray()
    .withMessage('Findings must be an array'),
  
  body('riskScore')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 100 })
    .withMessage('Risk score must be between 0 and 100'),
  
  body('recommendations')
    .optional({ checkFalsy: true })
    .isArray()
    .withMessage('Recommendations must be an array'),
  
  body('vulnerabilityList')
    .optional({ checkFalsy: true })
    .isArray()
    .withMessage('Vulnerability list must be an array'),
  
  body('overallScore')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 100 })
    .withMessage('Overall score must be between 0 and 100'),
  
  body('methodology')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Methodology cannot exceed 5000 characters'),
  
  body('scope')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Scope cannot exceed 2000 characters'),
  
  body('limitations')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Limitations cannot exceed 2000 characters'),
  
  body('conclusion')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Conclusion cannot exceed 5000 characters'),
  
  body('isApproved')
    .optional({ checkFalsy: true })
    .isBoolean()
    .withMessage('isApproved must be a boolean'),
  
  body('approvedBy')
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid approver ID'),
];

/**
 * Validation rules for report ID parameter
 */
const reportIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid report ID'),
];

module.exports = {
  createReportValidation,
  updateReportValidation,
  reportIdValidation,
};
