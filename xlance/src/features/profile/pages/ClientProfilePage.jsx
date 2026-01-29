import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { User, MapPin, Briefcase, Star, Clock, Globe, ShieldCheck, MessageSquare, CheckCircle, Building2, Users } from 'lucide-react';
import { userService } from '../../auth/services/userService';
import { messageService } from '../../messages/services/messageService';
import { useAuth } from '../../auth/context/AuthContext';
import { Button, Card, Badge, LoadingSpinner } from '../../../shared/components';
import PageTransition from '../../../shared/components/PageTransition';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../shared/services/firebaseConfig';

const ClientProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [client, setClient] = useState(null);
    const [clientJobs, setClientJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chatLoading, setChatLoading] = useState(false);

    useEffect(() => {
        const fetchClientAndJobs = async () => {
            try {
                if (id) {
                    // Fetch client profile
                    const data = await userService.getClientById(id);
                    setClient(data);

                    // Fetch jobs posted by this client
                    const jobsRef = collection(db, 'jobs');
                    const q = query(jobsRef, where('clientId', '==', id));
                    const snapshot = await getDocs(q);
                    const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setClientJobs(jobs);
                }
            } catch (error) {
                console.error("Error fetching client:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClientAndJobs();
    }, [id]);

    const handleStartChat = async () => {
        if (!user) {
            navigate('/auth/signin');
            return;
        }

        if (client?.uid === user.uid) {
            alert("You cannot chat with yourself.");
            return;
        }

        setChatLoading(true);
        try {
            const conversation = await messageService.startConversation(
                user.uid,
                client.uid,
                client.name,
                client.photoURL
            );
            navigate('/messages', { state: { conversationId: conversation.id } });
        } catch (error) {
            console.error("Error starting chat:", error);
        } finally {
            setChatLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen pt-24 flex justify-center">
            <LoadingSpinner size="lg" />
        </div>
    );

    if (!client) return (
        <div className="min-h-screen pt-24 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Client not found</h2>
            <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
        </div>
    );

    return (
        <PageTransition>
            <div className="min-h-screen bg-gray-50 pt-28 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header Profile Section */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                        <div className="flex flex-col md:flex-row gap-8 relative z-10">
                            {/* Avatar */}
                            <div className="shrink-0 flex flex-col items-center">
                                <div className="w-40 h-40 rounded-3xl border-4 border-white shadow-xl overflow-hidden mb-4 bg-gray-100 flex items-center justify-center">
                                    {client.photoURL ? (
                                        <img
                                            src={client.photoURL}
                                            alt={client.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Building2 size={64} className="text-gray-300" />
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider border border-purple-100">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                                    </span>
                                    Actively Hiring
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                                    <div>
                                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">{client.name}</h1>
                                        <p className="text-xl text-gray-600 font-medium mb-4">{client.clientProfile?.companyName || 'Company'}</p>

                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium components-common">
                                            {client.location && (
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin size={16} className="text-gray-400" />
                                                    {client.location}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={16} className="text-gray-400" />
                                                Member since {new Date(client.createdAt).getFullYear()}
                                            </div>
                                            {client.clientProfile?.companyType && (
                                                <div className="flex items-center gap-1.5 capitalize">
                                                    <Users size={16} className="text-gray-400" />
                                                    {client.clientProfile.companyType}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 min-w-[200px]">
                                        <Button onClick={handleStartChat} isLoading={chatLoading} className="w-full flex items-center justify-center gap-2">
                                            <MessageSquare size={18} /> Message
                                        </Button>
                                    </div>
                                </div>

                                {/* Bio */}
                                <div className="prose prose-sm max-w-none text-gray-600">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">About Us</h3>
                                    <p>{client.bio || client.clientProfile?.hiringNeeds || "We are looking for top talent to join our team."}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column (Stats) */}
                        <div className="space-y-8">
                            {/* Verifications */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Verifications</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2 text-sm font-medium text-gray-700"><ShieldCheck size={18} className="text-green-500" /> Payment Verified</span>
                                        <CheckCircle size={16} className="text-green-500" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2 text-sm font-medium text-gray-700"><Globe size={18} className="text-blue-500" /> Email Verified</span>
                                        <CheckCircle size={16} className="text-green-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">History</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Total Spent</p>
                                        <p className="text-lg font-bold text-gray-900">₹{client.totalSpent?.toLocaleString() || '0'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Jobs Posted</p>
                                        <p className="text-lg font-bold text-gray-900">{client.jobsPosted || '0'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Hires</p>
                                        <p className="text-lg font-bold text-gray-900">{client.hires || '0'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column (Open Jobs) */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Briefcase size={20} className="text-primary-600" /> Open Jobs ({clientJobs.length})
                                </h3>
                                {clientJobs.length > 0 ? (
                                    <div className="space-y-4">
                                        {clientJobs.map(job => (
                                            <Link to={`/jobs/${job.id}`} key={job.id} className="block group">
                                                <div className="p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all">
                                                    <h4 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{job.title}</h4>
                                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{job.description}</p>
                                                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-400">
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={12} /> {job.duration || 'Flexible'}
                                                        </span>
                                                        <span className="font-bold text-primary-600">
                                                            ₹{job.budget?.min?.toLocaleString() || '0'} - ₹{job.budget?.max?.toLocaleString() || 'Negotiable'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <Briefcase size={32} className="mx-auto text-gray-300 mb-3" />
                                        <p className="text-gray-500 font-medium">No active job posts.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default ClientProfilePage;
