import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { orderService } from '../services/orderService';
import { Card, Button, Badge } from '../../../shared/components';
import PageTransition from '../../../shared/components/PageTransition';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import { ShoppingBag, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const MyOrdersPage = () => {
    const { user, userProfile } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const isSeller = userProfile?.role === 'freelancer';

    useEffect(() => {
        const fetchOrders = async () => {
            if (user?.uid) {
                try {
                    setLoading(true);
                    let data = [];
                    if (isSeller) {
                        data = await orderService.getSellerOrders(user.uid);
                    } else {
                        data = await orderService.getBuyerOrders(user.uid);
                    }
                    setOrders(data);
                } catch (err) {
                    console.error("Error fetching orders:", err);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchOrders();
    }, [user, isSeller]);

    const getStatusVariant = (status) => {
        switch (status) {
            case 'active': return 'warning';
            case 'delivered': return 'info';
            case 'completed': return 'success';
            case 'cancelled': return 'danger';
            default: return 'neutral';
        }
    };

    return (
        <PageTransition>
            <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900">My Orders</h1>
                            <p className="text-gray-500 mt-1">Manage your {isSeller ? 'sales' : 'purchases'} and track progress.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20"><LoadingSpinner /></div>
                    ) : orders.length === 0 ? (
                        <Card className="p-16 text-center border-dashed border-2 border-gray-200">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                                <ShoppingBag size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
                            <p className="text-gray-500 mb-6">
                                {isSeller ? "You haven't received any orders yet." : "You haven't purchased any gigs yet."}
                            </p>
                            {!isSeller && (
                                <Link to="/marketplace">
                                    <Button size="lg">Browse Marketplace</Button>
                                </Link>
                            )}
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {orders.map(order => (
                                <Link to={`/orders/${order.id}`} key={order.id} className="block group">
                                    <Card className="p-6 flex flex-col md:flex-row items-center gap-6 hover:shadow-md transition-shadow border-l-4 border-l-transparent hover:border-l-primary-500">
                                        <div className="w-full md:w-32 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                            <img src={order.gigImage} alt={order.gigTitle} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg text-gray-900 truncate pr-4 group-hover:text-primary-600 transition-colors">
                                                    {order.gigTitle}
                                                </h3>
                                                <span className="shrink-0 font-black text-gray-900">₹{order.total}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span>Order #{order.id.slice(0, 8)}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    {isSeller ? `Buyer: ${order.buyerName}` : `Seller: ${order.sellerName}`}
                                                </span>
                                                <span>•</span>
                                                <span>{new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="w-full md:w-auto flex justify-between md:block">
                                            <Badge variant={getStatusVariant(order.status)} size="lg" className="uppercase tracking-wider font-bold">
                                                {order.status}
                                            </Badge>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </PageTransition>
    );
};

export default MyOrdersPage;
