import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Filter, X } from 'lucide-react'; // Import Trending icon
import { motion, AnimatePresence } from 'framer-motion';
import { useJobs } from '../context/JobsContext';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/jobService';
import PageTransition from '../components/common/PageTransition';
import JobCard from '../components/jobs/JobCard';
import JobFilterSidebar from '../components/jobs/JobFilterSidebar';
import JobSearchHeader from '../components/jobs/JobSearchHeader';

import JobDetailsDrawer from '../components/jobs/JobDetailsDrawer';

export default function FindWorkPage() {
  const { jobs, loading } = useJobs();
  const { user } = useAuth();
  const [selectedJob, setSelectedJob] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleJobClick = (job) => {
    setSelectedJob(job);
    // Increment view logic (frontend trigger)
    // Relaxed rules allow public update, so just check ownership if logged in
    if (!user || user.uid !== job.clientId) {
      jobService.incrementJobView(job.id);
    }
  };

  // Compute dynamic filter counts
  const jobCounts = useMemo(() => {
    const counts = {
      category: {},
      jobType: {},
      level: {},
      duration: {}
    };

    jobs.forEach(job => {
      // Category
      if (job.category) {
        counts.category[job.category] = (counts.category[job.category] || 0) + 1;
        // Also normalization if needed, but assuming exact match with Sidebar labels for now
      }

      // Job Type (budgetType)
      if (job.budgetType) {
        const type = job.budgetType.toLowerCase();
        // Map 'fixed' -> 'fixed-price' to match sidebar key expectations if any
        const key = type === 'fixed' ? 'fixed-price' : type;
        counts.jobType[key] = (counts.jobType[key] || 0) + 1;
      }

      // Experience Level
      if (job.experienceLevel) {
        const lvl = job.experienceLevel.toLowerCase();
        let key = lvl;
        if (lvl.includes('entry')) key = 'entry';
        else if (lvl.includes('intermediate')) key = 'intermediate';
        else if (lvl.includes('expert')) key = 'expert';
        counts.level[key] = (counts.level[key] || 0) + 1;
      }

      // Duration
      if (job.duration) {
        const d = job.duration.toLowerCase();
        let key = null;
        if (d.includes('<') || d.includes('less') || d.includes('under')) key = 'less_1_month';
        else if (d.includes('1 to 3')) key = '1_3_months';
        else if (d.includes('3 to 6')) key = '3_6_months';
        else if (d.includes('> 6') || d.includes('more')) key = 'more_6_months';

        if (key) counts.duration[key] = (counts.duration[key] || 0) + 1;
      }
    });

    return counts;
  }, [jobs]);

  return (
    <PageTransition>
      <main className="min-h-screen bg-gray-50 pt-[0px]"> {/* Reset pt since Navbar is fixed and Search Header is sticky */}
        <div className="h-[110px]" /> {/* Spacer for Navbar (Floating Nav is ~80px-90px total space) */}

        {/* Compact Utility Search Header */}
        <JobSearchHeader />

        {/* Mobile Filter Toggle */}
        <button
          className="lg:hidden fixed bottom-6 right-6 z-40 bg-primary-600 text-white px-5 py-3 rounded-full shadow-xl shadow-primary-600/30 flex items-center gap-2 font-bold hover:scale-105 transition-transform"
          onClick={() => setShowMobileFilters(true)}
        >
          <Filter size={20} /> Filters
        </button>

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {showMobileFilters && (
            <div className="fixed inset-0 z-[100] lg:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowMobileFilters(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute right-0 top-0 h-full w-[300px] bg-white shadow-2xl overflow-y-auto p-6"
              >
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">Filters</h2>
                  <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-colors">
                    <X size={24} />
                  </button>
                </div>
                <JobFilterSidebar counts={jobCounts} />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="max-w-[95%] xl:max-w-7xl mx-auto px-3 sm:px-5 py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Left Sidebar - Filters */}
            <div className="w-full lg:w-1/4 hidden lg:block">
              <JobFilterSidebar counts={jobCounts} />
            </div>

            {/* Right Content - Job Feed */}
            <div className="w-full lg:w-3/4">

              {/* Trending Section - Moved Here */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 text-gray-900 font-semibold min-w-fit">
                  <TrendingUp size={20} className="text-primary-600" />
                  <span>Trending Now:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['React Native', 'UI/UX Design', 'Content Strategy', 'SEO Expert', 'Python'].map(tag => (
                    <button key={tag} className="text-sm bg-gray-50 hover:bg-white border border-transparent hover:border-gray-300 text-gray-600 hover:text-primary-600 px-3 py-1 rounded-md transition-all whitespace-nowrap">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Jobs you might like
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <select className="text-sm font-semibold text-gray-900 bg-transparent border-none focus:ring-0 cursor-pointer">
                    <option>Best Match</option>
                    <option>Newest</option>
                    <option>Highest Paid</option>
                  </select>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                <button className="px-4 py-2 border-b-2 border-primary-600 text-primary-600 font-semibold text-sm whitespace-nowrap">Best Matches</button>
                <button className="px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm whitespace-nowrap">Most Recent</button>
                <button className="px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm whitespace-nowrap">Saved Jobs</button>
              </div>

              {/* Job List */}
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onClick={() => handleJobClick(job)}
                  />
                ))}
              </div>

              <div className="mt-8 flex justify-center">
                <button className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors shadow-sm">
                  Load more jobs
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Job Details Slide-over Drawer */}
        <JobDetailsDrawer
          job={selectedJob}
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      </main>
    </PageTransition>
  );
}
