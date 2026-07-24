import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, LogOut, Home, User, Menu, X, AlertTriangle, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const CustomerLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/customer/dashboard" className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl border border-cyan-500/30">
                  <Shield className="w-6 h-6 text-cyan-400" />
                </div>
                <span className="text-xl font-bold text-white">CyberPortal</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <Link
                to="/customer/dashboard"
                className="flex items-center space-x-2 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-slate-700/30"
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/customer/vulnerabilities"
                className="flex items-center space-x-2 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-slate-700/30"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Vulnerabilities</span>
              </Link>
              <Link
                to="/customer/reports"
                className="flex items-center space-x-2 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-slate-700/30"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Reports</span>
              </Link>

              <div className="flex items-center space-x-3 border-l border-slate-700/50 pl-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm text-slate-300">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-slate-400 hover:text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-slate-700/30"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/30"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-800/95 backdrop-blur-sm border-b border-slate-700/50">
            <div className="px-4 py-4 space-y-3">
              <Link
                to="/customer/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 text-slate-300 hover:text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-slate-700/30"
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/customer/vulnerabilities"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 text-slate-300 hover:text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-slate-700/30"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Vulnerabilities</span>
              </Link>
              <Link
                to="/customer/reports"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 text-slate-300 hover:text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-slate-700/30"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Reports</span>
              </Link>
              <div className="border-t border-slate-700/50 pt-3">
                <div className="flex items-center space-x-2 px-4 py-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm text-slate-300">{user?.name}</span>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-slate-400 hover:text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-slate-700/30 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default CustomerLayout;
