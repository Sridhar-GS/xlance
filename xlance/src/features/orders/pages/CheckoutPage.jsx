import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gigService } from '../../gigs/services/gigService';
import { orderService } from '../services/orderService';
import { useAuth } from '../../auth/context/AuthContext';
import { Card, Button, Input } from '../../../shared/components';
import PageTransition from '../../../shared/components/PageTransition';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import { ShieldCheck, CreditCard, Lock, CheckCircle2 } from 'lucide-react';

const CheckoutPage = () => {
    const { gigId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [gig, setGig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchGig = async () => {
            try {
                const data = await gigService.getGigById(gigId);
                setGig(data);
            } catch (err) {
                console.error("Error fetching gig:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchGig();
    }, [gigId]);

    const handleConfirmOrder = async () => {
        if (!user || !gig) return;

        setProcessing(true);
        try {
            // Calculate fees (mock)
            const serviceFee = Math.round(gig.price * 0.05);
            const total = gig.price + serviceFee;

            const orderData = {
                gigId: gig.id,
                gigTitle: gig.title,
                gigImage: gig.image,
                sellerId: gig.sellerId,
                sellerName: gig.seller?.name || "Seller",
                buyerId: user.uid,
                buyerName: user.displayName || "Buyer",
                buyerEmail: user.email,
                price: gig.price,
                serviceFee,
                total,
                status: 'active', // Immediately active for MVP
                requirementsDetails: "Standard requirements", // Placeholder
                paymentMethod: "Credit Card (Mock)",
                deliveryDays: gig.deliveryTime
            };

            await orderService.createOrder(orderData);
            navigate('/orders'); // Client Dashboard "My Orders"
        } catch (error) {
            console.error("Order failed:", error);
            alert("Failed to place order. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="flex justify-center pt-32"><LoadingSpinner /></div>;
    if (!gig) return <div className="pt-32 text-center text-destructive font-bold">Gig not found or unavailable.</div>;

    const serviceFee = Math.round(gig.price * 0.05);
    const total = gig.price + serviceFee;

    return (
        <PageTransition>
            <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-background min-h-screen transition-colors duration-300">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: Payment Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-8 bg-card border-border">
                            <h2 className="text-xl font-bold text-foreground mb-6">Payment Method</h2>
                            <div className="p-4 border border-primary/20 bg-primary/5 rounded-xl flex items-center justify-between mb-4 cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <CreditCard className="text-primary" />
                                    <span className="font-bold text-foreground">Credit or Debit Card</span>
                                </div>
                                <div className="w-5 h-5 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                                    <div className="w-2 h-2 bg-background rounded-full" />
                                </div>
                            </div>

                            {/* Mock Form */}
                            <div className="grid grid-cols-2 gap-4 opacity-50 pointer-events-none select-none text-foreground">
                                <div className="col-span-2">
                                    <Input label="Card Number" placeholder="0000 0000 0000 0000" className="bg-background border-border" />
                                </div>
                                <div>
                                    <Input label="Expiration Date" placeholder="MM/YY" className="bg-background border-border" />
                                </div>
                                <div>
                                    <Input label="CVV" placeholder="123" className="bg-background border-border" />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                                <Lock size={12} /> SSL Secure Payment. This is a secure mock transaction.
                            </p>
                        </Card>

                        <Card className="p-8 bg-card border-border">
                            <h2 className="text-xl font-bold text-foreground mb-4">Billing Information</h2>
                            <div className="text-sm text-foreground space-y-1">
                                <p className="font-bold">{user.displayName || "Buyer Name"}</p>
                                <p className="text-muted-foreground">{user.email}</p>
                            </div>
                        </Card>
                    </div>

                    {/* Right: Order Summary */}
                    <div>
                        <Card className="p-6 lg:sticky lg:top-28 bg-card border-border shadow-lg">
                            <h2 className="text-lg font-bold text-foreground mb-4">Order Summary</h2>
                            <div className="flex gap-4 mb-6 pb-6 border-b border-border">
                                <div className="w-20 h-14 bg-muted rounded-lg overflow-hidden shrink-0">
                                    <img src={gig.image} alt="Gig" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-tight py-1">{gig.title}</h3>
                                    <span className="text-xs font-medium text-muted-foreground">{gig.category}</span>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm text-foreground mb-6">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Item Price</span>
                                    <span className="font-medium">₹{gig.price}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Service Fee (5%)</span>
                                    <span className="font-medium">₹{serviceFee}</span>
                                </div>
                                <div className="pt-3 border-t border-border flex justify-between text-base font-black text-foreground">
                                    <span>Total</span>
                                    <span>₹{total}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Delivery Time: {gig.deliveryTime} Days</p>
                            </div>

                            <Button
                                className="w-full py-4 text-base shadow-xl"
                                onClick={handleConfirmOrder}
                                isLoading={processing}
                            >
                                Confirm & Pay
                            </Button>

                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                <ShieldCheck size={14} /> You are covered by Xlance Protection.
                            </div>
                        </Card>
                    </div>

                </div>
            </main>
        </PageTransition>
    );
};

export default CheckoutPage;
