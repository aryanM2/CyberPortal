import React, { useState, useEffect } from 'react';
import { BarChart3, Plus, Eye, Edit, Download, Trash2, Check, X, FileText, Award, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { reportService } from '../../services/reportService';
import { getAssessments } from '../../services/assessmentService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Input, { Textarea, Select } from '../../components/common/Input';

const INITIAL_FORM = {
  assessmentId: '',
  title: '',
  executiveSummary: '',
  riskScore: '45',
  overallScore: '75',
  scope: '',
  methodology: 'Standard OWASP testing methodology and automated SAST/DAST vulnerability scanning.',
  conclusion: '',
  findingsCategory: 'Web Application Security',
  findingsDesc: 'Identified multiple input validation and session management vulnerabilities.',
  findingsSeverity: 'high',
  recommendationTitle: 'Remediate Input Validation Flaws',
  recommendationDesc: 'Implement parameterized queries and strict input sanitization on all endpoints.',
  recommendationPriority: 'high',
};

const SEVERITY_OPTIONS = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'info', label: 'Info' },
];

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');

  // Modal states
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  useEffect(() => {
    fetchReports();
    fetchAssessmentsList();
  }, [filter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await reportService.getReports(params);
      setReports(response.reports || []);
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssessmentsList = async () => {
    try {
      const response = await getAssessments({ limit: 100 });
      setAssessments(response.assessments || []);
    } catch (error) {
      console.error('Failed to fetch assessments list', error);
    }
  };

  const handleView = (report) => {
    setSelectedReport(report);
    setIsViewOpen(true);
  };

  const handleEdit = (report) => {
    setSelectedReport(report);
    setIsCreateMode(false);

    const firstFinding = (report.findings && report.findings[0]) || {};
    const firstRec = (report.recommendations && report.recommendations[0]) || {};

    setFormData({
      assessmentId: typeof report.assessmentId === 'object' ? report.assessmentId?._id : (report.assessmentId || ''),
      title: report.title || '',
      executiveSummary: report.executiveSummary || '',
      riskScore: report.riskScore !== undefined ? String(report.riskScore) : '45',
      overallScore: report.overallScore !== undefined ? String(report.overallScore) : '75',
      scope: report.scope || '',
      methodology: report.methodology || '',
      conclusion: report.conclusion || '',
      findingsCategory: firstFinding.category || 'Web Application Security',
      findingsDesc: firstFinding.description || 'Vulnerabilities identified during penetration testing.',
      findingsSeverity: firstFinding.severity || 'high',
      recommendationTitle: firstRec.title || 'Apply Security Patches',
      recommendationDesc: firstRec.description || 'Address critical and high severity findings.',
      recommendationPriority: firstRec.priority || 'high',
    });
    setIsEditOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedReport(null);
    setIsCreateMode(true);
    setFormData({
      ...INITIAL_FORM,
      assessmentId: assessments.length > 0 ? assessments[0]._id : '',
    });
    setIsEditOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      await reportService.deleteReport(id);
      toast.success('Report deleted successfully');
      fetchReports();
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  const handleApprove = async (id) => {
    try {
      await reportService.approveReport(id);
      toast.success('Report approved successfully');
      fetchReports();
    } catch (error) {
      toast.error('Failed to approve report');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await reportService.rejectReport(id, reason);
      toast.success('Report rejected successfully');
      fetchReports();
    } catch (error) {
      toast.error('Failed to reject report');
    }
  };

  const handleDownload = async (id) => {
    try {
      const blob = await reportService.downloadPDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assessment-report-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.executiveSummary || formData.riskScore === '' || formData.overallScore === '') {
      toast.error('Please fill in required fields (Executive Summary, Risk Score, Overall Score)');
      return;
    }

    if (isCreateMode && !formData.assessmentId) {
      toast.error('Please select an assessment for the report');
      return;
    }

    const payload = {
      assessmentId: formData.assessmentId,
      executiveSummary: formData.executiveSummary,
      riskScore: parseFloat(formData.riskScore),
      overallScore: parseFloat(formData.overallScore),
      methodology: formData.methodology,
      scope: formData.scope,
      conclusion: formData.conclusion,
      findings: [
        {
          category: formData.findingsCategory,
          description: formData.findingsDesc,
          severity: formData.findingsSeverity,
          count: 1,
        },
      ],
      recommendations: [
        {
          title: formData.recommendationTitle,
          description: formData.recommendationDesc,
          priority: formData.recommendationPriority,
          estimatedEffort: '1 - 2 weeks',
        },
      ],
    };

    setSubmitting(true);
    try {
      if (isCreateMode) {
        await reportService.createReport(payload);
        toast.success('Report created successfully');
      } else {
        await reportService.updateReport(selectedReport._id, payload);
        toast.success('Report updated successfully');
      }
      setIsEditOpen(false);
      fetchReports();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${isCreateMode ? 'create' : 'update'} report`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusVariant = (status) => {
    if (status === true || status === 'approved') return 'success';
    if (status === 'rejected') return 'danger';
    return 'warning';
  };

  const getStatusLabel = (row) => {
    if (row.isApproved || row.status === 'approved') return 'APPROVED';
    if (row.status === 'rejected') return 'REJECTED';
    return 'PENDING';
  };

  const tableColumns = [
    {
      key: 'title',
      label: 'Title / Assessment',
      render: (val, row) => {
        if (val) return val;
        if (row.assessmentId && typeof row.assessmentId === 'object') {
          return `${row.assessmentId.companyName || 'Assessment'} Report`;
        }
        return 'Cybersecurity Audit Report';
      },
    },
    {
      key: 'overallScore',
      label: 'Overall Security Score',
      render: (value) => (
        <span className="font-semibold text-cyan-400">
          {value !== undefined ? `${value} / 100` : 'N/A'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, row) => (
        <Badge variant={getStatusVariant(row.isApproved ? 'approved' : row.status)}>
          {getStatusLabel(row)}
        </Badge>
      ),
    },
    {
      key: 'generatedBy',
      label: 'Generated By',
      render: (val) => (typeof val === 'object' ? val?.name : 'Security Admin'),
    },
    {
      key: 'createdAt',
      label: 'Created Date',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => {
        const isPending = !row.isApproved && row.status !== 'approved' && row.status !== 'rejected';
        return (
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={() => handleView(row)}
              className="text-cyan-400 hover:text-cyan-300 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEdit(row)}
              className="text-yellow-400 hover:text-yellow-300 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              title="Edit Report"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDownload(row._id)}
              className="text-green-400 hover:text-green-300 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
            </button>
            {isPending && (
              <>
                <button
                  onClick={() => handleApprove(row._id)}
                  className="text-blue-400 hover:text-blue-300 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Approve Report"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleReject(row._id)}
                  className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Reject Report"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={() => handleDelete(row._id)}
              className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              title="Delete Report"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  const assessmentSelectOptions = assessments.map((a) => ({
    value: a._id,
    label: `${a.companyName} (${a.assessmentType ? a.assessmentType.replace('_', ' ') : 'Assessment'})`,
  }));

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <Button icon={Plus} onClick={handleCreateNew}>
          Generate Report
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl transition-colors ${filter === status
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium'
              : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/50'
              }`}
          >
            {status.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Reports Table */}
      <Table
        columns={tableColumns}
        data={reports}
        loading={loading}
        emptyMessage="No reports found"
      />

      {/* View Report Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Assessment Report View"
        maxWidth="max-w-4xl"
      >
        {selectedReport && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {selectedReport.title || 'Cybersecurity Assessment Final Report'}
                </h3>
                <p className="text-xs text-slate-400 font-mono">Report ID: {selectedReport._id}</p>
              </div>
              <Badge variant={getStatusVariant(selectedReport.isApproved ? 'approved' : selectedReport.status)}>
                {getStatusLabel(selectedReport)}
              </Badge>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <div>
                <p className="text-xs text-slate-500">Overall Security Score</p>
                <p className="text-2xl font-bold text-cyan-400">{selectedReport.overallScore || 0} / 100</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Risk Score</p>
                <p className="text-2xl font-bold text-red-400">{selectedReport.riskScore || 0} / 100</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Generated Date</p>
                <p className="text-sm font-medium text-white mt-1">
                  {selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            {/* Executive Summary */}
            <div>
              <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-2">Executive Summary</h4>
              <p className="text-sm text-slate-300 bg-slate-950/50 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap">
                {selectedReport.executiveSummary}
              </p>
            </div>

            {/* Findings Summary */}
            {selectedReport.findings && selectedReport.findings.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-2">Key Findings Summary</h4>
                <div className="space-y-2">
                  {selectedReport.findings.map((f, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                      <div>
                        <p className="text-sm font-semibold text-white">{f.category}</p>
                        <p className="text-xs text-slate-400">{f.description}</p>
                      </div>
                      <Badge variant={f.severity === 'critical' || f.severity === 'high' ? 'danger' : 'info'}>
                        {f.severity ? f.severity.toUpperCase() : 'INFO'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {selectedReport.recommendations && selectedReport.recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-2">Recommendations</h4>
                <div className="space-y-2">
                  {selectedReport.recommendations.map((r, idx) => (
                    <div key={idx} className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-white">{r.title}</span>
                        <span className="text-xs font-medium text-slate-400">Effort: {r.estimatedEffort || 'N/A'}</span>
                      </div>
                      <p className="text-xs text-slate-400">{r.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conclusion */}
            {selectedReport.conclusion && (
              <div>
                <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-2">Conclusion & Next Steps</h4>
                <p className="text-sm text-slate-300 bg-slate-950/50 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap">
                  {selectedReport.conclusion}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
              <Button variant="secondary" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>
              <Button icon={Download} onClick={() => handleDownload(selectedReport._id)}>
                Download PDF
              </Button>
              <Button icon={Edit} onClick={() => { setIsViewOpen(false); handleEdit(selectedReport); }}>
                Edit Report
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Generate / Edit Report Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={isCreateMode ? 'Generate Assessment Report' : 'Edit Assessment Report'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {isCreateMode && (
            assessmentSelectOptions.length > 0 ? (
              <Select
                label="Target Assessment"
                name="assessmentId"
                value={formData.assessmentId}
                onChange={handleInputChange}
                options={assessmentSelectOptions}
                required
              />
            ) : (
              <Input
                label="Assessment ID"
                name="assessmentId"
                value={formData.assessmentId}
                onChange={handleInputChange}
                placeholder="Paste Assessment ID"
                required
              />
            )
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="number"
              min="0"
              max="100"
              label="Overall Security Score (0 - 100)"
              name="overallScore"
              value={formData.overallScore}
              onChange={handleInputChange}
              required
            />
            <Input
              type="number"
              min="0"
              max="100"
              label="Risk Score (0 - 100)"
              name="riskScore"
              value={formData.riskScore}
              onChange={handleInputChange}
              required
            />
          </div>

          <Textarea
            label="Executive Summary"
            name="executiveSummary"
            value={formData.executiveSummary}
            onChange={handleInputChange}
            rows={4}
            placeholder="High-level summary of security assessment findings for executives and management..."
            required
          />

          {/* Finding details */}
          <div className="border border-slate-800 p-4 rounded-xl bg-slate-950/40 space-y-3">
            <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Primary Finding Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Finding Category"
                name="findingsCategory"
                value={formData.findingsCategory}
                onChange={handleInputChange}
                placeholder="e.g. Web Application Security"
              />
              <Select
                label="Finding Severity"
                name="findingsSeverity"
                value={formData.findingsSeverity}
                onChange={handleInputChange}
                options={SEVERITY_OPTIONS}
              />
            </div>
            <Input
              label="Finding Summary Note"
              name="findingsDesc"
              value={formData.findingsDesc}
              onChange={handleInputChange}
              placeholder="Brief explanation of findings category..."
            />
          </div>

          {/* Recommendation details */}
          <div className="border border-slate-800 p-4 rounded-xl bg-slate-950/40 space-y-3">
            <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider">Primary Recommendation</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Recommendation Title"
                name="recommendationTitle"
                value={formData.recommendationTitle}
                onChange={handleInputChange}
                placeholder="e.g. Patch Vulnerable Libraries"
              />
              <Select
                label="Priority"
                name="recommendationPriority"
                value={formData.recommendationPriority}
                onChange={handleInputChange}
                options={SEVERITY_OPTIONS.filter(o => o.value !== 'info')}
              />
            </div>
            <Input
              label="Recommendation Details"
              name="recommendationDesc"
              value={formData.recommendationDesc}
              onChange={handleInputChange}
              placeholder="Actionable steps for client engineering team..."
            />
          </div>

          <Textarea
            label="Methodology (Optional)"
            name="methodology"
            value={formData.methodology}
            onChange={handleInputChange}
            rows={2}
          />

          <Textarea
            label="Conclusion & Recommendations Note (Optional)"
            name="conclusion"
            value={formData.conclusion}
            onChange={handleInputChange}
            rows={2}
          />

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {isCreateMode ? 'Generate Report' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Reports;
