import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Eye, Edit, Trash2, FileText, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { vulnerabilityService } from '../../services/vulnerabilityService';
import { getAssessments } from '../../services/assessmentService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Input, { Textarea, Select } from '../../components/common/Input';

const INITIAL_FORM = {
  assessmentId: '',
  title: '',
  description: '',
  cvssScore: '5.0',
  severity: 'medium',
  status: 'open',
  remediation: '',
  cveId: '',
  affectedAssets: '',
};

const SEVERITY_OPTIONS = [
  { value: 'critical', label: 'Critical (9.0 - 10.0)' },
  { value: 'high', label: 'High (7.0 - 8.9)' },
  { value: 'medium', label: 'Medium (4.0 - 6.9)' },
  { value: 'low', label: 'Low (0.1 - 3.9)' },
  { value: 'info', label: 'Info (0.0)' },
];

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'verified', label: 'Verified' },
  { value: 'false_positive', label: 'False Positive' },
];

const Vulnerabilities = () => {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');

  // Modals state
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [selectedVulnerability, setSelectedVulnerability] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  useEffect(() => {
    fetchVulnerabilities();
    fetchAssessmentsList();
  }, [filter]);

  const fetchVulnerabilities = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await vulnerabilityService.getVulnerabilities(params);
      setVulnerabilities(response.vulnerabilities || []);
    } catch (error) {
      toast.error('Failed to fetch vulnerabilities');
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

  const handleView = (vulnerability) => {
    setSelectedVulnerability(vulnerability);
    setIsViewOpen(true);
  };

  const handleEdit = (vulnerability) => {
    setSelectedVulnerability(vulnerability);
    setIsCreateMode(false);

    const affected = Array.isArray(vulnerability.affectedAssets)
      ? vulnerability.affectedAssets.join(', ')
      : (vulnerability.affectedAssets || '');

    setFormData({
      assessmentId: typeof vulnerability.assessmentId === 'object' ? vulnerability.assessmentId?._id : (vulnerability.assessmentId || ''),
      title: vulnerability.title || '',
      description: vulnerability.description || '',
      cvssScore: vulnerability.cvssScore !== undefined ? String(vulnerability.cvssScore) : '5.0',
      severity: vulnerability.severity || 'medium',
      status: vulnerability.status || 'open',
      remediation: vulnerability.remediation || '',
      cveId: vulnerability.cveId || '',
      affectedAssets: affected,
    });
    setIsEditOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedVulnerability(null);
    setIsCreateMode(true);
    setFormData({
      ...INITIAL_FORM,
      assessmentId: assessments.length > 0 ? assessments[0]._id : '',
    });
    setIsEditOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vulnerability?')) {
      return;
    }

    try {
      await vulnerabilityService.deleteVulnerability(id);
      toast.success('Vulnerability deleted successfully');
      fetchVulnerabilities();
    } catch (error) {
      toast.error('Failed to delete vulnerability');
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

    if (!formData.assessmentId || !formData.title || !formData.description || formData.cvssScore === '') {
      toast.error('Please fill in required fields (Assessment, Title, Description, CVSS Score)');
      return;
    }

    const payload = {
      ...formData,
      cvssScore: parseFloat(formData.cvssScore),
      affectedAssets: formData.affectedAssets
        ? formData.affectedAssets.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    };

    if (!payload.cveId || !payload.cveId.trim()) {
      delete payload.cveId;
    } else {
      payload.cveId = payload.cveId.trim();
    }

    setSubmitting(true);
    try {
      if (isCreateMode) {
        await vulnerabilityService.createVulnerability(payload);
        toast.success('Vulnerability created successfully');
      } else {
        await vulnerabilityService.updateVulnerability(selectedVulnerability._id, payload);
        toast.success('Vulnerability updated successfully');
      }
      setIsEditOpen(false);
      fetchVulnerabilities();
    } catch (error) {
      console.error('Vulnerability submit error:', error.response?.data);
      const validationErr = error.response?.data?.errors?.[0];
      const errorMsg = validationErr
        ? `${validationErr.field}: ${validationErr.message}`
        : (error.response?.data?.message || `Failed to ${isCreateMode ? 'create' : 'update'} vulnerability`);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityVariant = (severity) => {
    switch (severity) {
      case 'critical':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'verified':
      case 'fixed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'open':
        return 'danger';
      case 'false_positive':
        return 'default';
      default:
        return 'default';
    }
  };

  const tableColumns = [
    {
      key: 'title',
      label: 'Title',
    },
    {
      key: 'severity',
      label: 'Severity',
      render: (value) => (
        <Badge variant={getSeverityVariant(value)}>
          {value ? value.toUpperCase() : 'INFO'}
        </Badge>
      ),
    },
    {
      key: 'cvssScore',
      label: 'CVSS Score',
      render: (value) => <span className="font-semibold text-white">{value}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge variant={getStatusVariant(value)}>
          {value ? value.replace('_', ' ').toUpperCase() : 'OPEN'}
        </Badge>
      ),
    },
    {
      key: 'assessmentId',
      label: 'Assessment',
      render: (val) => {
        if (!val) return 'N/A';
        if (typeof val === 'object') return val.companyName || val._id;
        return val;
      },
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
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
            title="Edit Vulnerability"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            title="Delete Vulnerability"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const assessmentSelectOptions = assessments.map((a) => ({
    value: a._id,
    label: `${a.companyName} (${a.assessmentType ? a.assessmentType.replace('_', ' ') : 'Assessment'})`,
  }));

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Vulnerabilities</h1>
        <Button icon={Plus} onClick={handleCreateNew}>
          Add Vulnerability
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'open', 'in_progress', 'fixed', 'verified'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl transition-colors ${filter === status
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium'
              : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/50'
              }`}
          >
            {status.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Vulnerabilities Table */}
      <Table
        columns={tableColumns}
        data={vulnerabilities}
        loading={loading}
        emptyMessage="No vulnerabilities found"
      />

      {/* View Vulnerability Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Vulnerability Findings Detail"
        maxWidth="max-w-3xl"
      >
        {selectedVulnerability && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{selectedVulnerability.title}</h3>
                {selectedVulnerability.cveId && (
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded">
                    {selectedVulnerability.cveId}
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <Badge variant={getSeverityVariant(selectedVulnerability.severity)}>
                  {selectedVulnerability.severity ? selectedVulnerability.severity.toUpperCase() : 'INFO'}
                </Badge>
                <Badge variant={getStatusVariant(selectedVulnerability.status)}>
                  {selectedVulnerability.status ? selectedVulnerability.status.replace('_', ' ').toUpperCase() : ''}
                </Badge>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <div>
                <p className="text-xs text-slate-500">CVSS Score</p>
                <p className="text-xl font-bold text-cyan-400">{selectedVulnerability.cvssScore} / 10.0</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Target Assessment</p>
                <p className="text-sm font-medium text-white truncate">
                  {typeof selectedVulnerability.assessmentId === 'object'
                    ? selectedVulnerability.assessmentId?.companyName
                    : selectedVulnerability.assessmentId}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Discovered Date</p>
                <p className="text-sm font-medium text-white">
                  {selectedVulnerability.createdAt ? new Date(selectedVulnerability.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-2">Description</h4>
              <p className="text-sm text-slate-300 bg-slate-950/50 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap">
                {selectedVulnerability.description}
              </p>
            </div>

            {/* Remediation */}
            {selectedVulnerability.remediation && (
              <div>
                <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-2">Remediation Steps</h4>
                <p className="text-sm text-slate-300 bg-slate-950/50 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap">
                  {selectedVulnerability.remediation}
                </p>
              </div>
            )}

            {/* Affected Assets */}
            {selectedVulnerability.affectedAssets && selectedVulnerability.affectedAssets.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-2">Affected Assets</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedVulnerability.affectedAssets.map((asset, idx) => (
                    <span key={idx} className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
                      {asset}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
              <Button variant="secondary" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>
              <Button icon={Edit} onClick={() => { setIsViewOpen(false); handleEdit(selectedVulnerability); }}>
                Edit Finding
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit Vulnerability Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={isCreateMode ? 'Add New Vulnerability Finding' : 'Edit Vulnerability'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {assessmentSelectOptions.length > 0 ? (
            <Select
              label="Associated Assessment"
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
              placeholder="Paste Mongo Assessment ID"
              required
            />
          )}

          <Input
            label="Vulnerability Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g. SQL Injection in Search API"
            icon={ShieldAlert}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="number"
              step="0.1"
              min="0"
              max="10"
              label="CVSS Score (0 - 10)"
              name="cvssScore"
              value={formData.cvssScore}
              onChange={handleInputChange}
              required
            />
            <Select
              label="Severity"
              name="severity"
              value={formData.severity}
              onChange={handleInputChange}
              options={SEVERITY_OPTIONS}
              required
            />
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              options={STATUS_OPTIONS}
              required
            />
          </div>

          <Input
            label="CVE ID (Optional)"
            name="cveId"
            value={formData.cveId}
            onChange={handleInputChange}
            placeholder="e.g. CVE-2024-1234"
          />

          <Input
            label="Affected Assets (Comma Separated)"
            name="affectedAssets"
            value={formData.affectedAssets}
            onChange={handleInputChange}
            placeholder="e.g. api.domain.com, /v1/users, 192.168.1.10"
          />

          <Textarea
            label="Detailed Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            placeholder="Explain the vulnerability mechanism, proof-of-concept steps, and potential impact..."
            required
          />

          <Textarea
            label="Remediation Guidance"
            name="remediation"
            value={formData.remediation}
            onChange={handleInputChange}
            rows={3}
            placeholder="Provide recommended code fixes, security configurations, or patch instructions..."
          />

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {isCreateMode ? 'Add Vulnerability' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Vulnerabilities;
