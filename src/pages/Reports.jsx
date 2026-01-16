import React, { useState, useMemo } from 'react';
import { Card, Button } from '../components/common';
import { DownloadCloud, TrendingUp, TrendingDown, DollarSign, Briefcase, CheckCircle, Star, Users, Calendar, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const mockSummary = {
  totalEarnings: 850230,
  earningsMonth: 45230,
  activeContracts: 5,
  completed: 28,
  rating: 4.8,
  trends: {
    earnings: 12.5,
    contracts: -2,
    completed: 8,
    rating: 0.2
  }
};

const mockEarningsSeries = Array.from({ length: 12 }).map((_, i) => ({
  label: `M-${i + 1}`,
  value: Math.round(Math.random() * 20000) + 2000,
}));

const mockCategories = [
  { name: 'Web Dev', value: 42000, icon: '💻', color: 'from-blue-500 to-blue-600' },
  { name: 'App Dev', value: 32000, icon: '📱', color: 'from-purple-500 to-purple-600' },
  { name: 'UI/UX', value: 21000, icon: '🎨', color: 'from-pink-500 to-pink-600' },
  { name: 'AI', value: 15000, icon: '🤖', color: 'from-green-500 to-green-600' },
  { name: 'Design', value: 9000, icon: '✨', color: 'from-orange-500 to-orange-600' },
];

const mockClients = [
  { id: 'cl1', name: 'Acme Corp', amount: 120000, projects: 6, rating: 4.9 },
  { id: 'cl2', name: 'Beta LLC', amount: 52000, projects: 3, rating: 4.7 },
  { id: 'cl3', name: 'Gamma Studio', amount: 24000, projects: 2, rating: 4.6 },
];

const mockTransactions = Array.from({ length: 23 }).map((_, i) => ({
  id: `t-${i + 1}`,
  date: `2025-11-${(i % 28) + 1}`,
  project: `Project ${i + 1}`,
  client: mockClients[i % mockClients.length].name,
  type: ['Milestone', 'Hourly', 'Bonus'][i % 3],
  status: ['Released', 'Pending', 'In Review'][i % 3],
  amount: (Math.round(Math.random() * 50000) + 2000),
}));

const currency = (v) => `₹${v.toLocaleString('en-IN')}`;

const EnhancedStatCard = ({ title, value, subtitle, trend, icon: Icon, gradient }) => (
  <div className="relative">
    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient} rounded-t-xl`} />
    <Card hover={false} className="p-5 shadow-md">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
          <Icon size={24} />
        </div>
        {trend !== undefined && (
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
    </Card>
  </div>
);

const Reports = () => {
  const [range, setRange] = useState('This month');
  const [projectType, setProjectType] = useState('All');
  const [page, setPage] = useState(1);
  const perPage = 8;

  const pages = Math.ceil(mockTransactions.length / perPage);

  const pageItems = useMemo(() => {
    const start = (page - 1) * perPage;
    return mockTransactions.slice(start, start + perPage);
  }, [page]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Released': return 'bg-green-50 text-green-700 border-green-200';
      case 'Pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'In Review': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-sm text-gray-600 mt-1">Track your earnings, performance, and client insights.</p>
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
                <option>Custom</option>
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

          <Button className="inline-flex items-center gap-2 shadow-md" variant="primary" onClick={() => {
            const rows = mockTransactions.map(t => ({
              Date: t.date,
              Project: t.project,
              Client: t.client,
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
          }}>
            <DownloadCloud size={16} /> Export CSV
          </Button>
        </div>

        {/* Enhanced Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <EnhancedStatCard
            title="Total Earnings"
            value={currency(mockSummary.totalEarnings)}
            trend={mockSummary.trends.earnings}
            icon={DollarSign}
            gradient="from-green-500 to-emerald-600"
          />
          <EnhancedStatCard
            title="This Month"
            value={currency(mockSummary.earningsMonth)}
            subtitle="Earnings"
            icon={TrendingUp}
            gradient="from-blue-500 to-blue-600"
          />
          <EnhancedStatCard
            title="Active Contracts"
            value={mockSummary.activeContracts}
            trend={mockSummary.trends.contracts}
            icon={Briefcase}
            gradient="from-purple-500 to-purple-600"
          />
          <EnhancedStatCard
            title="Completed"
            value={mockSummary.completed}
            trend={mockSummary.trends.completed}
            icon={CheckCircle}
            gradient="from-orange-500 to-orange-600"
          />
          <EnhancedStatCard
            title="Overall Rating"
            value={`${mockSummary.rating} ★`}
            trend={mockSummary.trends.rating}
            icon={Star}
            gradient="from-yellow-400 to-yellow-500"
          />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column (charts) */}
          <div className="lg:col-span-2 space-y-6">
            <Card hover={false} className="p-6 shadow-md border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Earnings Over Time</h3>
                <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">{range}</div>
              </div>

              {/* Enhanced area chart */}
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
                    points={`0,40 ${mockEarningsSeries.map((s, i) => `${(i / (mockEarningsSeries.length - 1)) * 100},${40 - (s.value / 60000) * 40}`).join(' ')} 100,40`}
                  />
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={mockEarningsSeries.map((s, i) => `${(i / (mockEarningsSeries.length - 1)) * 100},${40 - (s.value / 60000) * 40}`).join(' ')}
                  />
                </svg>
              </div>

              <div className="mt-8">
                <h4 className="text-sm font-bold mb-4 text-gray-900">Earnings by Category</h4>
                <div className="space-y-4">
                  {mockCategories.map((c) => {
                    const pct = Math.round((c.value / mockCategories.reduce((a, b) => a + b.value, 0)) * 100);
                    return (
                      <div key={c.name} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-lg">{c.icon}</div>
                        <div className="w-24 text-sm font-medium text-gray-700">{c.name}</div>
                        <div className="flex-1 bg-gray-100 h-4 rounded-full overflow-hidden">
                          <div className={`h-4 rounded-full bg-gradient-to-r ${c.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                        </div>
                        <div className="w-20 text-sm text-gray-600 text-right font-medium">{pct}%</div>
                        <div className="w-28 text-sm text-gray-900 text-right font-semibold">{currency(c.value)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Enhanced Transactions table */}
            <Card hover={false} className="p-0 overflow-hidden shadow-md border border-gray-100">
              <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Transactions & Payouts</h3>
                <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">{mockTransactions.length} items</div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Project</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {pageItems.map((t, idx) => (
                      <tr key={t.id} className="group">
                        <td className="px-6 py-4 text-sm text-gray-600">{t.date}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.project}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{t.client}</td>
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
                <div className="text-sm text-gray-600">Page {page} of {pages}</div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                  <Button variant="ghost" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}>Next</Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <Card hover={false} className="p-6 shadow-md border border-gray-100">
              <h3 className="text-lg font-bold mb-6 text-gray-900 flex items-center gap-2">
                <Star className="text-yellow-500" size={20} />
                Performance
              </h3>
              <div className="space-y-5">
                {[
                  { label: 'Rating trend', value: 80, color: 'bg-primary-500' },
                  { label: 'On-time delivery', value: 92, color: 'bg-green-500' },
                  { label: 'Revision rate', value: 18, color: 'bg-yellow-400' },
                  { label: 'Dispute rate', value: 6, color: 'bg-red-500' }
                ].map((metric) => (
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
            </Card>

            <Card hover={false} className="p-6 shadow-md border border-gray-100">
              <h3 className="text-lg font-bold mb-6 text-gray-900 flex items-center gap-2">
                <Users className="text-blue-500" size={20} />
                Top Clients
              </h3>
              <div className="space-y-4">
                {mockClients.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl group">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
                        {c.name.split(' ').map(s => s[0]).slice(0, 2).join('')}
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
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Reports;
