import React, { useState, useEffect } from 'react';
import { AlertTriangle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { vulnerabilityService } from '../../services/vulnerabilityService';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';

const Vulnerabilities = () => {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedVulnerability, setSelectedVulnerability] = useState(null);

  useEffect(() => {
    fetchVulnerabilities();
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

  const handleView = (vulnerability) => {
    setSelectedVulnerability(vulnerability);
    setIsViewOpen(true);
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
      case 'resolved':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'open':
        return 'danger';
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
      label: 'Discovered Date',
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
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">My Vulnerabilities</h1>
          <p className="text-sm text-slate-400">Security findings identified across your organization's assessments</p>
        </div>
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

      {/* View Vulnerability Details Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Vulnerability Finding Details"
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

            {/* Metrics */}
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

            <div className="flex justify-end pt-4 border-t border-slate-800">
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

export default Vulnerabilities;
