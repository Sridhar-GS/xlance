import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useJobs } from '../context/JobsContext';
import { Card, Button } from '../components/common';
import PageTransition from '../components/common/PageTransition';
import { Heart, Search, ChevronDown, MapPin, Clock, Users, X } from 'lucide-react';

const SUGGESTED_TAGS = ['React', 'UI/UX', 'Python', 'AI', 'Figma', 'Node.js', 'Marketing', 'Data Science'];

const FILTER_OPTIONS = {
  category: ['All', 'Development', 'Design', 'Marketing', 'Writing'],
  level: ['All', 'Beginner', 'Intermediate', 'Expert'],
  budgetType: ['All', 'Under ₹10K', '₹10K - ₹50K', '₹50K - ₹1L', 'Above ₹1L'],
  location: ['All', 'Remote', 'India', 'Bangalore', 'Mumbai', 'Delhi'],
};

function JobCard({ job, wishlist, onToggleWishlist }) {
  const wished = wishlist.has(job.id);
  const budgetText =
    job.budgetType === 'Hourly'
      ? `₹${job.budget.rate}/hr (~₹${(job.budget.rate * (job.budget.estHours || 40)).toLocaleString()})`
      : `₹${job.budget.min.toLocaleString()} – ₹${job.budget.max.toLocaleString()}`;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Card className="p-6 relative hover:shadow-lg">
        {job.recommended && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
            🤖 AI Recommended
          </div>
        )}

        <button
          onClick={() => onToggleWishlist(job.id)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="Save job"
        >
          <Heart size={18} className={wished ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
        </button>

        <div className={job.recommended ? 'mt-6' : ''}>
          <div className="flex items-start justify-between mb-2 pr-10">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 hover:text-primary-600 cursor-pointer transition">
                {job.title}
              </h3>
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                <span className="font-medium text-gray-800">{job.client.name}</span>
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {job.client.location}
                </span>
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-sm mt-3 line-clamp-2">{job.desc}</p>

          <div className="flex flex-wrap gap-2 mt-4">
            {job.skills.slice(0, 5).map((skill) => (
              <span key={skill} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-medium">
                {skill}
              </span>
            ))}
            {job.moreSkills > 0 && (
              <span className="text-gray-500 text-xs font-semibold px-2 py-1">+{job.moreSkills}</span>
            )}
          </div>

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {job.posted}
              </span>
              <span className="flex items-center gap-1">
                <Users size={14} />
                {job.proposals} proposals
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">{budgetText}</div>
              <Button size="sm" className="mt-2">View Details</Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function FindWorkPage() {
  const { jobs, filters, setFilters, toggleWishlist, wishlist } = useJobs();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 12;

  const displayJobs = useMemo(() => jobs.slice((page - 1) * perPage, page * perPage), [jobs, page]);
  const totalPages = Math.ceil(jobs.length / perPage);

  const handleTagClick = (tag) => {
    setFilters((prev) => ({
      ...prev,
      q: prev.q ? `${prev.q} ${tag}` : tag,
    }));
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters((prev) => ({ ...prev, [filterKey]: value }));
    setOpenDropdown(null);
  };

  const toggleRemote = () => {
    setFilters((prev) => ({ ...prev, remoteOnly: !prev.remoteOnly }));
  };

  const resetFilters = () => {
    setFilters({
      q: '',
      category: 'All',
      budgetType: 'All',
      level: 'All',
      location: 'All',
      remoteOnly: false,
      sort: 'Newest',
    });
    setPage(1);
  };

  const hasActiveFilters = filters.category !== 'All' || filters.level !== 'All' || filters.budgetType !== 'All' || filters.location !== 'All' || filters.remoteOnly || filters.q;

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.filter-dropdown')) {
        setOpenDropdown(null);
      }
    };
    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  return (
    <PageTransition>
      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-gray-50/30">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900">Find Work</h1>
            <p className="text-gray-600 text-lg mt-2">Browse curated jobs that match your skills and interests.</p>
          </div>

          {/* Search & Filters */}
          <Card className="p-5 mb-8 glass-effect">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={filters.q}
                  onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
                  placeholder="Search jobs or keywords…"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>

              <div className="hidden sm:flex gap-2">
                {Object.entries(FILTER_OPTIONS).map(([key, options]) => (
                  <div key={key} className="relative filter-dropdown">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === key ? null : key)}
                      className="flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-300 transition whitespace-nowrap"
                    >
                      {filters[key] !== 'All' ? filters[key] : key.charAt(0).toUpperCase() + key.slice(1)}
                      <ChevronDown size={16} />
                    </button>
                    {openDropdown === key && (
                      <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 min-w-[160px]">
                        {options.map((option) => (
                          <button
                            key={option}
                            onClick={() => handleFilterChange(key, option)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${
                              filters[key] === option ? 'text-primary-600 font-semibold' : 'text-gray-700'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.remoteOnly}
                  onChange={toggleRemote}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Remote Only</span>
              </label>
            </div>
          </Card>

          {/* Suggested Tags */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">Suggested skills:</p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1"
                >
                  <X size={14} />
                  Clear filters
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:border-primary-300 hover:text-primary-600 transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Job Listings */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Available Jobs
                <span className="text-gray-500 font-normal ml-2">({jobs.length})</span>
              </h2>
              <select
                value={filters.sort}
                onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
                className="text-sm px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="Newest">Newest First</option>
                <option value="Highest Pay">Highest Pay</option>
              </select>
            </div>

            <div className="space-y-4">
              {displayJobs.length > 0 ? (
                displayJobs.map((job, idx) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    wishlist={wishlist}
                    onToggleWishlist={toggleWishlist}
                  />
                ))
              ) : (
                <Card className="p-12 text-center glass-effect">
                  <h3 className="text-lg font-semibold text-gray-900">No jobs found</h3>
                  <p className="text-gray-600 mt-2">Try adjusting your filters or search keywords.</p>
                </Card>
              )}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{(page - 1) * perPage + 1}</span> –{' '}
                <span className="font-semibold text-gray-900">{Math.min(page * perPage, jobs.length)}</span> of{' '}
                <span className="font-semibold text-gray-900">{jobs.length}</span> jobs
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ← Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next →
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </PageTransition>
  );
}
