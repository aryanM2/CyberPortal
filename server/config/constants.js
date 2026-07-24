/**
 * Application Constants
 */

// User Roles
const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
};

// Assessment Status
const ASSESSMENT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Assessment Types
const ASSESSMENT_TYPES = {
  NETWORK_SECURITY: 'network_security',
  WEB_APPLICATION: 'web_application',
  MOBILE_APPLICATION: 'mobile_application',
  CLOUD_SECURITY: 'cloud_security',
  PENETRATION_TESTING: 'penetration_testing',
  COMPLIANCE_AUDIT: 'compliance_audit',
};

// Vulnerability Severity
const SEVERITY_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info',
};

// Vulnerability Status
const VULNERABILITY_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  FIXED: 'fixed',
  VERIFIED: 'verified',
  FALSE_POSITIVE: 'false_positive',
};

// CVSS Score Ranges
const CVSS_RANGES = {
  CRITICAL: { min: 9.0, max: 10.0 },
  HIGH: { min: 7.0, max: 8.9 },
  MEDIUM: { min: 4.0, max: 6.9 },
  LOW: { min: 0.1, max: 3.9 },
  NONE: { min: 0.0, max: 0.0 },
};

module.exports = {
  USER_ROLES,
  ASSESSMENT_STATUS,
  ASSESSMENT_TYPES,
  SEVERITY_LEVELS,
  VULNERABILITY_STATUS,
  CVSS_RANGES,
};
