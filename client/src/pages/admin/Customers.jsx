import React, { useState, useEffect } from 'react';
import { Users, Mail, Shield, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../../services/userService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import CardBody from '../../components/common/Card';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    company: '',
    role: 'customer',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers({ role: 'customer' });
      setCustomers(response.users || []);
    } catch (error) {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email');
      return;
    }

    setSubmitting(true);

    try {
      await userService.createUser(formData);
      toast.success('Customer created successfully');
      setShowModal(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        company: '',
        role: 'customer',
      });
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      await userService.deleteUser(id);
      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to delete customer');
    }
  };

  const tableColumns = [
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'email',
      label: 'Email',
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Mail className="w-4 h-4 text-slate-400" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'company',
      label: 'Company',
    },
    {
      key: 'phone',
      label: 'Phone',
    },
    {
      key: 'role',
      label: 'Role',
      render: (value) => (
        <Badge variant={value === 'admin' ? 'danger' : 'info'}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => handleDelete(row._id)}
            className="text-red-400 hover:text-red-300 p-1"
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
        <h1 className="text-2xl font-bold text-white">Customers</h1>
        <Button icon={Users} onClick={() => setShowModal(true)}>
          Add Customer
        </Button>
      </div>

      {/* Customers Table */}
      <Table
        columns={tableColumns}
        data={customers}
        loading={loading}
        emptyMessage="No customers found"
      />

      {/* Add Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardBody>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Add New Customer</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <Input
                  type="text"
                  id="name"
                  name="name"
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  icon={Users}
                  required
                />

                <Input
                  type="email"
                  id="email"
                  name="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="customer@company.com"
                  icon={Mail}
                  required
                />

                <Input
                  type="password"
                  id="password"
                  name="password"
                  label="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  icon={Shield}
                  required
                />

                <Input
                  type="text"
                  id="phone"
                  name="phone"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  icon={Mail}
                />

                <Input
                  type="text"
                  id="company"
                  name="company"
                  label="Company Name"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Company Inc"
                  icon={Users}
                />

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={submitting}>
                    Create Customer
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Customers;
