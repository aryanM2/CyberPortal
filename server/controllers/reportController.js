const Report = require('../models/Report');
const Assessment = require('../models/Assessment');
const Vulnerability = require('../models/Vulnerability');
const { generatePDFReport } = require('../services/pdfService');
const { asyncHandler } = require('../middleware/validation');
const path = require('path');
const fs = require('fs');

/**
 * @desc    Create new report
 * @route   POST /api/reports
 * @access  Private (Admin only)
 */
const createReport = asyncHandler(async (req, res, next) => {
  const {
    assessmentId,
    executiveSummary,
    findings,
    riskScore,
    recommendations,
    vulnerabilityList,
    overallScore,
    methodology,
    scope,
    limitations,
    conclusion,
  } = req.body;

  // Verify assessment exists
  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) {
    return res.status(404).json({
      status: 'error',
      message: 'Assessment not found',
    });
  }

  // Check if report already exists for this assessment
  const existingReport = await Report.findOne({ assessmentId });
  if (existingReport) {
    return res.status(400).json({
      status: 'error',
      message: 'Report already exists for this assessment',
    });
  }

  // Create report
  const report = await Report.create({
    assessmentId,
    title: req.body.title || 'Cybersecurity Assessment Report',
    executiveSummary,
    findings,
    riskScore,
    recommendations,
    vulnerabilityList,
    overallScore,
    methodology,
    scope,
    limitations,
    conclusion,
    status: 'pending',
    generatedBy: req.user._id,
    createdBy: req.user._id,
  });

  res.status(201).json({
    status: 'success',
    message: 'Report created successfully',
    data: { report },
  });
});

/**
 * @desc    Get all reports
 * @route   GET /api/reports
 * @access  Private (Admin: all, Customer: through their assessments)
 */
const getReports = asyncHandler(async (req, res, next) => {
  const { status, page = 1, limit = 10, search } = req.query;

  // Build query
  let query = {};

  // Filter by status (pending, approved, rejected)
  if (status && status !== 'all') {
    query.status = status;
  }

  // Customers can only see reports from their assessments
  if (req.user.role === 'customer') {
    const customerAssessments = await Assessment.find({
      customerId: req.user._id
    }).select('_id');

    const assessmentIds = customerAssessments.map(a => a._id);
    query.assessmentId = { $in: assessmentIds };
  }

  // Search by executive summary
  if (search) {
    query.executiveSummary = { $regex: search, $options: 'i' };
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const reports = await Report.find(query)
    .populate('assessmentId', 'companyName assessmentType status')
    .populate('generatedBy', 'name email')
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Report.countDocuments(query);

  res.status(200).json({
    status: 'success',
    reports,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

/**
 * @desc    Get single report
 * @route   GET /api/reports/:id
 * @access  Private (Admin: all, Customer: through their assessments)
 */
const getReport = asyncHandler(async (req, res, next) => {
  const report = await Report.findById(req.params.id)
    .populate('assessmentId', 'companyName assessmentType status customerId')
    .populate('vulnerabilityList')
    .populate('generatedBy', 'name email')
    .populate('approvedBy', 'name email')
    .populate('createdBy', 'name')
    .populate('updatedBy', 'name');

  if (!report) {
    return res.status(404).json({
      status: 'error',
      message: 'Report not found',
    });
  }

  // Check access for customers
  if (req.user.role === 'customer') {
    const assessment = await Assessment.findById(report.assessmentId._id);
    if (assessment.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access this report',
      });
    }
  }

  res.status(200).json({
    status: 'success',
    data: { report },
  });
});

/**
 * @desc    Update report
 * @route   PUT /api/reports/:id
 * @access  Private (Admin only)
 */
const updateReport = asyncHandler(async (req, res, next) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    return res.status(404).json({
      status: 'error',
      message: 'Report not found',
    });
  }

  // Only admin can update reports
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to update reports',
    });
  }

  Object.assign(report, req.body);
  report.updatedBy = req.user._id;
  await report.save();

  const updatedReport = await Report.findById(report._id)
    .populate('assessmentId', 'companyName assessmentType')
    .populate('generatedBy', 'name email')
    .populate('approvedBy', 'name email')
    .populate('updatedBy', 'name');

  res.status(200).json({
    status: 'success',
    message: 'Report updated successfully',
    data: { report: updatedReport },
  });
});

/**
 * @desc    Delete report
 * @route   DELETE /api/reports/:id
 * @access  Private (Admin only)
 */
