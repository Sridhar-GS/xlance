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
    const [proposalErrors, setProposalErrors] = useState({});
    const [proposalTouched, setProposalTouched] = useState({});

    // ... (useEffect hooks)

    const validateProposalField = (name, value) => {
        if (!value) return "This field is required";
        if (name === 'bidAmount' && Number(value) < 0) return "Bid amount cannot be negative";
        return "";
    };

    const handleProposalChange = (e) => {
        const { name, value } = e.target;
        setProposalForm(prev => ({ ...prev, [name]: value }));
        if (proposalTouched[name] || name === 'bidAmount') {
            setProposalErrors(prev => ({ ...prev, [name]: validateProposalField(name, value) }));
        }
    };

    const handleProposalBlur = (e) => {
        const { name, value } = e.target;
        setProposalTouched(prev => ({ ...prev, [name]: true }));
        setProposalErrors(prev => ({ ...prev, [name]: validateProposalField(name, value) }));
    };

    const handleSubmitProposal = async (e) => {
        e.preventDefault();
        console.log("Proposal Submit Clicked. User:", user?.uid);

        if (!user) {
            console.warn("No user found, redirecting to sign-in.");
            navigate('/auth/signin');
            return;
        }

        // Validate
        const errors = {};
        Object.keys(proposalForm).forEach(key => {
            const err = validateProposalField(key, proposalForm[key]);
            if (err) errors[key] = err;
        });

        if (Object.keys(errors).length > 0) {
            console.warn("Proposal Validation Errors:", errors);
            setProposalErrors(errors);
            setProposalTouched({ bidAmount: true, coverLetter: true });
            return;
        }

        console.log("Validation passed. Submitting to service...");
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

    const isFreelancer = Array.isArray(userProfile?.role)
        ? userProfile.role.some(r => r.toLowerCase() === 'freelancer')
        : userProfile?.role?.toLowerCase() === 'freelancer';

    if (loading) return <div className="flex justify-center pt-20"><LoadingSpinner /></div>;
    // ...

    return (
        <PageTransition>
            <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
                {/* ... Job Details Card ... */}
                <div className="max-w-3xl mx-auto space-y-6">
                    <Card className="p-4 md:p-8">
                        {/* ... Existing Job Details Content ... */}
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

                    {/* Proposal Form */}
                    {isFreelancer && job.status === 'open' && (
                        <Card className="p-4 md:p-8">
                            <h2 className="text-xl font-bold mb-4">Submit a Proposal</h2>
                            <form onSubmit={handleSubmitProposal} className="space-y-4" noValidate>
                                <div>
                                    <Input
                                        label="Bid Amount (₹)"
                                        name="bidAmount"
                                        type="number"
                                        value={proposalForm.bidAmount}
                                        onChange={handleProposalChange}
                                        onBlur={handleProposalBlur}
                                        className={proposalErrors.bidAmount ? 'border-red-500' : ''}
                                    />
                                    {proposalErrors.bidAmount && <p className="text-red-500 text-xs mt-1 font-medium">{proposalErrors.bidAmount}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter</label>
                                    <textarea
                                        name="coverLetter"
                                        rows={6}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none ${proposalErrors.coverLetter ? 'border-red-500 ring-red-200' : ''}`}
                                        value={proposalForm.coverLetter}
                                        onChange={handleProposalChange}
                                        onBlur={handleProposalBlur}
                                        spellCheck="true"
                                        autoCorrect="on"
                                        autoCapitalize="sentences"
                                    />
                                    {proposalErrors.coverLetter && <p className="text-red-500 text-xs mt-1 font-medium">{proposalErrors.coverLetter}</p>}
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
