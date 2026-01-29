import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../auth/context/AuthContext';
import { messageService } from '../../messages/services/messageService';

const getLevelStyles = (level) => {
    const l = level?.toLowerCase() || 'silver';
    if (l.includes('gold')) return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    if (l.includes('platinum')) return 'bg-slate-300/10 text-slate-200 border border-slate-300/20'; // Metallic white/blue
    if (l.includes('elite') || l.includes('diamond')) return 'bg-purple-500/10 text-purple-300 border border-purple-500/20';
    return 'bg-gray-700/30 text-gray-300 border border-gray-600/30'; // Silver/Default
};

const FreelancerCard = ({ freelancer }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [chatLoading, setChatLoading] = React.useState(false);

    const handleViewProfile = () => {
        navigate(`/talent/${freelancer.id}`);
    };

    const handleChat = async (e) => {
        e.stopPropagation(); // Prevent card flip or other events if needed

        if (!user) {
            navigate('/auth/signin');
            return;
        }

        if (!freelancer.uid) {
            // Fallback for mock data
            // alert("This is a demo profile and cannot accept messages.");
            // navigate(`/talent/${freelancer.id}`);
            // Actually, let's just create a dummy conversation if it's mock
            console.warn("No UID for freelancer, cannot start chat");
            return;
        }

        if (freelancer.uid === user.uid) {
            alert("You cannot chat with yourself.");
            return;
        }

        setChatLoading(true);
        try {
            const conversation = await messageService.startConversation(
                user.uid,
                freelancer.uid,
                freelancer.name,
                freelancer.photoURL || freelancer.avatar
            );
            navigate('/messages', { state: { conversationId: conversation.id } });
        } catch (error) {
            console.error("Error starting chat:", error);
        } finally {
            setChatLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group h-[380px] w-full max-w-[320px] mx-auto [perspective:1000px]"
        >
            <div className="relative h-full w-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                {/* Front Face */}
                <div className="absolute inset-0 h-full w-full rounded-3xl bg-white p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center [backface-visibility:hidden]">
                    <div className="w-28 h-28 rounded-full overflow-hidden mb-6 border-4 border-primary-50 shadow-inner">
                        <img
                            src={freelancer.avatar || `https://ui-avatars.com/api/?name=${freelancer.name}&background=random`}
                            alt={freelancer.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <h3 className="text-2xl font-black text-gray-900 mb-2">{freelancer.name}</h3>
                    <p className="text-primary-600 font-bold tracking-wide uppercase text-xs mb-6">{freelancer.category || freelancer.freelancerProfile?.role || 'Freelancer'}</p>

                    <div className="text-center space-y-1">
                        <p className="text-gray-400 text-sm font-medium">Starting from</p>
                        <p className="text-3xl font-black text-gray-900">₹{freelancer.hourlyRate || freelancer.startingPrice || '1000'}</p>
                    </div>

                    <div className="mt-8 text-xs text-gray-400 font-medium flex items-center gap-2">
                        <span>Hover for details</span>
                    </div>
                </div>

                {/* Back Face */}
                <div className="absolute inset-0 h-full w-full rounded-3xl bg-gray-900 p-6 text-white flex flex-col items-center justify-between [transform:rotateY(180deg)] [backface-visibility:hidden] shadow-xl">
                    <div className="w-full text-center pt-2">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <span className="flex text-amber-400">{'★'.repeat(Math.round(freelancer.rating || 5))}</span>
                            <span className="font-bold">{freelancer.rating || 5.0}</span>
                        </div>

                        <div className="flex justify-center gap-4 text-sm mb-6">
                            <div className="text-center px-3 py-1 bg-white/10 rounded-lg backdrop-blur-sm">
                                <span className="block font-bold text-lg">{freelancer.experienceLevel || freelancer.experience || 'NEW'}</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Exp</span>
                            </div>
                            <div className={`text-center px-3 py-1 rounded-lg backdrop-blur-sm ${getLevelStyles(freelancer.level || 'Silver')}`}>
                                <span className="block font-bold text-lg">{freelancer.level || 'Silver'}</span>
                                <span className="text-[10px] opacity-80 uppercase tracking-wider">Level</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-2 mb-4">
                            {freelancer.skills?.slice(0, 4).map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-800 text-xs rounded-md text-gray-300 border border-gray-700">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full">
                        <button onClick={handleViewProfile} className="w-full bg-white text-gray-900 font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors">
                            View Profile
                        </button>
                        <button
                            onClick={handleChat}
                            disabled={chatLoading}
                            className="w-full bg-transparent border border-white/20 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <MessageSquare size={16} /> {chatLoading ? 'Starting...' : 'Chat'}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default FreelancerCard;
