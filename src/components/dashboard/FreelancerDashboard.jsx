import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button } from '../common';
import PageTransition from '../common/PageTransition';
import { useAuth } from '../../context/AuthContext';
import { proposalService } from '../../services/proposalService';
import { jobService } from '../../services/jobService';
import { notificationService } from '../../services/notificationService';
import { Link, useLocation } from 'react-router-dom';
import {
  TrendingUp,
  Briefcase,
  FileText,
  ChevronRight,
  Clock,
  IndianRupee,
  Zap,
  Target,
  UserCheck,
  Layout,
  Search,
  CheckCircle
} from 'lucide-react';
import { mockJobs } from '../../utils/mockData';

const StatCard = ({ title, value, subValue, trend, icon: Icon, colorClass, to, onClick }) => {
  const iconColorClass = typeof colorClass === 'string' ? colorClass.replace('bg-', 'text-') : '';

  const content = (
    <div className="flex justify-between items-start relative z-10 w-full">
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">{value}</h3>
        {subValue && (
          <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold">
            {trend ? <span className="text-emerald-600 flex items-center bg-emerald-50 px-1.5 py-0.5 rounded"><TrendingUp size={10} className="mr-0.5" /> {trend}%</span> : null}
            <span className="text-gray-400 uppercase">{subValue}</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 transition-colors group-hover:bg-opacity-20`}>
        <Icon size={22} className={iconColorClass} />
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block w-full">
        <Card variant="solid" hover={true} className="p-6 relative overflow-hidden group border-none h-full">
          <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 transition-transform group-hover:scale-150 duration-700 ${colorClass}`} />
          {content}
          <div className="absolute bottom-2 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight size={14} className="text-gray-300" />
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <button onClick={onClick} className="block w-full text-left">
      <Card variant="solid" hover={true} className="p-6 relative overflow-hidden group border-none h-full">
        <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 transition-transform group-hover:scale-150 duration-700 ${colorClass}`} />
        {content}
      </Card>
    </button>
  );
};

const FreelancerDashboard = () => {
  const { userProfile, user } = useAuth();
  const location = useLocation();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showConnectsHistory, setShowConnectsHistory] = useState(false);
  const [showEliteBreakdown, setShowEliteBreakdown] = useState(false);

  // Get real connects data from user profile
  const connectsBalance = userProfile?.connects?.available || 50;
  const connectsHistory = userProfile?.connects?.history || [
    { id: 1, type: 'earned', amount: 50, reason: 'Welcome Starter Pack', date: 'Today' }
  ];

  // Calculate next refill date (monthly)
  const getNextRefillDate = () => {
    const lastRefill = userProfile?.connects?.lastRefillDate ? new Date(userProfile.connects.lastRefillDate) : new Date();
    const nextRefill = new Date(lastRefill);
    nextRefill.setMonth(nextRefill.getMonth() + 1);
    const daysUntilRefill = Math.ceil((nextRefill - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilRefill > 0 ? daysUntilRefill : 0;
  };

  const daysUntilRefill = getNextRefillDate();

  const eliteMetrics = [
    { label: 'Job Success', value: '98%', icon: CheckCircle, color: 'text-emerald-500' },
    { label: 'On-Time Delivery', value: '100%', icon: Clock, color: 'text-blue-500' },
    { label: 'Communication', value: '4.9/5', icon: UserCheck, color: 'text-purple-500' },
  ];

  // Handle New Freelancer Welcome - Open Connects Drawer
  useEffect(() => {
    if (location.state?.newFreelancer) {
      setShowConnectsHistory(true);
      // Optional: Clear state to prevent reopening on refresh (if desired, but location state persists usually)
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  // Check for Monthly Connects Notification
  useEffect(() => {
    if (user?.uid && daysUntilRefill === 0) {
      const key = `notified_refill_${new Date().toDateString()}`;
      if (!sessionStorage.getItem(key)) {
        notificationService.addNotification(
          user.uid,
          'success',
          'Connects Refilled',
          'Your monthly connects have been refilled. Happy freelancing!',
          null,
          { type: 'system' }
        );
        sessionStorage.setItem(key, 'true');
      }
    }
  }, [user, daysUntilRefill]);

  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setJobsLoading(true);
      try {
        const allJobs = await jobService.getOpenJobs();
        const userSkillsArray = Array.isArray(userProfile?.skills) ? userProfile.skills : [];

        if (userSkillsArray.length === 0) {
          setRecommendedJobs(allJobs.slice(0, 3));
          return;
        }

        const userSkills = userSkillsArray.map(s => String(s).toLowerCase());

        const matched = allJobs.map(job => {
          const jobSkills = Array.isArray(job.skills) ? job.skills : [];
          const matchCount = jobSkills.filter(skill => userSkills.includes(String(skill).toLowerCase())).length;
          return { ...job, matchScore: matchCount };
        })
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 3);

        setRecommendedJobs(matched);
      } catch (error) {
        console.error("Error fetching recommended jobs:", error);
      } finally {
        setJobsLoading(false);
      }
    };

    if (userProfile) {
      fetchJobs();
    }
  }, [userProfile]);

  useEffect(() => {
    const fetchProposals = async () => {
      if (user?.uid) {
        try {
          const data = await proposalService.getProposalsByFreelancer(user.uid);
          setProposals(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Error fetching proposals:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchProposals();
  }, [user]);

  const getStatusColor = (status) => {
    const s = String(status || '').toLowerCase();
    switch (s) {
      case 'accepted': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'rejected': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  const activeProposalsCount = (proposals || []).filter(p => !p.status || String(p.status).toLowerCase() === 'pending').length;

  return (
    <PageTransition>
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen relative overflow-hidden">
        {/* Premium Background Elements */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-100/30 rounded-full blur-[120px] -z-10 animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-100/20 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto relative">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <div className="flex items-center gap-2 text-primary-600 font-bold text-xs uppercase tracking-[0.2em] mb-3">
                <div className="w-8 h-[2px] bg-primary-600" />
                <span>Operational Control</span>
              </div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-2">
                {greeting}, <span className="text-primary-600">{userProfile?.name?.split(' ')[0] || 'Freelancer'}</span>
              </h1>
              <p className="text-gray-500 font-medium">Here's what's happening with your business today.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/find-work">
                <Button variant="outline" className="bg-white/50 backdrop-blur-md border-white/50 shadow-sm px-6 py-6 h-auto">
                  <Search size={18} className="mr-2" /> Find New Work
                </Button>
              </Link>
              <Link to="/projects">
                <Button className="shadow-lg shadow-primary-500/20 px-6 py-6 h-auto">
                  <Briefcase size={18} className="mr-2" /> My Portfolio
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard
              title="Active Proposals"
              value={activeProposalsCount}
              subValue="Awaiting response"
              icon={FileText}
              colorClass="bg-blue-500"
              to="/reports"
            />
            <StatCard
              title="Active Contracts"
              value="2"
              subValue="In progress"
              icon={Briefcase}
              colorClass="bg-emerald-500"
              to="/projects"
            />
            <StatCard
              title="Available Connects"
              value={connectsBalance}
              subValue={`Refill in ${daysUntilRefill} days`}
              icon={Target}
              colorClass="bg-purple-500"
              onClick={() => setShowConnectsHistory(true)}
            />

            <div className="relative group perspective-1000">
              <button onClick={() => setShowEliteBreakdown(!showEliteBreakdown)} className="w-full h-full text-left outline-none">
                <Card variant="solid" hover={true} className="p-6 relative overflow-hidden h-full border-none bg-white shadow-xl shadow-amber-500/5 group-hover:shadow-amber-500/10 transition-all duration-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-amber-500/20 transition-all duration-700" />
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-4">Elite Standing</p>
                      <div className="flex items-end gap-2 mb-1">
                        <h3 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">95%</h3>
                        <span className="text-xs font-bold text-amber-600 uppercase mb-1 tracking-widest">Strength</span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium mb-6">Excellent performance tier</p>

                      {/* Compact sleek progress bar */}
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '95%' }}
                          transition={{ duration: 1.5, ease: "circOut" }}
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                        />
                      </div>
                    </div>
                    <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <UserCheck size={28} />
                    </div>
                  </div>

                  {/* Elite Popover Overlay */}
                  <AnimatePresence>
                    {showEliteBreakdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm p-4 flex flex-col justify-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-black uppercase text-gray-400">Metric Breakthrough</span>
                          <button onClick={() => setShowEliteBreakdown(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                            <TrendingUp size={12} className="rotate-45" />
                          </button>
                        </div>
                        <div className="space-y-3">
                          {eliteMetrics.map((m, i) => {
                            const MIcon = m.icon;
                            return (
                              <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <MIcon size={14} className={m.color} />
                                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">{m.label}</span>
                                </div>
                                <span className="text-xs font-black text-gray-900">{m.value}</span>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </button>
            </div>
          </div>

          {/* Connects History Drawer */}
          <AnimatePresence>
            {showConnectsHistory && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowConnectsHistory(false)}
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                />
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl z-[101] flex flex-col"
                >
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <Target size={20} className="text-purple-600" /> Connects Ledger
                      </h2>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Application Token History</p>
                    </div>
                    <button onClick={() => setShowConnectsHistory(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                      <TrendingUp size={20} className="rotate-45" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="p-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-[2.5rem] text-white mb-8 shadow-xl shadow-purple-500/20 relative overflow-hidden">
                      <Target size={120} className="absolute -right-8 -bottom-8 opacity-10" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-2">Available Pool</p>
                      <h3 className="text-6xl font-black tracking-tighter mb-4">{connectsBalance} <span className="text-xl opacity-60">Connects</span></h3>
                      <div className="flex items-center gap-2 text-[10px] bg-white/10 w-fit px-3 py-1.5 rounded-full font-bold">
                        <Clock size={12} /> Refilling in {daysUntilRefill} days
                      </div>
                    </div>

                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Recent Activity</h3>
                    <div className="space-y-3">
                      {connectsHistory.map((item) => (
                        <div key={item.id} className="p-4 rounded-3xl border border-gray-50 bg-gray-50/50 flex justify-between items-center group hover:bg-white hover:border-purple-100 transition-all">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${item.type === 'spent' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                              {item.type === 'spent' ? <TrendingUp size={16} className="rotate-45" /> : <TrendingUp size={16} />}
                            </div>
                            <div>
                              <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight">{item.reason}</p>
                              <p className="text-[9px] text-gray-400 font-bold uppercase">
                                {new Date(item.date).toLocaleDateString('en-GB').replace(/\//g, '-')}
                              </p>
                            </div>
                          </div>
                          <div className={`text-sm font-black ${item.type === 'spent' ? 'text-gray-900' : 'text-emerald-600'}`}>
                            {item.type === 'spent' ? '-' : '+'}{item.amount}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                    <Button variant="neon-primary" className="w-full py-6 rounded-2xl shadow-lg shadow-primary-500/20">
                      Buy More Connects
                    </Button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Smart Recommendations Section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Zap size={20} className="text-amber-500 fill-amber-500" />
                    Recommended for You
                  </h2>
                  <Link to="/find-work" className="text-sm font-semibold text-primary-600 hover:text-primary-700">View all matches</Link>
                </div>

                {jobsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2].map(i => (
                      <div key={i} className="h-64 rounded-2xl bg-white border border-gray-100 p-6 animate-pulse">
                        <div className="h-6 w-24 bg-gray-200 rounded-lg mb-4"></div>
                        <div className="h-8 w-3/4 bg-gray-200 rounded-lg mb-4"></div>
                        <div className="flex gap-2">
                          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recommendedJobs.length === 0 ? (
                  <div className="p-8 bg-white border border-gray-100 rounded-2xl text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No jobs available</h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">There are currently no open jobs in the marketplace. Check back soon!</p>
                    <Link to="/find-work">
                      <Button>Browse All Jobs</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Fallback Message for No Exact Matches */}
                    {(recommendedJobs[0]?.matchScore || 0) === 0 && (
                      <div className="col-span-full mb-2 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3 text-sm text-amber-800 animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="p-1 bg-amber-100 rounded-full shrink-0">
                          <Zap size={14} className="text-amber-600 fill-amber-600" />
                        </div>
                        <div>
                          <p className="font-bold">No exact matches found yet.</p>
                          <p className="text-amber-700/80">We couldn't find any new jobs matching your specific skills. Here are the latest openings in the marketplace:</p>
                        </div>
                      </div>
                    )}

                    {recommendedJobs.map((job) => (
                      <Card key={job.id} variant="glass-light" hover={true} className="p-6 flex flex-col justify-between h-full">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg tracking-[0.1em] border ${(job.matchScore || 0) > 0
                              ? 'bg-primary-500/10 text-primary-700 border-primary-500/10'
                              : 'bg-gray-100 text-gray-500 border-gray-200'
                              }`}>
                              {(job.matchScore || 0) > 0 ? 'Smart Match' : 'New Job'}
                            </span>
                            <span className="text-sm font-black text-gray-900 tracking-tight">
                              {job.budgetType === 'hourly' && job.budget?.min !== undefined
                                ? `₹${job.budget.min.toLocaleString()}-${job.budget.max.toLocaleString()}/hr`
                                : job.budget?.fixed !== undefined
                                  ? `₹${job.budget.fixed.toLocaleString()}`
                                  : job.budget !== undefined && typeof job.budget === 'number'
                                    ? `₹${job.budget.toLocaleString()}`
                                    : 'Budget N/A'}
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-900 mb-3 text-lg leading-tight">{job.title}</h3>
                          <div className="flex flex-wrap gap-2 mb-6">
                            {(Array.isArray(job.skills) ? job.skills : []).slice(0, 3).map(skill => (
                              <span key={skill} className="text-[10px] bg-white/40 text-gray-600 px-2.5 py-1 rounded-full font-bold border border-white/60">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Link to={`/jobs/${job.id}`}>
                          <Button variant="outline" size="sm" className="w-full text-xs h-10 rounded-xl border-gray-200 bg-white/40 text-gray-900 hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all font-bold shadow-sm">View & Apply</Button>
                        </Link>
                      </Card>
                    ))}
                  </div>
                )}
              </section>

              {/* Recent Activity Section */}
              <section className="mt-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Clock size={24} className="text-primary-600" />
                    </div>
                    Live Applications
                  </h2>
                </div>
                <Card variant="solid" hover={false} className="border-none shadow-xl shadow-gray-200/50 overflow-hidden bg-white">
                  <div className="divide-y divide-gray-50">
                    {loading ? (
                      <div className="p-20 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Syncing Pipeline...</p>
                      </div>
                    ) : (proposals || []).length === 0 ? (
                      <div className="p-20 text-center text-gray-400 font-medium">No active applications currently.</div>
                    ) : (
                      proposals.map((proposal) => (
                        <div key={proposal.id} className="p-6 hover:bg-gray-50 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-colors duration-500">
                              <FileText size={22} />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{proposal.jobTitle || "Job Application"}</h4>
                              <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500 font-bold uppercase tracking-wider">
                                <span className="flex items-center gap-1.5"><IndianRupee size={14} className="text-emerald-500" /> ₹{(proposal.bidAmount || 0).toLocaleString()}</span>
                                <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                                <span className="flex items-center gap-1.5"><Clock size={14} /> {proposal.createdAt?.seconds ? new Date(proposal.createdAt.seconds * 1000).toLocaleDateString() : 'Today'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-full border shadow-sm ${getStatusColor(proposal.status)}`}>
                              {proposal.status || "Pending"}
                            </span>
                            <Link to={`/jobs/${proposal.jobId}`}>
                              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-all">
                                <ChevronRight size={20} />
                              </button>
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </section>
            </div>

            {/* Side Column */}
            <div className="space-y-6">
              {/* Wallet Summary */}
              <Card variant="glass-dark" hover={false} className="p-8 border-none overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary-600/20 rounded-full -mr-20 -mt-20 blur-3xl" />
                <h3 className="text-[10px] font-black text-primary-400 mb-8 uppercase tracking-[0.25em] relative z-10">Wallet Summary</h3>
                <div className="space-y-8 relative z-10">
                  <div>
                    <p className="text-xs text-white/60 font-medium mb-1 uppercase tracking-wider">Total Available</p>
                    <p className="text-4xl font-black tracking-tighter text-white">₹12,450</p>
                  </div>
                  <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                    <span className="text-white/60 text-xs font-bold uppercase tracking-widest">In Escrow</span>
                    <span className="font-black text-amber-500 text-lg">₹45,230</span>
                  </div>
                  <Link to="/reports">
                    <Button className="w-full text-black bg-primary hover:bg-primary-50 h-12 font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] border-none">
                      Detailed Reports <ChevronRight size={18} className="ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Roadmap */}
              <Card variant="solid" hover={false} className="p-8 border-none bg-white">
                <h3 className="text-sm font-black text-gray-900 mb-8 flex items-center gap-3 uppercase tracking-widest">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CheckCircle size={18} className="text-emerald-600" />
                  </div>
                  Work Roadmap
                </h3>
                <div className="space-y-8 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                  <div className="flex gap-6 relative">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full border-4 border-white shadow-lg z-10 flex-shrink-0" />
                    <div className="pt-0.5">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Today</p>
                      <p className="text-sm font-bold text-gray-900 uppercase">Frontend Delivery</p>
                      <p className="text-xs text-gray-500 mt-1 font-medium">Project: FinTech App</p>
                    </div>
                  </div>
                  <div className="flex gap-6 relative text-opacity-50">
                    <div className="w-8 h-8 bg-white border-4 border-gray-100 rounded-full z-10 flex-shrink-0" />
                    <div className="pt-0.5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tomorrow</p>
                      <p className="text-sm font-bold text-gray-400 uppercase">Discovery Call</p>
                      <p className="text-xs text-gray-400 mt-1 font-medium">Project: Minimalist Logo</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default FreelancerDashboard;
