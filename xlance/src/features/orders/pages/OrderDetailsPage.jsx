import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { useAuth } from '../../auth/context/AuthContext';
import { Card, Button, Badge } from '../../../shared/components';
import PageTransition from '../../../shared/components/PageTransition';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import { CheckCircle2, Clock, FileText, Send, User } from 'lucide-react';

const OrderDetailsPage = () => {
    const { orderId } = useParams();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deliveryNote, setDeliveryNote] = useState('');
    const [delivering, setDelivering] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await orderService.getOrderById(orderId);
                setOrder(data);
            } catch (err) {
                console.error("Error fetching order:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    const isSeller = user?.uid === order?.sellerId;
    const isBuyer = user?.uid === order?.buyerId;

    const handleDeliverWork = async () => {
        if (!deliveryNote) return alert("Please add a note.");
        setDelivering(true);
        try {
            await orderService.deliverOrder(orderId, [], deliveryNote);
            setOrder(prev => ({ ...prev, status: 'delivered', deliveryNote }));
        } catch (err) {
            console.error(err);
        } finally {
            setDelivering(false);
        }
    };

    const handleAcceptDelivery = async () => {
        if (!window.confirm("Are you sure you want to accept this delivery? This will release payment.")) return;
        try {
            await orderService.updateOrderStatus(orderId, 'completed');
            setOrder(prev => ({ ...prev, status: 'completed' }));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="flex justify-center pt-32"><LoadingSpinner /></div>;
    if (!order) return <div className="pt-32 text-center">Order not found.</div>;

    const getStatusColor = (s) => {
        switch (s) {
            case 'active': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'delivered': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    }

    return (
        <PageTransition>
            <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-black text-gray-900">Order #{order.id.slice(0, 8)}</h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>
                            <p className="text-gray-500 font-medium">
                                Created on {new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}
                            </p>
                        </div>
                        {isBuyer && order.status === 'delivered' && (
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg" onClick={handleAcceptDelivery}>
                                <CheckCircle2 size={18} className="mr-2" /> Accept & Complete
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Gig Info */}
                            <Card className="p-0 overflow-hidden flex flex-col sm:flex-row">
                                <div className="w-full sm:w-40 h-40 bg-gray-200">
                                    <img src={order.gigImage} alt="Gig" className="w-full h-full object-cover" />
                                </div>
                                <div className="p-6 flex-1">
                                    <h3 className="font-bold text-lg text-gray-900 mb-2">{order.gigTitle}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <User size={14} />
                                            {isBuyer ? `Seller: ${order.sellerName}` : `Buyer: ${order.buyerName}`}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {order.deliveryDays} Days Delivery
                                        </div>
                                    </div>
                                    <div className="mt-4 font-black text-xl text-gray-900">₹{order.total}</div>
                                </div>
                            </Card>

                            {/* Delivery Section */}
                            {order.status === 'active' && isSeller && (
                                <Card className="p-6 bg-white border border-blue-100 shadow-sm">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Send size={18} className="text-blue-500" /> Deliver Your Work
                                    </h3>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none mb-4"
                                        rows={4}
                                        placeholder="Add a note describing your delivery or paste a link to your files..."
                                        value={deliveryNote}
                                        onChange={(e) => setDeliveryNote(e.target.value)}
                                    ></textarea>
                                    <div className="flex justify-end">
                                        <Button onClick={handleDeliverWork} isLoading={delivering}>Deliver Now</Button>
                                    </div>
                                </Card>
                            )}

                            {order.status === 'delivered' && (
                                <Card className="p-6 bg-purple-50 border border-purple-100">
                                    <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                                        <CheckCircle2 size={18} /> Order Delivered
                                    </h3>
                                    <div className="bg-white p-4 rounded-xl border border-purple-100 text-gray-700 whitespace-pre-wrap">
                                        {order.deliveryNote || "No note provided."}
                                    </div>
                                    {isBuyer && (
                                        <p className="text-xs text-purple-600 mt-4 font-medium">
                                            Please review the work. If everything looks good, click "Accept & Complete" above.
                                        </p>
                                    )}
                                </Card>
                            )}

                            {order.status === 'completed' && (
                                <Card className="p-8 text-center bg-blue-50 border border-blue-100">
                                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <h2 className="text-2xl font-black text-blue-800 mb-2">Order Completed</h2>
                                    <p className="text-blue-700">This order has been successfully completed. Funds have been released.</p>
                                </Card>
                            )}

                            {/* Chat Placeholder */}
                            <Card className="p-6 h-64 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200">
                                <FileText size={32} className="mb-2" />
                                <p>Order Activity / Chat History (Coming Soon)</p>
                            </Card>
                        </div>

                        {/* Sidebar: Timeline */}
                        <div className="space-y-6">
                            <Card className="p-6">
                                <h3 className="font-bold text-gray-900 mb-4">Timeline</h3>
                                <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                                    <div className="relative pl-8">
                                        <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
                                        <p className="text-sm font-bold text-gray-900">Order Placed</p>
                                        <p className="text-xs text-gray-500">{new Date(order.createdAt?.seconds * 1000).toLocaleString()}</p>
                                    </div>
                                    {order.deliveredAt && (
                                        <div className="relative pl-8">
                                            <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-purple-500 border-2 border-white shadow-sm" />
                                            <p className="text-sm font-bold text-gray-900">Order Delivered</p>
                                            <p className="text-xs text-gray-500">{new Date(order.deliveredAt.seconds * 1000).toLocaleString()}</p>
                                        </div>
                                    )}
                                    {order.status === 'completed' && (
                                        <div className="relative pl-8">
                                            <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
                                            <p className="text-sm font-bold text-gray-900">Order Completed</p>
                                            <p className="text-xs text-gray-500">Funds Released</p>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h3 className="font-bold text-gray-900 mb-2">Need Support?</h3>
                                <p className="text-xs text-gray-500 mb-4">If you have any issues with this order, please contact support.</p>
                                <Button variant="outline" size="sm" className="w-full">Resolution Center</Button>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </PageTransition>
    );
};

export default OrderDetailsPage;
