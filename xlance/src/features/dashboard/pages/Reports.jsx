import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button } from '../../../shared/components';
import { DownloadCloud, TrendingUp, TrendingDown, IndianRupee, Briefcase, CheckCircle, Star, Users, Calendar, Wallet } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { reportsService } from '../services/reportsService';

const currency = (v) => `₹${v.toLocaleString('en-IN')}`;

const EnhancedStatCard = ({ title, value, subtitle, trend, icon: Icon, gradient, loading }) => (
  <div className="relative">
    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient} rounded-t-xl`} />
    <Card hover={false} className="p-5 shadow-md">
      {loading ? (
        <div className="animate-pulse">
          <div className="h-12 w-12 bg-gray-200 rounded-xl mb-3" />
          <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
          <div className="h-6 bg-gray-200 rounded w-28" />
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between mb-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
              <Icon size={24} />
            </div>
            {trend !== undefined && trend !== null && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${trend >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(trend)}%
              </div>
            )}
          </div>
          <div className="text-sm text-gray-500 font-medium mb-1">{title}</div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
        </>
      )}
    </Card>
  </div>
);

const Reports = () => {
  const { user, userProfile } = useAuth();

  // Determine role
  const isClient = useMemo(() => {
    if (!userProfile?.role) return false;
    if (Array.isArray(userProfile.role)) return userProfile.role.some(r => r.toLowerCase() === 'client') && !userProfile.role.some(r => r.toLowerCase() === 'freelancer');
    return userProfile.role?.toLowerCase() === 'client';
  }, [userProfile]);

  const role = isClient ? 'client' : 'freelancer';

  // State
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [series, setSeries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState({ transactions: [], totalCount: 0, totalPages: 0 });
  const [partners, setPartners] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [page, setPage] = useState(1);
  const [range, setRange] = useState('This month');
  const [projectType, setProjectType] = useState('All');

  const perPage = 8;

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return;

      setLoading(true);
      try {
        const [summaryData, seriesData, categoryData, txData, partnerData, metricsData] = await Promise.all([
          reportsService.getSummary(user.uid, role),
          reportsService.getMonthlySeries(user.uid, role),
          reportsService.getCategoryBreakdown(user.uid, role),
          reportsService.getTransactions(user.uid, role, 1, perPage),
          reportsService.getTopPartners(user.uid, role),
          reportsService.getPerformanceMetrics(user.uid, role)
        ]);

        setSummary(summaryData);
        setSeries(seriesData);
        setCategories(categoryData);
        setTransactions(txData);
        setPartners(partnerData);
        setMetrics(metricsData);
      } catch (err) {
        console.error('Error fetching reports data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.uid, role]);

  // Fetch transactions when page changes
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.uid || page === 1) return; // Page 1 already fetched
      try {
        const txData = await reportsService.getTransactions(user.uid, role, page, perPage);
        setTransactions(txData);
      } catch (err) {
        console.error('Error fetching transactions:', err);
      }
    };

    fetchTransactions();
  }, [page, user?.uid, role]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Released': return 'bg-green-50 text-green-700 border-green-200';
      case 'Pending Review': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleExport = () => {
    if (transactions.transactions.length === 0) {
      alert('No transactions to export');
      return;
    }

    const rows = transactions.transactions.map(t => ({
      Date: t.date,
      Project: t.project,
      [isClient ? 'Freelancer' : 'Client']: t.client,
      Type: t.type,
      Status: t.status,
      Amount: t.amount,
    }));

    const csv = [Object.keys(rows[0]).join(',')]
      .concat(rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xlance-reports-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Calculate max value for chart scaling
  const maxSeriesValue = Math.max(...series.map(s => s.value), 1);

  return (
    <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isClient ? "Financial Reports" : "Analytics & Reports"}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {isClient ? "Track your spending, project costs, and hiring trends." : "Track your earnings, performance, and client insights."}
          </p>
        </header>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 flex-wrap flex-1">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <select
                className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-300 transition-all"
                value={range}
                onChange={(e) => setRange(e.target.value)}
              >
                <option>This week</option>
                <option>This month</option>
                <option>Last 3 months</option>
                <option>All time</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-gray-400" />
              <select
                className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-300 transition-all"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
              >
                <option>All</option>
                <option>Fixed price</option>
                <option>Hourly</option>
              </select>
            </div>
          </div>

          <Button
            className="inline-flex items-center gap-2 shadow-md"
            variant="primary"
            onClick={handleExport}
            disabled={loading || transactions.transactions.length === 0}
          >
            <DownloadCloud size={16} /> {isClient ? "Export Spending CSV" : "Export Earnings CSV"}
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <EnhancedStatCard
            title={isClient ? "Total Spent" : "Total Earnings"}
            value={loading ? '...' : currency(summary?.totalAmount || 0)}
            trend={summary?.trend}
            icon={isClient ? Wallet : IndianRupee}
            gradient={isClient ? "from-purple-500 to-indigo-600" : "from-green-500 to-emerald-600"}
            loading={loading}
          />
          <EnhancedStatCard
            title={isClient ? "Spent This Month" : "This Month"}
            subtitle={isClient ? "Spending" : "Earnings"}
            value={loading ? '...' : currency(summary?.thisMonthAmount || 0)}
            icon={TrendingUp}
            gradient="from-blue-500 to-blue-600"
            loading={loading}
          />
          <EnhancedStatCard
            title={isClient ? "Active Orders" : "Active Orders"}
            value={loading ? '...' : summary?.activeCount || 0}
            icon={Briefcase}
            gradient={isClient ? "from-pink-500 to-rose-600" : "from-purple-500 to-purple-600"}
            loading={loading}
          />
          <EnhancedStatCard
            title="Completed"
            value={loading ? '...' : summary?.completedCount || 0}
            icon={CheckCircle}
            gradient="from-orange-500 to-orange-600"
            loading={loading}
          />
          <EnhancedStatCard
            title="Total Orders"
            value={loading ? '...' : summary?.totalOrders || 0}
            icon={Star}
            gradient="from-yellow-400 to-yellow-500"
            loading={loading}
          />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column (charts) */}
          <div className="lg:col-span-2 space-y-6">
            <Card hover={false} className="p-6 shadow-md border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">{isClient ? "Spending Over Time" : "Earnings Over Time"}</h3>
                <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">{range}</div>
              </div>

              {/* Area chart */}
              {loading ? (
                <div className="w-full h-56 bg-gray-100 rounded-xl animate-pulse" />
              ) : series.length > 0 && maxSeriesValue > 0 ? (
                <div className="w-full h-56 bg-gradient-to-b from-primary-50/30 to-transparent rounded-xl p-4 border border-gray-100">
                  <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    <polygon
                      fill="url(#areaGradient)"
                      points={`0,40 ${series.map((s, i) => `${(i / (series.length - 1)) * 100},${40 - (s.value / maxSeriesValue) * 35}`).join(' ')} 100,40`}
                    />
                    <polyline
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={series.map((s, i) => `${(i / (series.length - 1)) * 100},${40 - (s.value / maxSeriesValue) * 35}`).join(' ')}
                    />
                  </svg>
                  <div className="flex justify-between mt-2 text-xs text-gray-400">
                    {series.filter((_, i) => i % 2 === 0).map((s, i) => (
                      <span key={i}>{s.label}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full h-56 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-gray-400">No data available yet</p>
                </div>
              )}

              {/* Category breakdown */}
              <div className="mt-8">
                <h4 className="text-sm font-bold mb-4 text-gray-900">{isClient ? "Spending by Category" : "Earnings by Category"}</h4>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
                    ))}
                  </div>
                ) : categories.length > 0 ? (
                  <div className="space-y-4">
                    {categories.map((c) => {
                      const total = categories.reduce((a, b) => a + b.value, 0);
                      const pct = total > 0 ? Math.round((c.value / total) * 100) : 0;
                      return (
                        <div key={c.name} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-lg">{c.icon}</div>
                          <div className="w-24 text-sm font-medium text-gray-700">{c.name}</div>
                          <div className="flex-1 bg-gray-100 h-4 rounded-full overflow-hidden">
                            <div className={`h-4 rounded-full bg-gradient-to-r ${c.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                          </div>
                          <div className="w-12 text-sm text-gray-600 text-right font-medium">{pct}%</div>
                          <div className="w-28 text-sm text-gray-900 text-right font-semibold">{currency(c.value)}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No category data available</p>
                )}
              </div>
            </Card>

            {/* Transactions table */}
            <Card hover={false} className="p-0 overflow-hidden shadow-md border border-gray-100">
              <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Transactions & {isClient ? "Invoices" : "Payouts"}</h3>
                <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">{transactions.totalCount} items</div>
              </div>

              {loading ? (
                <div className="p-6">
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                    ))}
                  </div>
                </div>
              ) : transactions.transactions.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Project</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">{isClient ? "Freelancer" : "Client"}</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {transactions.transactions.map((t) => (
                          <tr key={t.id} className="group hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-600">{t.date}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.project}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{t.client || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{t.type}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(t.status)}`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">{currency(t.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
                    <div className="text-sm text-gray-600">Page {transactions.page} of {transactions.totalPages || 1}</div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                      <Button variant="ghost" onClick={() => setPage((p) => Math.min(transactions.totalPages, p + 1))} disabled={page >= transactions.totalPages}>Next</Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-12 text-center">
                  <Briefcase size={48} className="text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-gray-900 mb-2">No Transactions Yet</h4>
                  <p className="text-gray-500">Complete orders to see your transaction history here.</p>
                </div>
              )}
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Performance metrics */}
            <Card hover={false} className="p-6 shadow-md border border-gray-100">
              <h3 className="text-lg font-bold mb-6 text-gray-900 flex items-center gap-2">
                <Star className="text-yellow-500" size={20} />
                {isClient ? "Hiring Metrics" : "Performance"}
              </h3>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : metrics.length > 0 ? (
                <div className="space-y-5">
                  {metrics.map((metric) => (
                    <div key={metric.label}>
                      <div className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                        <span>{metric.label}</span>
                        <span className="text-gray-900">{metric.value}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                        <div className={`h-3 rounded-full ${metric.color} transition-all duration-500`} style={{ width: `${metric.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center">No metrics available</p>
              )}
            </Card>

            {/* Top partners */}
            <Card hover={false} className="p-6 shadow-md border border-gray-100">
              <h3 className="text-lg font-bold mb-6 text-gray-900 flex items-center gap-2">
                <Users className="text-blue-500" size={20} />
                {isClient ? "Top Freelancers" : "Top Clients"}
              </h3>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : partners.length > 0 ? (
                <div className="space-y-4">
                  {partners.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-xl group hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
                          {c.name?.split(' ').map(s => s[0]).slice(0, 2).join('') || '?'}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{c.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                            <span>{c.projects} projects</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Star size={10} className="text-yellow-500 fill-yellow-500" />
                              {c.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-gray-900">{currency(c.amount)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Users size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No partners yet</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Reports;
