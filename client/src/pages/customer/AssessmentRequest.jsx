import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, User, Mail, Phone, FileText, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import assessmentService from '../../services/assessmentService';
import Button from '../../components/common/Button';
import Input, { Textarea, Select } from '../../components/common/Input';
import Card from '../../components/common/Card';
import CardBody from '../../components/common/Card';

const AssessmentRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    assessmentType: 'network_security',
    scope: '',
    description: '',
    preferredDate: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.companyName || !formData.contactPerson || !formData.email ||
      !formData.phone || !formData.scope || !formData.description || !formData.preferredDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email');
      return;
    }

    setLoading(true);

    try {
      await assessmentService.createAssessment(formData);
      toast.success('Assessment request submitted successfully');
      navigate('/customer/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit assessment');
    } finally {
      setLoading(false);
    }
  };

  const assessmentTypes = [
    { value: 'network_security', label: 'Network Security' },
    { value: 'web_application', label: 'Web Application' },
    { value: 'mobile_application', label: 'Mobile Application' },
    { value: 'cloud_security', label: 'Cloud Security' },
    { value: 'penetration_testing', label: 'Penetration Testing' },
    { value: 'compliance_audit', label: 'Compliance Audit' },
  ];

  return (
    <div>
      <button
        onClick={() => navigate('/customer/dashboard')}
        className="flex items-center space-x-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Dashboard</span>
      </button>

      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-white mb-2">New Assessment Request</h1>
        <p className="text-slate-400 mb-8">
          Submit a new cybersecurity assessment request for your organization
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <Card>
            <CardBody>
              <h2 className="text-xl font-semibold text-white mb-6">Company Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  type="text"
                  id="companyName"
                  name="companyName"
                  label="Company Name"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Your Company Name"
                  icon={Building}
                  required
                />

                <Input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  label="Contact Person"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="John Doe"
                  icon={User}
                  required
                />

                <Input
                  type="email"
                  id="email"
                  name="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@company.com"
                  icon={Mail}
                  required
                />

                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  icon={Phone}
                  required
                />
              </div>
            </CardBody>
          </Card>

          {/* Assessment Details */}
          <Card>
            <CardBody>
              <h2 className="text-xl font-semibold text-white mb-6">Assessment Details</h2>

              <div className="space-y-6">
                <Select
                  id="assessmentType"
                  name="assessmentType"
                  label="Assessment Type"
                  value={formData.assessmentType}
                  onChange={handleChange}
                  options={assessmentTypes}
                  required
                />

                <Textarea
                  id="scope"
                  name="scope"
                  label="Assessment Scope"
                  value={formData.scope}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe the systems, networks, or applications to be assessed..."
                  required
                />

                <Textarea
                  id="description"
                  name="description"
                  label="Description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Provide detailed information about your assessment requirements..."
                  required
                />

                <Input
                  type="date"
                  id="preferredDate"
                  name="preferredDate"
                  label="Preferred Assessment Date"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  icon={Calendar}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </CardBody>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              onClick={() => navigate('/customer/dashboard')}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
            >
              Submit Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssessmentRequest;
