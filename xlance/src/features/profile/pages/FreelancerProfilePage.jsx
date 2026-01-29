import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, MapPin, Briefcase, Star, Clock, Globe, ShieldCheck, MessageSquare, CheckCircle, Quote, IndianRupee } from 'lucide-react';
import { userService } from '../../auth/services/userService';
import { messageService } from '../../messages/services/messageService';
import { gigService } from '../../gigs/services/gigService'; // Added GigService
import { useAuth } from '../../auth/context/AuthContext';
import { Button, Card, Badge, LoadingSpinner } from '../../../shared/components';
import { Link } from 'react-router-dom'; // Added Link

const FreelancerProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, userProfile } = useAuth();
    const [freelancer, setFreelancer] = useState(null);
    const [freelancerGigs, setFreelancerGigs] = useState([]); // State for Gigs
    const [loading, setLoading] = useState(true);
    const [chatLoading, setChatLoading] = useState(false);

    useEffect(() => {
        const fetchFreelancer = async () => {
            try {
                if (id) {
                    // Parallel Fetch: Profile + Gigs
                    const [profileData, gigsData] = await Promise.all([
                        userService.getFreelancerById(id),
                        gigService.getGigsBySeller(id)
                    ]);
                    setFreelancer(profileData);
                    setFreelancerGigs(gigsData || []);
                }
            } catch (error) {
                console.error("Error fetching freelancer:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFreelancer();
    }, [id]);

    const handleStartChat = async () => {
        if (!user) {
            navigate('/auth/signin');
            return;
        }

        // Prevent chatting with self
        if (freelancer?.uid === user.uid) {
            alert("You cannot chat with yourself.");
            return;
        }

        setChatLoading(true);
        try {
            // Start conversation
            const conversation = await messageService.startConversation(
                user.uid,
                freelancer.uid, // Assuming we have the UID stored in the directory entry. If not, we might need it.
                freelancer.name,
                freelancer.photoURL
            );

            // Navigate to messages
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

    if (!freelancer) return (
        <div className="min-h-screen pt-24 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Freelancer not found</h2>
            <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Profile Section */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                    <div className="flex flex-col md:flex-row gap-8 relative z-10">
                        {/* Avatar */}
                        <div className="shrink-0 flex flex-col items-center">
                            <div className="w-40 h-40 rounded-full border-4 border-white shadow-xl overflow-hidden mb-4 bg-gray-100">
                                <img
                                    src={freelancer.photoURL || `https://ui-avatars.com/api/?name=${freelancer.name}&background=random`}
                                    alt={freelancer.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-100">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Available
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                                <div>
                                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">{freelancer.name}</h1>
                                    <p className="text-xl text-gray-600 font-medium mb-4">{freelancer.role?.includes('freelancer') ? (freelancer.freelancerProfile?.headline || 'Freelancer') : 'Professional'}</p>

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium components-common">
                                        {freelancer.location && (
                                            <div className="flex items-center gap-1.5">
                                                <MapPin size={16} className="text-gray-400" />
                                                {freelancer.location}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={16} className="text-gray-400" />
                                            Member since {new Date(freelancer.createdAt).getFullYear()}
                                        </div>
                                        {freelancer.hourlyRate && (
                                            <div className="flex items-center gap-1.5 text-gray-900 font-bold">
                                                <IndianRupee size={16} className="text-gray-400" />
                                                ₹{freelancer.hourlyRate}/hr
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 min-w-[200px]">
                                    <Button onClick={() => handleStartChat()} isLoading={chatLoading} className="w-full flex items-center justify-center gap-2">
                                        <MessageSquare size={18} /> Message
                                    </Button>
                                    <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                                        Hire Now
                                    </Button>
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="prose prose-sm max-w-none text-gray-600">
                                <p>{freelancer.bio || freelancer.freelancerProfile?.bio || "No bio provided yet."}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (Stats & Skills) */}
                    <div className="space-y-8">
                        {/* Skills */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {(Array.isArray(freelancer.skills) ? freelancer.skills : []).map((skill, index) => (
                                    <Badge key={index} variant="secondary" className="px-3 py-1.5">
                                        {skill}
                                    </Badge>
                                ))}
                                {(!freelancer.skills || freelancer.skills.length === 0) && (
                                    <p className="text-sm text-gray-400 italic">No skills listed</p>
                                )}
                            </div>
                        </div>

                        {/* Verified Status */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Verifications</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-sm font-medium text-gray-700"><ShieldCheck size={18} className="text-green-500" /> Identity Verified</span>
                                    <CheckCircle size={16} className="text-green-500" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-sm font-medium text-gray-700"><Globe size={18} className="text-blue-500" /> Email Verified</span>
                                    <CheckCircle size={16} className="text-green-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column (Gigs Storefront) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Active Gigs Section */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Briefcase size={20} className="text-primary-600" /> Active Gigs
                        </h3>

                        {freelancerGigs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {freelancerGigs.map(gig => (
                                    <Link to={`/gigs/${gig.id}`} key={gig.id} className="group">
                                        <Card className="overflow-hidden hover:shadow-lg transition-all h-full flex flex-col border-gray-200">
                                            <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                                                <img
                                                    src={gig.image}
                                                    alt={gig.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="p-4 flex-1 flex flex-col">
                                                <h4 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-emerald-600 transition-colors">
                                                    {gig.title}
                                                </h4>
                                                <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
                                                    <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                                                        <Star size={12} className="text-amber-400 fill-current" />
                                                        <span>{gig.rating || 'New'}</span>
                                                        <span className="text-gray-300">•</span>
                                                        <span>{gig.reviewCount || 0} reviews</span>
                                                    </div>
                                                    <span className="font-black text-gray-900">
                                                        ₹{gig.price}
                                                    </span>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 border-dashed">
                                <p className="text-gray-400 italic">This freelancer hasn't posted any Gigs yet.</p>
                            </div>
                        )}
                    </div>

                    {/* Reviews Mockup */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Star size={20} className="text-amber-500" /> Client Reviews
                        </h3>
                        <div className="space-y-6 divide-y divide-gray-50">
                            <div className="pt-4 first:pt-0">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-gray-900">Project: E-commerce Website Redesign</h4>
                                    <div className="flex text-amber-500"><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /></div>
                                </div>
                                <p className="text-sm text-gray-600 italic mb-3">"Absolute professional! Delivered ahead of schedule and the code quality was top notch."</p>
                                <p className="text-xs text-gray-400 font-bold uppercase">Oct 2025</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FreelancerProfilePage;
