import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../../shared/components';
import { ShoppingBag, Search, MessageSquare, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { orderService } from '../../orders/services/orderService';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../shared/services/firebaseConfig';

const ClientDashboard = () => {
  const { user, userProfile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user?.uid) {
        try {
          const data = await orderService.getBuyerOrders(user.uid);
          setOrders(data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchOrders();
  }, [user]);

  // Subscribe to unread messages count from conversations
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let totalUnread = 0;
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const unreadCount = data.unreadCounts?.[user.uid] || 0;
        totalUnread += unreadCount;
      });
      setUnreadMessages(totalUnread);
    }, (error) => {
      console.error("Error fetching unread count:", error);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const activeOrders = orders.filter(o => o.status === 'active').length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Buyer Dashboard</h1>
            <p className="text-gray-500 mt-2 font-medium">Manage your orders and find new services.</p>
          </div>
          <Link to="/marketplace">
            <Button className="shadow-lg shadow-green-600/20 bg-green-600 hover:bg-green-700 text-white border-none">
              <Search size={18} className="mr-2" /> Find Services
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card hover={false} className="p-6 bg-white border-none shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Orders</p>
              <h3 className="text-2xl font-black text-gray-900">{activeOrders}</h3>
            </div>
          </Card>
          <Card hover={false} className="p-6 bg-white border-none shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <MessageSquare size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Unread Messages</p>
              <h3 className="text-2xl font-black text-gray-900">{unreadMessages}</h3>
            </div>
          </Card>
          <Card hover={false} className="p-6 bg-white border-none shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Spent</p>
              <h3 className="text-2xl font-black text-gray-900">₹{totalSpent.toLocaleString()}</h3>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: Active Orders */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              <Link to="/orders" className="text-green-600 font-bold text-sm hover:underline">View All</Link>
            </div>

            {loading ? (
              <div className="h-40 bg-gray-100 animate-pulse rounded-xl" />
            ) : orders.length === 0 ? (
              <Card className="p-10 text-center bg-white border-none shadow-sm flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
                <ShoppingBag size={32} className="text-gray-300 mb-3" />
                <h3 className="text-lg font-bold text-gray-900">No Orders Yet</h3>
                <p className="text-sm text-gray-500 mb-4">Explore the marketplace to find services.</p>
                <Link to="/marketplace"><Button>Browse Gigs</Button></Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 3).map(order => (
                  <Link to={`/orders/${order.id}`} key={order.id} className="block group">
                    <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        <img src={order.gigImage} alt="Gig" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">{order.gigTitle}</h3>
                        <p className="text-xs text-gray-500 mt-1">Order #{order.id.slice(0, 8)} • Status: <span className="uppercase font-bold">{order.status}</span></p>
                      </div>
                      <div className="font-black text-gray-900">₹{order.total}</div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: Recommended */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
            </div>

            <Card className="p-6 bg-gray-900 text-white border-none shadow-xl">
              <h3 className="font-bold text-lg mb-2">Need a custom solution?</h3>
              <p className="text-gray-400 text-sm mb-4">Post a request and let freelancers come to you.</p>
              <Button variant="outline" className="w-full text-white border-gray-600 hover:bg-gray-800">Post a Request</Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
