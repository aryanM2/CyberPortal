import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, LogOut, Users, FileText, AlertTriangle, BarChart3, Home, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/admin/customers', icon: Users, label: 'Customers' },
    { path: '/admin/assessments', icon: FileText, label: 'Assessments' },
    { path: '/admin/vulnerabilities', icon: AlertTriangle, label: 'Vulnerabilities' },
    { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 flex-col">
        <div className="p-6 border-b border-slate-700/50">
          <Link to="/admin/dashboard" className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl border border-cyan-500/30">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
            <span className="text-xl font-bold text-white">CyberPortal</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center space-x-3 text-slate-300 hover:text-white px-4 py-3 rounded-xl transition-colors hover:bg-slate-700/30"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center space-x-3 mb-4 px-4">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 text-slate-400 hover:text-white px-4 py-3 rounded-xl transition-colors hover:bg-slate-700/30 w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden flex-1 flex flex-col">
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/30"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                <Link to="/admin/dashboard" className="flex items-center space-x-2">
                  <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl border border-cyan-500/30">
                    <Shield className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span className="text-lg font-bold text-white">CyberPortal</span>
                </Link>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user?.name?.charAt(0) || 'A'}
                </div>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <nav className="mt-4 space-y-2 pb-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 text-slate-300 hover:text-white px-4 py-3 rounded-xl transition-colors hover:bg-slate-700/30"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 text-slate-400 hover:text-white px-4 py-3 rounded-xl transition-colors hover:bg-slate-700/30 w-full mt-4"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </nav>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* Desktop Main Content */}
      <div className="hidden lg:flex flex-1 flex-col">
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
