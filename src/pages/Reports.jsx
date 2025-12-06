import React, { useState, useMemo } from 'react';
import { Card, Button } from '../components/common';
import { DownloadCloud } from 'lucide-react';

const mockSummary = {
  totalEarnings: 850230,
  earningsMonth: 45230,
  activeContracts: 5,
  completed: 28,
  rating: 4.8,
};

const mockEarningsSeries = Array.from({ length: 12 }).map((_, i) => ({
  label: `M-${i + 1}`,
  value: Math.round(Math.random() * 20000) + 2000,
}));

const mockCategories = [
  { name: 'Web Dev', value: 42000 },
  { name: 'App Dev', value: 32000 },
  { name: 'UI/UX', value: 21000 },
  { name: 'AI', value: 15000 },
  { name: 'Design', value: 9000 },
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

const StatCard = ({ title, value, subtitle }) => (
  <Card className="p-4">
    <div className="text-sm text-gray-500">{title}</div>
    <div className="text-2xl font-bold text-gray-900 mt-2">{value}</div>
    {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
  </Card>
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

  return (
    <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-600 mt-1">Track your earnings, performance, and client insights.</p>
        </header>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">Date range</label>
              <select
                className="px-3 py-2 rounded-md border bg-white text-sm"
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
              <label className="text-sm text-gray-500">Project type</label>
              <select
                className="px-3 py-2 rounded-md border bg-white text-sm"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
              >
                <option>All</option>
                <option>Fixed price</option>
                <option>Hourly</option>
              </select>
            </div>
          </div>

          <div className="ml-auto">
              <Button className="inline-flex items-center gap-2" variant="outline" onClick={() => {
                // export current transactions (all for now)
                const rows = mockTransactions.map(t => ({
                  Date: t.date,
                  Project: t.project,
                  Client: t.client,
                  Type: t.type,
                  Status: t.status,
                  Amount: t.amount,
                }));
                const csv = [Object.keys(rows[0]).join(',')]
                  .concat(rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')))
                  .join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `xlance-reports-${new Date().toISOString().slice(0,10)}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              }}>
                <DownloadCloud size={16} /> Export CSV
              </Button>
            </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard title="Total Earnings" value={currency(mockSummary.totalEarnings)} />
          <StatCard title="Earnings this month" value={currency(mockSummary.earningsMonth)} />
          <StatCard title="Active Contracts" value={mockSummary.activeContracts} />
          <StatCard title="Projects Completed" value={mockSummary.completed} />
          <StatCard title="Overall Rating" value={`${mockSummary.rating} ★`} />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column (charts) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Earnings Over Time</h3>
                <div className="text-sm text-gray-500">{range}</div>
              </div>

              {/* Simple sparkline / area chart placeholder */}
              <div className="w-full h-48 bg-white rounded-lg p-4 border border-gray-100">
                <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    points={mockEarningsSeries.map((s, i) => `${(i / (mockEarningsSeries.length - 1)) * 100},${40 - (s.value / 60000) * 40}`).join(' ')}
                  />
                </svg>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Earnings by Category</h4>
                <div className="space-y-3">
                  {mockCategories.map((c) => {
                    const pct = Math.round((c.value / mockCategories.reduce((a, b) => a + b.value, 0)) * 100);
                    return (
                      <div key={c.name} className="flex items-center gap-3">
                        <div className="w-28 text-sm text-gray-700">{c.name}</div>
                        <div className="flex-1 bg-gray-100 h-3 rounded overflow-hidden">
                          <div className="h-3 rounded bg-primary-500" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="w-24 text-sm text-gray-600 text-right">{currency(c.value)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Transactions table */}
            <Card className="p-0 overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">Transactions & Payouts</h3>
                <div className="text-sm text-gray-500">Showing {mockTransactions.length} items</div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-sm text-gray-500">Date</th>
                      <th className="px-4 py-3 text-sm text-gray-500">Project</th>
                      <th className="px-4 py-3 text-sm text-gray-500">Client</th>
                      <th className="px-4 py-3 text-sm text-gray-500">Type</th>
                      <th className="px-4 py-3 text-sm text-gray-500">Status</th>
                      <th className="px-4 py-3 text-sm text-gray-500 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {pageItems.map((t) => (
                      <tr key={t.id} className="border-t">
                        <td className="px-4 py-3 text-sm text-gray-700">{t.date}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{t.project}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{t.client}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{t.type}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{t.status}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-right">{currency(t.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t flex items-center justify-between">
                <div className="text-sm text-gray-600">Page {page} of {pages}</div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
                  <Button variant="ghost" onClick={() => setPage((p) => Math.min(pages, p + 1))}>Next</Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3">Performance</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">Rating trend</div>
                  <div className="w-full bg-gray-100 h-2 rounded overflow-hidden">
                    <div className="h-2 bg-primary-500" style={{ width: '80%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">On-time delivery</div>
                  <div className="w-full bg-gray-100 h-2 rounded overflow-hidden">
                    <div className="h-2 bg-green-500" style={{ width: '92%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">Revision rate</div>
                  <div className="w-full bg-gray-100 h-2 rounded overflow-hidden">
                    <div className="h-2 bg-yellow-400" style={{ width: '18%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">Dispute rate</div>
                  <div className="w-full bg-gray-100 h-2 rounded overflow-hidden">
                    <div className="h-2 bg-red-500" style={{ width: '6%' }} />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3">Top Clients</h3>
              <div className="space-y-3">
                {mockClients.map((c) => (
                  <div key={c.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">{c.name.split(' ').map(s => s[0]).slice(0,2).join('')}</div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{c.name}</div>
                        <div className="text-xs text-gray-500">{c.projects} projects</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">{currency(c.amount)}</div>
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
