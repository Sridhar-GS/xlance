import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Button } from '../../../shared/components';
import PageTransition from '../../../shared/components/PageTransition';
import { useAuth } from '../../auth/context/AuthContext';
import { gigService } from '../../gigs/services/gigService';
import { orderService } from '../../orders/services/orderService';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Briefcase,
  DollarSign,
  Star,
  Eye,
  Package,
  MessageSquare,
  Clock
} from 'lucide-react';

const StatCard = ({ title, value, subValue, icon: Icon, colorClass }) => {
  return (
    <Card className="p-6 border-none shadow-sm flex items-start justify-between">
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-black text-gray-900">{value}</h3>
        {subValue && <p className="text-xs text-gray-500 mt-1 font-medium">{subValue}</p>}
      </div>
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 text-opacity-100`}>
        <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
      </div>
    </Card>
  );
};

const FreelancerDashboard = () => {
  const { user, userProfile } = useAuth();
  const [gigs, setGigs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.uid) {
        try {
          const [myGigs, myOrders] = await Promise.all([
            gigService.getGigsBySeller(user.uid),
            orderService.getSellerOrders(user.uid)
          ]);
          setGigs(myGigs);
          setOrders(myOrders);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user]);

  // Derived Stats
  const totalViews = gigs.reduce((acc, gig) => acc + (gig.views || 0), 0);
  const avgRating = gigs.length > 0 ? (gigs.reduce((acc, gig) => acc + (gig.rating || 0), 0) / gigs.length).toFixed(1) : "N/A";
  const activeGigs = gigs.length;

  // Calculate Earnings (Completed orders only)
  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalEarnings = completedOrders.reduce((sum, o) => sum + (o.price || 0), 0); // Earnings is price minus fees, assuming Seller gets base price? Or Total? Simplified for now.
  const activeOrdersCount = orders.filter(o => o.status === 'active' || o.status === 'delivered').length;

  return (
    <PageTransition>
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Seller Dashboard</h1>
              <p className="text-gray-500 mt-2">Overview of your gigs and performance.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/gigs/create">
                <Button className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200">
                  Create New Gig
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <StatCard
              title="Active Gigs"
              value={activeGigs}
              subValue="Services live on marketplace"
              icon={Package}
              colorClass="bg-blue-500"
            />
            <StatCard
              title="Active Orders"
              value={activeOrdersCount}
              subValue="Orders in progress"
              icon={Briefcase}
              colorClass="bg-orange-500"
            />
            <StatCard
              title="Avg. Rating"
              value={avgRating}
              subValue={`Across ${gigs.length} gigs`}
              icon={Star}
              colorClass="bg-yellow-400"
            />
            <StatCard
              title="Total Earnings"
              value={`₹${totalEarnings.toLocaleString()}`}
              subValue="Cleared funds"
              icon={DollarSign}
              colorClass="bg-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column: Active Gigs */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Your Active Gigs</h2>

              {loading ? (
                <div className="h-40 bg-gray-200 rounded-xl animate-pulse" />
              ) : gigs.length === 0 ? (
                <Card className="p-8 text-center border-dashed border-2 border-gray-200 shadow-none">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No Active Gigs</h3>
                  <p className="text-gray-500 mb-4">Post your first Gig to start selling.</p>
                  <Link to="/gigs/create"><Button>Create Gig</Button></Link>
                </Card>
              ) : (
                <div className="space-y-4">
                  {gigs.map(gig => (
                    <Card key={gig.id} className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        <img src={gig.image} alt={gig.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 line-clamp-1">{gig.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">Starting at ₹{gig.price}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
                        <span className="flex items-center gap-1"><Eye size={14} /> {gig.views}</span>
                        <Link to={`/gigs/${gig.id}`}>
                          <Button size="sm" variant="ghost">Preview</Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Side Column: Active Orders List (Mini) */}
            <div className="space-y-6">
              <Card className="p-6 bg-white border-none shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Briefcase size={18} /> Active Orders
                  </h3>
                  <Link to="/orders" className="text-xs font-bold text-green-600">View All</Link>
                </div>

                <div className="space-y-3">
                  {orders.filter(o => o.status === 'active').slice(0, 3).map(order => (
                    <div key={order.id} className="text-sm p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                      <div className="truncate pr-2 max-w-[150px] font-medium">{order.gigTitle}</div>
                      <div className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-bold">Due Soon</div>
                    </div>
                  ))}
                  {orders.filter(o => o.status === 'active').length === 0 && (
                    <div className="text-center py-4 text-gray-400 text-xs">No active orders</div>
                  )}
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none shadow-lg">
                <h3 className="font-bold text-lg mb-2">Reach More Buyers</h3>
                <p className="text-indigo-100 text-sm mb-4">Upgrade your profile to get featured in search results.</p>
                <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50 border-none">Boost Profile</Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default FreelancerDashboard;
