const mongoose = require('mongoose');
const { ASSESSMENT_STATUS, ASSESSMENT_TYPES } = require('../config/constants');

const assessmentSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer is required'],
      index: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [200, 'Company name cannot exceed 200 characters'],
    },
    contactPerson: {
      type: String,
      required: [true, 'Contact person is required'],
      trim: true,
      maxlength: [100, 'Contact person name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[+]?[\d\s-()]+$/, 'Please provide a valid phone number'],
    },
    assessmentType: {
      type: String,
      enum: Object.values(ASSESSMENT_TYPES),
      required: [true, 'Assessment type is required'],
    },
    scope: {
      type: String,
      required: [true, 'Assessment scope is required'],
      trim: true,
      maxlength: [2000, 'Scope cannot exceed 2000 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    preferredDate: {
      type: Date,
      required: [true, 'Preferred date is required'],
    },
    status: {
      type: String,
      enum: Object.values(ASSESSMENT_STATUS),
      default: ASSESSMENT_STATUS.PENDING,
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    startDate: {
      type: Date,
    },
    completionDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    // Metadata for tracking
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
assessmentSchema.index({ customerId: 1, status: 1 });
assessmentSchema.index({ status: 1, createdAt: -1 });
assessmentSchema.index({ preferredDate: 1 });
assessmentSchema.index({ assessmentType: 1 });

/**
 * Virtual for formatted assessment type
 */
assessmentSchema.virtual('assessmentTypeFormatted').get(function () {
  if (!this.assessmentType) return '';
  return this.assessmentType
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
});

/**
 * Virtual for formatted status
 */
assessmentSchema.virtual('statusFormatted').get(function () {
  if (!this.status) return '';
  return this.status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
});

// Ensure virtuals are included in JSON
assessmentSchema.set('toJSON', { virtuals: true });
assessmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Assessment', assessmentSchema);
