import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Clock, CheckCircle, Eye, Building, User, Mail, Phone, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import assessmentService from '../../services/assessmentService';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import CardHeader from '../../components/common/Card';
import CardBody from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';

const CustomerDashboard = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await assessmentService.getAssessments();
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
    if (!type) return 'N/A';
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
      key: 'assessmentType',
      label: 'Type',
      render: (value) => formatAssessmentType(value),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge variant={getStatusVariant(value)}>
          {value ? value.replace('_', ' ') : 'pending'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A',
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
        <button
          onClick={() => handleView(row)}
          className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center transition-colors"
        >
          <Eye className="w-4 h-4 mr-1" />
          <span>View</span>
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Manage your cybersecurity assessments</p>
        </div>
        <Link to="/customer/assessments/new">
          <Button icon={Plus} size="lg">
            New Assessment
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Assessments"
          value={assessments.length}
          icon={FileText}
          trend="up"
          trendValue={12}
        />

        <StatCard
          title="In Progress"
          value={assessments.filter(a => a.status === 'in_progress').length}
          icon={Clock}
          trend="neutral"
          trendValue={0}
        />

        <StatCard
          title="Completed"
          value={assessments.filter(a => a.status === 'completed').length}
          icon={CheckCircle}
          trend="up"
          trendValue={8}
        />
      </div>

      {/* Assessments Table */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-white">Recent Assessments</h2>
        </CardHeader>
        <CardBody className="p-0">
          <Table
            columns={tableColumns}
            data={assessments}
            loading={loading}
            emptyMessage="No assessments found. Create your first assessment to get started."
          />
        </CardBody>
      </Card>

      {/* View Assessment Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Assessment Details"
        maxWidth="max-w-3xl"
      >
        {selectedAssessment && (
          <div className="space-y-6">
            {/* Header / Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {selectedAssessment.companyName}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Assessment ID: {selectedAssessment._id}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={getStatusVariant(selectedAssessment.status)}>
                  {selectedAssessment.status ? selectedAssessment.status.replace('_', ' ').toUpperCase() : 'PENDING'}
                </Badge>
                <Badge variant="info">
                  {formatAssessmentType(selectedAssessment.assessmentType)}
                </Badge>
              </div>
            </div>

            {/* Contact & Company Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <div className="flex items-start space-x-3">
                <Building className="w-5 h-5 text-cyan-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Company Name</p>
                  <p className="text-sm font-medium text-white">{selectedAssessment.companyName || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-cyan-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Contact Person</p>
                  <p className="text-sm font-medium text-white">{selectedAssessment.contactPerson || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-cyan-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Email Address</p>
                  <p className="text-sm font-medium text-white">{selectedAssessment.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-cyan-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Phone Number</p>
                  <p className="text-sm font-medium text-white">{selectedAssessment.phone || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Assessment Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-cyan-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Preferred Assessment Date</p>
                  <p className="text-sm font-medium text-white">
                    {selectedAssessment.preferredDate
                      ? new Date(selectedAssessment.preferredDate).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-cyan-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Request Created Date</p>
                  <p className="text-sm font-medium text-white">
                    {selectedAssessment.createdAt
                      ? new Date(selectedAssessment.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Scope */}
            {selectedAssessment.scope && (
              <div>
                <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-2">Assessment Scope</h4>
                <p className="text-sm text-slate-300 bg-slate-950/50 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap">
                  {selectedAssessment.scope}
                </p>
              </div>
            )}

            {/* Description & Requirements */}
            {selectedAssessment.description && (
              <div>
                <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-2">Description & Requirements</h4>
                <p className="text-sm text-slate-300 bg-slate-950/50 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap">
                  {selectedAssessment.description}
                </p>
              </div>
            )}

            {/* Modal Actions Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-800">
              {selectedAssessment.status === 'completed' ? (
                <Link to="/customer/reports">
                  <Button variant="secondary" size="sm">
                    View Reports
                  </Button>
                </Link>
              ) : (
                <div />
              )}
              <Button variant="secondary" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomerDashboard;
