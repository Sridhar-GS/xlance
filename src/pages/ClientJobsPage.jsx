import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MoreVertical, Briefcase, Eye, Edit2, Archive, X, CheckCircle2, User, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/jobService';
import { proposalService } from '../services/proposalService';
import { Button, Card, Input, Badge } from '../components/common';
import usePageTitle from "../hooks/usePageTitle";
import { motion, AnimatePresence } from 'framer-motion';

const ProposalsDrawer = ({ job, isOpen, onClose, onHire }) => {
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        if (isOpen && job?.id) {
            const fetchProposals = async () => {
                setLoading(true);
                const data = await proposalService.getProposalsByJob(job.id);
                setProposals(data);
                setLoading(false);
            };
            fetchProposals();
        }
    }, [isOpen, job]);

    const sortedProposals = [...proposals].sort((a, b) => {
        if (sortBy === 'highestBid') return (b.bidAmount || 0) - (a.bidAmount || 0);
        if (sortBy === 'lowestBid') return (a.bidAmount || 0) - (b.bidAmount || 0);
        // Default newest
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
    });

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
                key="drawer"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white shadow-2xl z-[70] overflow-y-auto"
            >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 shadow-sm">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Proposals</h2>
                        <p className="text-sm text-gray-500 mt-1">For: {job?.title}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2"
                        >
                            <option value="newest">Newest First</option>
                            <option value="highestBid">Highest Bid</option>
                            <option value="lowestBid">Lowest Bid</option>
                        </select>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    {loading ? (
                        <div className="text-center py-10 text-gray-400">Loading proposals...</div>
                    ) : sortedProposals.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            No proposals yet.
                        </div>
                    ) : (
                        sortedProposals.map((proposal) => (
                            <div key={proposal.id} className="p-4 border border-gray-100 rounded-xl hover:border-primary-200 transition-all bg-white shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                            <User size={20} className="text-gray-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{proposal.freelancerName}</h3>
                                            <p className="text-xs text-gray-500">Rated: 4.9/5.0</p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary">Bid: ₹{proposal.bidAmount?.toLocaleString()}</Badge>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 mb-4 leading-relaxed">
                                    {proposal.coverLetter}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1">Message</Button>
                                    {proposal.status === 'accepted' ? (
                                        <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 cursor-default">
                                            <CheckCircle2 size={16} className="mr-1" /> Hired
                                        </Button>
                                    ) : job?.status === 'closed' ? (
                                        <Button size="sm" disabled className="flex-1 bg-gray-100 text-gray-400 border-gray-200">
                                            Job Closed
                                        </Button>
                                    ) : (
                                        <Button size="sm" className="flex-1" onClick={() => onHire(proposal)}>
                                            Hire Freelancer
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

const ClientJobsPage = () => {
    usePageTitle("My Jobs");
    const { user } = useAuth();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);

    useEffect(() => {
        const fetchJobs = async () => {
            if (user?.uid) {
                try {
                    setLoading(true);
                    const clientJobs = await jobService.getClientJobs(user.uid);
                    setJobs(clientJobs);
                } catch (error) {
                    console.error("Error fetching jobs:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchJobs();
    }, [user]);

    const handleHire = async (proposal) => {
        try {
            await proposalService.acceptProposal(proposal.id, {
                ...proposal,
                clientUserId: user.uid,
                clientName: user.displayName || 'Client',
                // Add any other details needed for the project/chat
            }, user.uid);

            // Optimistically update UI
            setJobs(prevJobs => prevJobs.map(job =>
                job.id === selectedJob.id
                    ? { ...job, status: 'closed', hiredFreelancerId: proposal.freelancerId }
                    : job
            ));

            // Close drawer and navigate to dashboard or show success
            setSelectedJob(null);
            alert("Freelancer hired successfully! Project created.");
            // navigate('/dashboard/client'); // Optional: redirect to dashboard
        } catch (error) {
            console.error("Hiring failed:", error);
            alert("Failed to hire freelancer. Please try again.");
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'open': return 'success';
            case 'closed': return 'secondary';
            case 'draft': return 'warning';
            default: return 'primary';
        }
    };

    return (
        <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Jobs</h1>
                        <p className="text-gray-500 mt-1">Manage your job postings and view proposals.</p>
                    </div>
                    <Link to="/post-job">
                        <Button className="shadow-lg shadow-primary-600/20">
                            <Plus size={18} className="mr-2" /> Post a New Job
                        </Button>
                    </Link>
                </div>

                {/* Filters & Search */}
                <Card className="p-4 mb-6 bg-white border-none shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            {['all', 'open', 'closed'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === status
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)} Jobs
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search jobs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>
                </Card>

                {/* Job List */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No jobs found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-6">
                            {searchQuery || filterStatus !== 'all'
                                ? "Try adjusting your search or filters."
                                : "Get started by posting your first job to find top talent."}
                        </p>
                        {(searchQuery || filterStatus !== 'all') ? (
                            <Button variant="outline" onClick={() => { setFilterStatus('all'); setSearchQuery(''); }}>Clear Filters</Button>
                        ) : (
                            <Link to="/post-job"><Button>Post a Job</Button></Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredJobs.map(job => (
                            <Card key={job.id} className="p-6 bg-white border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all group">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between md:hidden mb-2">
                                            <Badge variant={getStatusBadgeVariant(job.status)} size="sm" className="uppercase tracking-wider text-[10px]">
                                                {job.status}
                                            </Badge>
                                            <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={18} /></button>
                                        </div>
                                        <Link to={`/jobs/${job.id}`}>
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                                                {job.title}
                                            </h3>
                                        </Link>
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mb-4">
                                            <span>Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Just now'}</span>
                                            <span>{job.budgetType === 'hourly' ? `Scale: ₹${job.budget?.min} - ₹${job.budget?.max}/hr` : `Fixed: ₹${job.budget?.fixed}`}</span>
                                            <span>{job.duration}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="flex items-center gap-2 px-3 py-1 bg-primary-50 hover:bg-primary-100 cursor-pointer rounded-lg text-sm font-medium text-primary-700 transition-colors"
                                                onClick={() => setSelectedJob(job)}
                                            >
                                                <Briefcase size={14} className="text-primary-500" />
                                                <span>{job.proposalsCount || 0} Proposals</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                                                <Eye size={14} className="text-gray-400" />
                                                <span>{job.views || 0} Views</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="hidden md:flex flex-col items-end gap-3 min-w-[140px]">
                                        <Badge variant={getStatusBadgeVariant(job.status)} className="uppercase tracking-wider text-[10px]">
                                            {job.status}
                                        </Badge>
                                        <div className="flex items-center gap-2 mt-auto">
                                            <Link to={`/jobs/${job.id}`}>
                                                <Button size="sm" variant="outline" className="h-9 px-3">
                                                    View Job
                                                </Button>
                                            </Link>
                                            <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                                <Edit2 size={18} />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                <Archive size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                <ProposalsDrawer
                    job={selectedJob}
                    isOpen={!!selectedJob}
                    onClose={() => setSelectedJob(null)}
                    onHire={handleHire}
                />
            </div>
        </div>
    );
};

export default ClientJobsPage;
