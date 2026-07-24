import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import assessmentService from '../../services/assessmentService';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import CardHeader from '../../components/common/Card';
import CardBody from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';

const CustomerDashboard = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

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
          {value.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'preferredDate',
      label: 'Preferred Date',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Link
          to={`/customer/assessments/${row._id}`}
          className="text-cyan-400 hover:text-cyan-300 font-medium"
        >
          View
        </Link>
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
    </div>
  );
};

export default CustomerDashboard;
