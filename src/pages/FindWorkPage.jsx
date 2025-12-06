import React, { useState } from 'react';
import { useJobs } from '../context/JobsContext';
import Button from '../components/common/Button';
import { Heart, Bookmark } from 'lucide-react';

function SkillTag({ name }) {
  return (
    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md mr-2">{name}</span>
  );
}

function JobCard({ job, onToggleWishlist, wished }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{job.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{job.client.name} • {job.client.location}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-700">{job.budgetType === 'Hourly' ? `₹${job.budget.rate}/hr` : `₹${job.budget.min.toLocaleString()} - ₹${job.budget.max.toLocaleString()}`}</div>
          <button className="p-2 rounded-md hover:bg-gray-50" onClick={() => onToggleWishlist(job.id)} aria-label="Wishlist">
            <Heart size={16} className={wished ? 'text-red-500' : 'text-gray-400'} />
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">{job.desc}</p>
      <div className="mt-3 flex flex-wrap items-center">
        {job.skills.slice(0, 4).map((s) => <SkillTag key={s} name={s} />)}
        {job.moreSkills ? <span className="text-xs text-gray-500">+{job.moreSkills} more</span> : null}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-gray-500">{job.posted} • {job.proposals} proposals</div>
        <Button onClick={() => {}} size="sm">View</Button>
      </div>
    </div>
  );
}

function FilterBar() {
  const { filters, setFilters } = useJobs();
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-md p-3">
      <div className="flex items-center space-x-2">
        <input
          value={filters.q}
          onChange={(e) => setFilters((s) => ({ ...s, q: e.target.value }))}
          className="flex-1 bg-gray-50 dark:bg-slate-800 px-3 py-2 rounded-md"
          placeholder="Search jobs, skills or clients"
        />
        <select value={filters.sort} onChange={(e) => setFilters((s) => ({ ...s, sort: e.target.value }))} className="bg-gray-50 dark:bg-slate-800 px-2 py-2 rounded-md">
          <option>Newest</option>
          <option>Highest Pay</option>
        </select>
      </div>
    </div>
  );
}

export default function FindWorkPage() {
  const { jobs, toggleWishlist, wishlist } = useJobs();
  const [page, setPage] = useState(1);
  const perPage = 8;

  const pageJobs = jobs.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Find Work</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Browse curated jobs and opportunities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <FilterBar />
          <div className="mt-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-md p-3">
            <h4 className="text-sm font-semibold mb-2">Saved searches</h4>
            <div className="text-sm text-gray-500">No saved searches yet.</div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="space-y-4">
            {pageJobs.map((j) => (
              <JobCard key={j.id} job={j} onToggleWishlist={toggleWishlist} wished={wishlist.has(j.id)} />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">Showing {(page - 1) * perPage + 1} - {Math.min(page * perPage, jobs.length)} of {jobs.length} jobs</div>
            <div className="space-x-2">
              <Button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} size="sm">Prev</Button>
              <Button disabled={page * perPage >= jobs.length} onClick={() => setPage((p) => p + 1)} size="sm">Next</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
