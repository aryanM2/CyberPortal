import React, { useState, useEffect } from 'react';
import { Users, FileText, AlertTriangle, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import assessmentService from '../../services/assessmentService';
import { userService } from '../../services/userService';
import { vulnerabilityService } from '../../services/vulnerabilityService';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import CardHeader from '../../components/common/Card';
import CardBody from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import CustomBarChart from '../../components/charts/BarChart';
import CustomPieChart from '../../components/charts/PieChart';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalAssessments: 0,
    totalVulnerabilities: 0,
    pendingAssessments: 0,
  });

  const [trends, setTrends] = useState({
    customers: { trend: 'neutral', trendValue: 0 },
    assessments: { trend: 'neutral', trendValue: 0 },
    vulnerabilities: { trend: 'neutral', trendValue: 0 },
    pending: { trend: 'neutral', trendValue: 0 },
  });

  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [severityData, setSeverityData] = useState([]);
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [topVulnerabilities, setTopVulnerabilities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const calculateMoMTrend = (items) => {
    if (!items || items.length === 0) {
      return { trend: 'neutral', trendValue: 0 };
    }

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    let thisMonthCount = 0;
    let lastMonthCount = 0;

    items.forEach((item) => {
      if (item.createdAt) {
        const created = new Date(item.createdAt);
        if (created >= thisMonthStart) {
          thisMonthCount += 1;
        } else if (created >= lastMonthStart && created < thisMonthStart) {
          lastMonthCount += 1;
        }
      }
    });

    if (lastMonthCount === 0) {
      if (thisMonthCount === 0) return { trend: 'neutral', trendValue: 0 };
      return { trend: 'up', trendValue: 100 };
    }

    const percentageChange = Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100);

    if (percentageChange > 0) return { trend: 'up', trendValue: percentageChange };
    if (percentageChange < 0) return { trend: 'down', trendValue: Math.abs(percentageChange) };
    return { trend: 'neutral', trendValue: 0 };
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersResponse, assessmentsResponse, vulnResponse] = await Promise.all([
        userService.getUsers({ role: 'customer' }),
        assessmentService.getAssessments({ limit: 100 }),
        vulnerabilityService.getVulnerabilities({ limit: 100 }),
      ]);

      const users = usersResponse.users || [];
      const assessments = assessmentsResponse.assessments || [];
      const vulnerabilities = vulnResponse.vulnerabilities || [];
      const pendingAssessmentsList = assessments.filter(a => a.status === 'pending');

      // 1. Core Summary Stats
      setStats({
        totalCustomers: users.length,
        totalAssessments: assessments.length,
        totalVulnerabilities: vulnerabilities.length,
        pendingAssessments: pendingAssessmentsList.length,
      });

      // 2. Real Month-over-Month Trends
      setTrends({
        customers: calculateMoMTrend(users),
        assessments: calculateMoMTrend(assessments),
        vulnerabilities: calculateMoMTrend(vulnerabilities),
        pending: calculateMoMTrend(pendingAssessmentsList),
      });

      // 3. Real Severity Breakdown for Pie Chart
      const severityCounts = {
        Critical: 0,
        High: 0,
        Medium: 0,
        Low: 0,
        Info: 0,
      };

      vulnerabilities.forEach((v) => {
        const sev = (v.severity || 'info').toLowerCase();
        if (sev === 'critical') severityCounts.Critical += 1;
        else if (sev === 'high') severityCounts.High += 1;
        else if (sev === 'medium') severityCounts.Medium += 1;
        else if (sev === 'low') severityCounts.Low += 1;
        else severityCounts.Info += 1;
      });

      const pieData = Object.keys(severityCounts).map((key) => ({
        name: key,
        value: severityCounts[key],
      }));
      setSeverityData(pieData);

      // 4. Real Monthly Assessment Volume for Bar Chart (Last 6 months)
      const months = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const now = new Date();

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
          month: monthNames[d.getMonth()],
          year: d.getFullYear(),
          monthNum: d.getMonth(),
          assessments: 0,
        });
      }

      assessments.forEach((a) => {
        if (a.createdAt) {
          const date = new Date(a.createdAt);
          const mIndex = months.findIndex(m => m.monthNum === date.getMonth() && m.year === date.getFullYear());
          if (mIndex !== -1) {
            months[mIndex].assessments += 1;
          }
        }
      });

      setMonthlyData(months.map(({ month, assessments }) => ({ month, assessments })));

      // 5. Real Recent Assessments
      setRecentAssessments(assessments.slice(0, 4));

      // 6. Real Critical / High-Risk Vulnerabilities (Sorted by CVSS Score)
      const sortedVulns = [...vulnerabilities]
        .sort((a, b) => (b.cvssScore || 0) - (a.cvssScore || 0))
        .slice(0, 4);
      setTopVulnerabilities(sortedVulns);

    } catch (error) {
      toast.error('Failed to fetch dashboard metrics');
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

  const getSeverityVariant = (severity) => {
    switch ((severity || '').toLowerCase()) {
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

  const formatAssessmentType = (type) => {
    if (!type) return '';
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Admin Dashboard Overview</h1>
            <p className="text-sm text-slate-400">Real-time statistics across assessments, clients, and vulnerability findings</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Customers"
              value={stats.totalCustomers}
              icon={Users}
              trend={trends.customers.trend}
              trendValue={trends.customers.trendValue}
            />
            <StatCard
              title="Total Assessments"
              value={stats.totalAssessments}
              icon={FileText}
              trend={trends.assessments.trend}
              trendValue={trends.assessments.trendValue}
            />
            <StatCard
              title="Total Vulnerabilities"
              value={stats.totalVulnerabilities}
              icon={AlertTriangle}
              trend={trends.vulnerabilities.trend}
              trendValue={trends.vulnerabilities.trendValue}
            />
            <StatCard
              title="Pending Assessments"
              value={stats.pendingAssessments}
              icon={TrendingUp}
              trend={trends.pending.trend}
              trendValue={trends.pending.trendValue}
            />
          </div>

          {/* Real Data Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">Monthly Assessment Volume</h2>
                  <span className="text-xs text-cyan-400 font-mono">Last 6 Months</span>
                </div>
              </CardHeader>
              <CardBody>
                <CustomBarChart data={monthlyData} dataKey="assessments" xAxisKey="month" />
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">Vulnerability Severity Distribution</h2>
                  <span className="text-xs text-slate-400">Live Database Findings</span>
                </div>
              </CardHeader>
              <CardBody>
                <CustomPieChart data={severityData} />
              </CardBody>
            </Card>
          </div>

          {/* Recent Activity Real Data */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-white">Recent Assessment Requests</h2>
              </CardHeader>
              <CardBody>
                {recentAssessments.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4 text-center">No assessments found in database</p>
                ) : (
                  <div className="space-y-3">
                    {recentAssessments.map((item) => (
                      <div key={item._id} className="flex items-center justify-between p-3.5 bg-slate-900/50 rounded-xl border border-slate-800">
                        <div>
                          <p className="text-white font-medium text-sm">{item.companyName}</p>
                          <p className="text-slate-400 text-xs">{formatAssessmentType(item.assessmentType)}</p>
                        </div>
                        <Badge variant={getStatusVariant(item.status)}>
                          {item.status ? item.status.replace('_', ' ').toUpperCase() : 'PENDING'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-white">Highest Risk Vulnerabilities</h2>
              </CardHeader>
              <CardBody>
                {topVulnerabilities.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4 text-center">No vulnerabilities found in database</p>
                ) : (
                  <div className="space-y-3">
                    {topVulnerabilities.map((item) => (
                      <div key={item._id} className="flex items-center justify-between p-3.5 bg-slate-900/50 rounded-xl border border-slate-800">
                        <div>
                          <p className="text-white font-medium text-sm">{item.title}</p>
                          <p className="text-cyan-400 text-xs font-mono">CVSS Score: {item.cvssScore} / 10.0</p>
                        </div>
                        <Badge variant={getSeverityVariant(item.severity)}>
                          {item.severity ? item.severity.toUpperCase() : 'INFO'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
