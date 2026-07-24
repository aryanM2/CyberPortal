const { body, param } = require('express-validator');
const { ASSESSMENT_TYPES, ASSESSMENT_STATUS } = require('../config/constants');

/**
 * Validation rules for creating assessment
 */
const createAssessmentValidation = [
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ max: 200 })
    .withMessage('Company name cannot exceed 200 characters'),
  
  body('contactPerson')
    .trim()
    .notEmpty()
    .withMessage('Contact person is required')
    .isLength({ max: 100 })
    .withMessage('Contact person name cannot exceed 100 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[+]?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  
  body('assessmentType')
    .trim()
    .notEmpty()
    .withMessage('Assessment type is required')
    .isIn(Object.values(ASSESSMENT_TYPES))
    .withMessage('Invalid assessment type'),
  
  body('scope')
    .trim()
    .notEmpty()
    .withMessage('Scope is required')
    .isLength({ max: 2000 })
    .withMessage('Scope cannot exceed 2000 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),
  
  body('preferredDate')
    .notEmpty()
    .withMessage('Preferred date is required')
    .isISO8601()
    .withMessage('Please provide a valid date')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        throw new Error('Preferred date cannot be in the past');
      }
      return true;
    }),
];

/**
 * Validation rules for updating assessment
 */
const updateAssessmentValidation = [
  body('companyName')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Company name cannot exceed 200 characters'),
  
  body('contactPerson')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Contact person name cannot exceed 100 characters'),
  
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[+]?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  
  body('assessmentType')
    .optional({ checkFalsy: true })
    .trim()
    .isIn(Object.values(ASSESSMENT_TYPES))
    .withMessage('Invalid assessment type'),
  
  body('scope')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Scope cannot exceed 2000 characters'),
  
  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),
  
  body('preferredDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Please provide a valid date'),
  
  body('status')
    .optional({ checkFalsy: true })
    .trim()
    .isIn(Object.values(ASSESSMENT_STATUS))
    .withMessage('Invalid status'),
  
  body('assignedTo')
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  body('notes')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters'),
];

/**
 * Validation rules for assessment ID parameter
 */
const assessmentIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid assessment ID'),
];

module.exports = {
  createAssessmentValidation,
  updateAssessmentValidation,
  assessmentIdValidation,
};
