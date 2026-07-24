import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, Building, User, Mail, Phone, Calendar, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAssessments, createAssessment, updateAssessment, deleteAssessment } from '../../services/assessmentService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Input, { Textarea, Select } from '../../components/common/Input';

const INITIAL_FORM_STATE = {
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  assessmentType: 'network_security',
  status: 'pending',
  scope: '',
  description: '',
  preferredDate: '',
  notes: '',
};

const ASSESSMENT_TYPES = [
  { value: 'network_security', label: 'Network Security' },
  { value: 'web_application', label: 'Web Application' },
  { value: 'mobile_application', label: 'Mobile Application' },
  { value: 'cloud_security', label: 'Cloud Security' },
  { value: 'penetration_testing', label: 'Penetration Testing' },
  { value: 'compliance_audit', label: 'Compliance Audit' },
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const Assessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');

  // Modal states
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  useEffect(() => {
    fetchAssessments();
  }, [filter]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await getAssessments(params);
      setAssessments(response.assessments || []);
    } catch (error) {
      toast.error('Failed to fetch assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (assessment) => {
    setSelectedAssessment(assessment);
    setIsViewOpen(true);
  };

  const handleEdit = (assessment) => {
    setSelectedAssessment(assessment);
    setIsCreateMode(false);
    const dateFormatted = assessment.preferredDate 
      ? new Date(assessment.preferredDate).toISOString().split('T')[0] 
      : '';

    setFormData({
      companyName: assessment.companyName || '',
      contactPerson: assessment.contactPerson || '',
      email: assessment.email || '',
      phone: assessment.phone || '',
      assessmentType: assessment.assessmentType || 'network_security',
      status: assessment.status || 'pending',
      scope: assessment.scope || '',
      description: assessment.description || '',
      preferredDate: dateFormatted,
      notes: assessment.notes || '',
    });
    setIsEditOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedAssessment(null);
    setIsCreateMode(true);
    setFormData(INITIAL_FORM_STATE);
    setIsEditOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) {
      return;
    }

    try {
      await deleteAssessment(id);
      toast.success('Assessment deleted successfully');
      fetchAssessments();
    } catch (error) {
      toast.error('Failed to delete assessment');
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

    if (!formData.companyName || !formData.contactPerson || !formData.email ||
        !formData.phone || !formData.scope || !formData.description || !formData.preferredDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      if (isCreateMode) {
        await createAssessment(formData);
        toast.success('Assessment created successfully');
      } else {
        await updateAssessment(selectedAssessment._id, formData);
        toast.success('Assessment updated successfully');
      }
      setIsEditOpen(false);
      fetchAssessments();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${isCreateMode ? 'create' : 'update'} assessment`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'pending':
        return 'info';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  const formatAssessmentType = (type) => {
    if (!type) return '';
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const tableColumns = [
    {
      key: 'companyName',
      label: 'Company',
    },
    {
      key: 'contactPerson',
      label: 'Contact',
    },
    {
      key: 'assessmentType',
      label: 'Type',
      render: (value) => formatAssessmentType(value),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge variant={getStatusVariant(value)}>
          {value ? value.replace('_', ' ').toUpperCase() : 'PENDING'}
        </Badge>
      ),
    },
    {
      key: 'preferredDate',
      label: 'Preferred Date',
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
            title="Edit Assessment"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            title="Delete Assessment"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Assessments</h1>
        <Button icon={Plus} onClick={handleCreateNew}>
          New Assessment
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'pending', 'in_progress', 'completed', 'cancelled'].map((status) => (
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

      {/* Assessments Table */}
      <Table
        columns={tableColumns}
        data={assessments}
        loading={loading}
        emptyMessage="No assessments found"
      />

      {/* View Assessment Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Assessment Details"
        maxWidth="max-w-3xl"
      >
        {selectedAssessment && (
          <div className="space-y-6">
            {/* Status & Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider">Assessment ID</span>
                <p className="text-sm font-mono text-cyan-400">{selectedAssessment._id}</p>
              </div>
              <Badge variant={getStatusVariant(selectedAssessment.status)}>
                {selectedAssessment.status ? selectedAssessment.status.replace('_', ' ').toUpperCase() : ''}
              </Badge>
            </div>

            {/* Company Info */}
            <div>
              <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-3">Company Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <div>
                  <p className="text-xs text-slate-500">Company Name</p>
                  <p className="text-sm font-medium text-white">{selectedAssessment.companyName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Contact Person</p>
                  <p className="text-sm font-medium text-white">{selectedAssessment.contactPerson}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email Address</p>
                  <p className="text-sm font-medium text-white">{selectedAssessment.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Phone Number</p>
                  <p className="text-sm font-medium text-white">{selectedAssessment.phone}</p>
                </div>
              </div>
            </div>

            {/* Assessment Details */}
            <div>
              <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-3">Assessment Requirements</h4>
              <div className="space-y-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Assessment Type</p>
                    <p className="text-sm font-medium text-white">{formatAssessmentType(selectedAssessment.assessmentType)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Preferred Date</p>
                    <p className="text-sm font-medium text-white">
                      {selectedAssessment.preferredDate ? new Date(selectedAssessment.preferredDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-1">Scope</p>
                  <p className="text-sm text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap">
                    {selectedAssessment.scope || 'No scope specified.'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-1">Description</p>
                  <p className="text-sm text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap">
                    {selectedAssessment.description || 'No description provided.'}
                  </p>
                </div>

                {selectedAssessment.notes && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Admin Notes</p>
                    <p className="text-sm text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap">
                      {selectedAssessment.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
              <Button variant="secondary" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>
              <Button icon={Edit} onClick={() => { setIsViewOpen(false); handleEdit(selectedAssessment); }}>
                Edit Assessment
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit / Create Assessment Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={isCreateMode ? 'New Assessment Request' : 'Edit Assessment'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="e.g. Acme Cybersecurity Corp"
              icon={Building}
              required
            />
            <Input
              label="Contact Person"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleInputChange}
              placeholder="e.g. Jane Doe"
              icon={User}
              required
            />
            <Input
              type="email"
              label="Email Address"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="jane@acme.com"
              icon={Mail}
              required
            />
            <Input
              type="tel"
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+1 (555) 000-0000"
              icon={Phone}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Assessment Type"
              name="assessmentType"
              value={formData.assessmentType}
              onChange={handleInputChange}
              options={ASSESSMENT_TYPES}
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
            type="date"
            label="Preferred Assessment Date"
            name="preferredDate"
            value={formData.preferredDate}
            onChange={handleInputChange}
            icon={Calendar}
            required
          />

          <Textarea
            label="Assessment Scope"
            name="scope"
            value={formData.scope}
            onChange={handleInputChange}
            rows={3}
            placeholder="Specify target networks, IPs, web applications, or cloud environments..."
            required
          />

          <Textarea
            label="Description & Requirements"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            placeholder="Enter detailed instructions or special security requirements..."
            required
          />

          <Textarea
            label="Admin Internal Notes (Optional)"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={2}
            placeholder="Add internal notes visible to security engineers..."
          />

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {isCreateMode ? 'Create Assessment' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Assessments;
