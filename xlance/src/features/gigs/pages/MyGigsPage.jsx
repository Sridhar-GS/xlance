import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit2, Trash2, Star, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { gigService } from '../services/gigService';
import { Button, Card, Badge } from '../../../shared/components';
import usePageTitle from "../../../shared/hooks/usePageTitle";

const MyGigsPage = () => {
    usePageTitle("My Gigs");
    const { user } = useAuth();
    const [gigs, setGigs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGigs = async () => {
            if (user?.uid) {
                try {
                    setLoading(true);
                    const myGigs = await gigService.getGigsBySeller(user.uid);
                    setGigs(myGigs);
                } catch (error) {
                    console.error("Error fetching my gigs:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchGigs();
    }, [user]);

    const handleDelete = async (gigId) => {
        if (window.confirm("Are you sure you want to delete this Gig?")) {
            try {
                await gigService.deleteGig(gigId);
                setGigs(prev => prev.filter(g => g.id !== gigId));
            } catch (err) {
                console.error("Failed to delete gig", err);
            }
        }
    }

    return (
        <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Gigs</h1>
                        <p className="text-gray-500 mt-1">Manage your active services and view performance.</p>
                    </div>
                    <Link to="/gigs/create">
                        <Button className="bg-black text-white hover:bg-gray-800 shadow-lg">
                            <Plus size={18} className="mr-2" /> Create New Gig
                        </Button>
                    </Link>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />)}
                    </div>
                ) : gigs.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No Gigs Yet</h3>
                        <p className="text-gray-500 mb-6">Start selling your services to millions of buyers.</p>
                        <Link to="/gigs/create"><Button>Create Your First Gig</Button></Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {gigs.map(gig => (
                            <Card key={gig.id} className="p-0 overflow-hidden flex flex-col md:flex-row bg-white border border-gray-100 hover:shadow-md transition-shadow">
                                {/* Image Thumbnail */}
                                <div className="w-full md:w-48 h-48 md:h-auto bg-gray-100 relative">
                                    <img
                                        src={gig.image || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop"}
                                        alt={gig.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 right-2 md:hidden">
                                        <Badge variant="success" size="sm">Active</Badge>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">I will {gig.title.startsWith('I will') ? gig.title.substring(7) : gig.title}</h3>
                                            <div className="hidden md:block">
                                                <Badge variant="success" size="sm">Active</Badge>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                            <span className="font-semibold text-gray-900">₹{gig.price}</span>
                                            <span>•</span>
                                            <span>{gig.deliveryTime} Days Delivery</span>
                                            <span>•</span>
                                            <span>{gig.category}</span>
                                        </div>
                                    </div>

                                    {/* Stats & Actions Footer */}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-gray-50">
                                        <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
                                            <div className="flex items-center gap-1.5">
                                                <Eye size={16} className="text-gray-400" />
                                                {gig.views || 0} <span className="text-gray-400 font-normal">Views</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                                {gig.rating || 0} <span className="text-gray-400 font-normal">Rating</span>
                                            </div>
                                            {/* Placeholder for orders */}
                                            <div className="flex items-center gap-1.5">
                                                <Briefcase size={16} className="text-gray-400" />
                                                0 <span className="text-gray-400 font-normal">Orders</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 justify-end">
                                            <Link to={`/gigs/${gig.id}`}>
                                                <Button size="sm" variant="ghost" className="text-gray-500 hover:text-gray-900">Preview</Button>
                                            </Link>
                                            <Button size="sm" variant="outline" className="border-gray-200">
                                                <Edit2 size={14} className="mr-1" /> Edit
                                            </Button>
                                            <button
                                                onClick={() => handleDelete(gig.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyGigsPage;
