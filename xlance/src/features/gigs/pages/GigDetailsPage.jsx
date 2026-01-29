import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gigService } from '../services/gigService';
import { useAuth } from '../../auth/context/AuthContext';
import { Card, Button } from '../../../shared/components';
import PageTransition from '../../../shared/components/PageTransition';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import { Clock, CheckCircle2, Star, ShieldCheck, Heart, User } from 'lucide-react';

const GigDetailsPage = () => {
    const { gigId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [gig, setGig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGig = async () => {
            try {
                const data = await gigService.getGigById(gigId);
                setGig(data);
                if (data) gigService.incrementGigView(gigId);
            } catch (err) {
                console.error("Error fetching gig:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchGig();
    }, [gigId]);

    const handleOrderClick = () => {
        if (!user) {
            navigate('/auth/signin', { state: { from: `/gigs/${gigId}` } });
            return;
        }
        navigate(`/checkout/${gigId}`);
    };

    if (loading) return <div className="flex justify-center pt-24"><LoadingSpinner /></div>;
    if (!gig) return <div className="pt-24 text-center text-foreground">Gig not found</div>;

    const coverImage = gig.image || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop";

    return (
        <PageTransition>
            <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-background min-h-screen transition-colors duration-300">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">

                    {/* Left Column: Details */}
                    <div className="flex-1 space-y-8">
                        {/* Title & Header */}
                        <div>
                            <h1 className="text-3xl font-black text-foreground leading-tight mb-4">
                                I will {gig.title.startsWith('I will') ? gig.title.substring(7) : gig.title}
                            </h1>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="font-semibold text-foreground text-base">{gig.category}</span>
                                <span className="w-1 h-1 rounded-full bg-border"></span>
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-bold text-foreground">{gig.rating || "New"}</span>
                                    <span>({gig.reviewCount || 0} reviews)</span>
                                </div>
                            </div>
                        </div>

                        {/* Image Gallery (Single Hero for now) */}
                        <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-sm border border-border bg-muted">
                            <img src={coverImage} alt={gig.title} className="w-full h-full object-cover" />
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-foreground">About This Gig</h2>
                            <div className="prose prose-zinc dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                {gig.description}
                            </div>
                        </div>

                        {/* Seller Bio */}
                        <Card className="p-8 bg-card border-border">
                            <h2 className="text-xl font-bold text-foreground mb-6">About The Seller</h2>
                            <div className="flex items-start gap-4">
                                <div className="w-20 h-20 rounded-full bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center border border-border">
                                    {gig.seller?.avatar ? (
                                        <img src={gig.seller.avatar} alt={gig.seller.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={32} className="text-muted-foreground" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">{gig.seller?.name}</h3>
                                    <p className="text-sm text-muted-foreground mb-4">{gig.seller?.level || "New Seller"}</p>
                                    <Button variant="outline" size="sm" onClick={() => alert("Contact Seller logic (Chat)")}>Contact Me</Button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Pricing & Action (Sticky) */}
                    <div className="lg:w-[400px]">
                        <div className="sticky top-28 space-y-6">
                            <Card className="p-6 border border-border shadow-lg bg-card">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="font-bold text-muted-foreground">Standard Package</span>
                                    <span className="text-3xl font-black text-foreground">₹{gig.price}</span>
                                </div>

                                <p className="text-muted-foreground mb-6 text-sm">
                                    A complete professional package including all necessary files and revisions.
                                </p>

                                <div className="flex items-center gap-4 text-sm font-semibold text-foreground mb-6">
                                    <div className="flex items-center gap-1">
                                        <Clock size={16} className="text-muted-foreground" />
                                        {gig.deliveryTime} Days Delivery
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <CheckCircle2 size={16} className="text-muted-foreground" />
                                        Unlimted Revisions
                                    </div>
                                </div>

                                <div className="space-y-3 mb-8">
                                    {gig.features?.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <CheckCircle2 size={16} className="text-primary flex-shrink-0" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                    {(!gig.features || gig.features.length === 0) && (
                                        <div className="text-muted-foreground italic text-sm">No specific features listed.</div>
                                    )}
                                </div>

                                <Button className="w-full py-6 text-lg rounded-xl shadow-lg" onClick={handleOrderClick}>
                                    Check Out (₹{gig.price})
                                </Button>

                                <div className="mt-4 text-center">
                                    <button className="text-muted-foreground hover:text-foreground font-medium text-sm flex items-center justify-center gap-2 w-full transition-colors">
                                        <Heart size={16} /> Save this Gig
                                    </button>
                                </div>
                            </Card>

                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium">
                                <ShieldCheck size={14} /> 100% Secure Payment
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </PageTransition>
    );
};

export default GigDetailsPage;
