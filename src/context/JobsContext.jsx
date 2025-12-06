import React, { createContext, useContext, useState, useMemo } from 'react';

const JobsContext = createContext(null);

const sampleJobs = Array.from({ length: 24 }).map((_, i) => {
  const isHourly = i % 3 === 0;
  const urgent = i % 7 === 0;
  const recommended = i % 5 === 0;
  return {
    id: `job-${i + 1}`,
    title: (urgent ? 'Urgent: ' : '') + (recommended ? 'AI Recommended: ' : '') + `Frontend ${i + 1} Developer (React)`,
    desc: 'Looking for an experienced React developer to build responsive interfaces and work with a small team. Strong JS and Tailwind skills required.',
    skills: ['React', 'Tailwind', 'JavaScript', 'HTML', 'CSS'].slice(0, 5),
    moreSkills: 3,
    budgetType: isHourly ? 'Hourly' : 'Fixed',
    budget: isHourly ? { rate: 800 + (i % 5) * 50, estHours: 10 + (i % 20) } : { min: 10000 + (i * 500), max: 50000 + (i * 100) },
    client: {
      name: ['Acme Corp','Beta LLC','Gamma Studio'][i % 3],
      verified: i % 4 === 0,
      location: i % 2 === 0 ? 'India' : 'Remote',
    },
    posted: `${(i % 24) + 1} hours ago`,
    urgent,
    recommended,
    proposals: i % 12,
  };
});

export function JobsProvider({ children }) {
  const [jobs] = useState(sampleJobs);
  const [filters, setFilters] = useState({
    q: '',
    category: 'All',
    budgetType: 'All',
    level: 'All',
    location: 'All',
    sort: 'Newest',
  });

  const [wishlist, setWishlist] = useState(() => new Set());

  const toggleWishlist = (id) => {
    setWishlist((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  const filtered = useMemo(() => {
    const q = (filters.q || '').toLowerCase().trim();
    let res = jobs.filter((j) => {
      if (q) {
        return j.title.toLowerCase().includes(q) || j.desc.toLowerCase().includes(q) || j.skills.join(' ').toLowerCase().includes(q);
      }
      return true;
    });
    // simple sort
    if (filters.sort === 'Highest Pay') {
      res = res.slice().sort((a, b) => {
        const aVal = a.budgetType === 'Hourly' ? a.budget.rate * (a.budget.estHours || 1) : a.budget.max || a.budget.min;
        const bVal = b.budgetType === 'Hourly' ? b.budget.rate * (b.budget.estHours || 1) : b.budget.max || b.budget.min;
        return bVal - aVal;
      });
    }
    return res;
  }, [jobs, filters]);

  return (
    <JobsContext.Provider value={{ jobs: filtered, rawJobs: jobs, filters, setFilters, wishlist, toggleWishlist }}>
      {children}
    </JobsContext.Provider>
  );
}

export const useJobs = () => useContext(JobsContext);
