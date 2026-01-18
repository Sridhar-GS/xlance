import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobService } from '../services/jobService';
import { proposalService } from '../services/proposalService';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Input } from '../components/common';
import PageTransition from '../components/common/PageTransition';
import LoadingSpinner from '../components/common/LoadingSpinner';

const JobDetailsPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { user, userProfile, authLoading } = useAuth();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const viewIncremented = React.useRef(false); // Track if view counted

    const [proposalForm, setProposalForm] = useState({
        bidAmount: '',
        coverLetter: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchJob = async () => {
            viewIncremented.current = false; // Reset tracking on new job fetch
            try {
                const data = await jobService.getJobById(jobId);
                if (data) {
                    setJob(data);
                    // View increment moved to separate effect to handle auth state
                } else {
                    setError("Job not found");
                }
            } catch (err) {
                console.error("Error fetching job:", err);
                setError("Error loading job details");
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [jobId]);

    // Handle View Increment
    useEffect(() => {
        if (!loading && !authLoading && job && !viewIncremented.current) {
            const isOwner = user?.uid && user.uid === job.clientId;
            if (!isOwner) {
                jobService.incrementJobView(jobId);
                viewIncremented.current = true;
            }
        }
    }, [job, user, authLoading, loading, jobId]);

    const handleSubmitProposal = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/auth/signin');
            return;
        }
        setSubmitting(true);
        try {
            await proposalService.createProposal({
                jobId,
                freelancerId: user.uid,
                bidAmount: Number(proposalForm.bidAmount),
                coverLetter: proposalForm.coverLetter,
                freelancerName: user.displayName || userProfile?.name || "Freelancer",
                jobTitle: job.title,
                clientName: job.client?.name || "Client",
                clientUserId: job.clientId,
                clientAvatar: job.client?.avatar || ""
            });
            navigate('/dashboard/freelancer');
        } catch (err) {
            console.error("Error submitting proposal:", err);
            setError("Failed to submit proposal");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center pt-20"><LoadingSpinner /></div>;
    if (error) return <div className="text-center pt-20 text-red-600">{error}</div>;
    if (!job) return <div className="text-center pt-20">Job not found</div>;

    return (
        <PageTransition>
            <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto space-y-6">
                    <Card className="p-4 md:p-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-gray-500 mb-6 gap-2 sm:gap-0">
                            <span>Posted by {job.client?.name || "Client"}</span>
                            <span>{new Date(job.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                        </div>

                        <div className="prose max-w-none text-gray-700 mb-8 whitespace-pre-wrap">
                            {job.description}
                        </div>

                        <div className="mb-6">
                            <h3 className="font-semibold mb-2">Required Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {job.skills?.map(skill => (
                                    <span key={skill} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <p className="font-semibold">Budget: ₹{job.budgetMin} - ₹{job.budgetMax}</p>
                        </div>
                    </Card>

                    {/* Proposal Form - Only for Freelancers and Open Jobs (Self-Applying Enabled for Testing) */}
                    {userProfile?.role?.includes('freelancer') && job.status === 'open' && (
                        <Card className="p-4 md:p-8">
                            <h2 className="text-xl font-bold mb-4">Submit a Proposal</h2>
                            <form onSubmit={handleSubmitProposal} className="space-y-4">
                                <Input
                                    label="Bid Amount (₹)"
                                    type="number"
                                    value={proposalForm.bidAmount}
                                    onChange={(e) => setProposalForm({ ...proposalForm, bidAmount: e.target.value })}
                                    required
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter</label>
                                    <textarea
                                        rows={6}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                        value={proposalForm.coverLetter}
                                        onChange={(e) => setProposalForm({ ...proposalForm, coverLetter: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" isLoading={submitting}>
                                        Submit Proposal
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    )}
                </div>
            </main>
        </PageTransition>
    );
};

export default JobDetailsPage;