const deleteReport = asyncHandler(async (req, res, next) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    return res.status(404).json({
      status: 'error',
      message: 'Report not found',
    });
  }

  // Only admin can delete reports
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to delete reports',
    });
  }

  await report.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'Report deleted successfully',
  });
});

/**
 * @desc    Approve report
 * @route   PATCH /api/reports/:id/approve
 * @access  Private (Admin only)
 */
const approveReport = asyncHandler(async (req, res, next) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    return res.status(404).json({
      status: 'error',
      message: 'Report not found',
    });
  }

  // Only admin can approve reports
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to approve reports',
    });
  }

  report.isApproved = true;
  report.status = 'approved';
  report.approvedBy = req.user._id;
  report.approvedDate = new Date();
  report.updatedBy = req.user._id;
  await report.save();

  const updatedReport = await Report.findById(report._id)
    .populate('assessmentId', 'companyName')
    .populate('approvedBy', 'name email')
    .populate('updatedBy', 'name');

  res.status(200).json({
    status: 'success',
    message: 'Report approved successfully',
    data: { report: updatedReport },
  });
});

/**
 * @desc    Reject report
 * @route   PATCH /api/reports/:id/reject
 * @access  Private (Admin only)
 */
const rejectReport = asyncHandler(async (req, res, next) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    return res.status(404).json({
      status: 'error',
      message: 'Report not found',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to reject reports',
    });
  }

  report.isApproved = false;
  report.status = 'rejected';
  report.rejectionReason = req.body.reason || 'Report rejected by admin';
  report.updatedBy = req.user._id;
  await report.save();

  const updatedReport = await Report.findById(report._id)
    .populate('assessmentId', 'companyName')
    .populate('updatedBy', 'name');

  res.status(200).json({
    status: 'success',
    message: 'Report rejected successfully',
    data: { report: updatedReport },
  });
});

/**
 * @desc    Generate and download PDF report
 * @route   GET /api/reports/:id/pdf
 * @access  Private (Admin: all, Customer: own approved reports)
 */
const downloadPDF = asyncHandler(async (req, res, next) => {
  const report = await Report.findById(req.params.id)
    .populate('assessmentId', 'companyName assessmentType')
    .populate('vulnerabilityList');

  if (!report) {
    return res.status(404).json({
      status: 'error',
      message: 'Report not found',
    });
  }

  // Check access for customers (only approved reports)
  if (req.user.role === 'customer') {
    const assessment = await Assessment.findById(report.assessmentId._id);
    if (assessment.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access this report',
      });
    }

    if (!report.isApproved) {
      return res.status(403).json({
        status: 'error',
        message: 'Report must be approved before downloading',
      });
    }
  }

  // Create reports directory if it doesn't exist
  const reportsDir = path.join(__dirname, '../reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Generate PDF filename
  const filename = `report_${report.assessmentId._id}_${Date.now()}.pdf`;
  const outputPath = path.join(reportsDir, filename);

  try {
    // Generate PDF
    await generatePDFReport(report.toObject(), report.assessmentId.toObject(), outputPath);

    // Send file
    res.download(outputPath, `Cybersecurity_Report_${report.assessmentId.companyName}.pdf`, (err) => {
      // Delete file after download
      if (!err) {
        fs.unlinkSync(outputPath);
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to generate PDF report',
      error: error.message,
    });
  }
});

/**
 * @desc    Get report by assessment
 * @route   GET /api/reports/assessment/:assessmentId
 * @access  Private (Admin: all, Customer: own assessments)
 */
const getReportByAssessment = asyncHandler(async (req, res, next) => {
  const { assessmentId } = req.params;

  // Verify assessment exists
  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) {
    return res.status(404).json({
      status: 'error',
      message: 'Assessment not found',
    });
  }

  // Check access for customers
  if (req.user.role === 'customer' && assessment.customerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to access report for this assessment',
    });
  }

  const report = await Report.findOne({ assessmentId })
    .populate('assessmentId', 'companyName assessmentType status')
    .populate('vulnerabilityList')
    .populate('generatedBy', 'name email')
    .populate('approvedBy', 'name email');

  if (!report) {
    return res.status(404).json({
      status: 'error',
      message: 'Report not found for this assessment',
    });
  }

  res.status(200).json({
    status: 'success',
    data: { report },
  });
});

module.exports = {
  createReport,
  getReports,
  getReport,
  updateReport,
  deleteReport,
  approveReport,
  rejectReport,
  downloadPDF,
  getReportByAssessment,
};
