import { db } from '../../../shared/services/firebaseConfig';
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    Timestamp
} from 'firebase/firestore';

/**
 * Reports Service - Aggregates real-time data for Reports page
 */
export const reportsService = {
    /**
     * Get earnings/spending summary for a user
     * @param {string} uid - User ID
     * @param {string} role - 'freelancer' or 'client'
     * @returns {Object} Summary with totals and trends
     */
    getSummary: async (uid, role) => {
        try {
            const isFreelancer = role === 'freelancer';
            const fieldName = isFreelancer ? 'sellerId' : 'buyerId';

            // Get all orders for this user
            const ordersRef = collection(db, 'orders');
            const q = query(
                ordersRef,
                where(fieldName, '==', uid),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            const orders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date()
            }));

            // Calculate totals
            const completedOrders = orders.filter(o => o.status === 'completed');
            const activeOrders = orders.filter(o => o.status === 'active' || o.status === 'delivered');

            // This month calculations
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

            const thisMonthOrders = completedOrders.filter(o => o.createdAt >= startOfMonth);
            const lastMonthOrders = completedOrders.filter(o =>
                o.createdAt >= lastMonthStart && o.createdAt <= lastMonthEnd
            );

            const totalAmount = completedOrders.reduce((sum, o) => sum + (o.total || o.price || 0), 0);
            const thisMonthAmount = thisMonthOrders.reduce((sum, o) => sum + (o.total || o.price || 0), 0);
            const lastMonthAmount = lastMonthOrders.reduce((sum, o) => sum + (o.total || o.price || 0), 0);

            // Calculate trend percentage
            const trend = lastMonthAmount > 0
                ? Math.round(((thisMonthAmount - lastMonthAmount) / lastMonthAmount) * 100 * 10) / 10
                : thisMonthAmount > 0 ? 100 : 0;

            return {
                totalAmount,
                thisMonthAmount,
                activeCount: activeOrders.length,
                completedCount: completedOrders.length,
                totalOrders: orders.length,
                trend
            };
        } catch (error) {
            console.error('Error fetching summary:', error);
            return {
                totalAmount: 0,
                thisMonthAmount: 0,
                activeCount: 0,
                completedCount: 0,
                totalOrders: 0,
                trend: 0
            };
        }
    },

    /**
     * Get monthly earnings/spending data for charts
     * @param {string} uid - User ID
     * @param {string} role - 'freelancer' or 'client'
     * @returns {Array} Monthly data series
     */
    getMonthlySeries: async (uid, role) => {
        try {
            const isFreelancer = role === 'freelancer';
            const fieldName = isFreelancer ? 'sellerId' : 'buyerId';

            const ordersRef = collection(db, 'orders');
            const q = query(
                ordersRef,
                where(fieldName, '==', uid),
                where('status', '==', 'completed'),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            const orders = snapshot.docs.map(doc => ({
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date()
            }));

            // Group by month (last 12 months)
            const months = [];
            const now = new Date();

            for (let i = 11; i >= 0; i--) {
                const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
                const monthOrders = orders.filter(o =>
                    o.createdAt >= monthDate && o.createdAt <= monthEnd
                );
                const value = monthOrders.reduce((sum, o) => sum + (o.total || o.price || 0), 0);

                months.push({
                    label: monthDate.toLocaleDateString('en-US', { month: 'short' }),
                    value,
                    month: monthDate.getMonth(),
                    year: monthDate.getFullYear()
                });
            }

            return months;
        } catch (error) {
            console.error('Error fetching monthly series:', error);
            return Array.from({ length: 12 }, (_, i) => ({
                label: `M${i + 1}`,
                value: 0
            }));
        }
    },

    /**
     * Get category breakdown of earnings/spending
     * @param {string} uid - User ID
     * @param {string} role - 'freelancer' or 'client'
     * @returns {Array} Categories with amounts
     */
    getCategoryBreakdown: async (uid, role) => {
        try {
            const isFreelancer = role === 'freelancer';
            const fieldName = isFreelancer ? 'sellerId' : 'buyerId';

            const ordersRef = collection(db, 'orders');
            const q = query(
                ordersRef,
                where(fieldName, '==', uid),
                where('status', '==', 'completed')
            );
            const snapshot = await getDocs(q);

            // Group by category
            const categoryMap = {};
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const category = data.category || 'Other';
                const amount = data.total || data.price || 0;

                if (!categoryMap[category]) {
                    categoryMap[category] = { name: category, value: 0, count: 0 };
                }
                categoryMap[category].value += amount;
                categoryMap[category].count += 1;
            });

            // Convert to array and sort
            const categories = Object.values(categoryMap).sort((a, b) => b.value - a.value);

            // Add icons and colors
            const icons = {
                'Development & IT': '💻',
                'Design & Creative': '🎨',
                'Writing & Translation': '✍️',
                'AI Services': '🤖',
                'Sales & Marketing': '📢',
                'Admin & Support': '📋',
                'Other': '📦'
            };

            const colors = [
                'from-blue-500 to-blue-600',
                'from-purple-500 to-purple-600',
                'from-pink-500 to-pink-600',
                'from-blue-500 to-blue-600',
                'from-orange-500 to-orange-600'
            ];

            return categories.map((cat, i) => ({
                ...cat,
                icon: icons[cat.name] || '📦',
                color: colors[i % colors.length]
            }));
        } catch (error) {
            console.error('Error fetching category breakdown:', error);
            return [];
        }
    },

    /**
     * Get paginated transaction history
     * @param {string} uid - User ID
     * @param {string} role - 'freelancer' or 'client'
     * @param {number} page - Page number (1-indexed)
     * @param {number} perPage - Items per page
     * @returns {Object} Transactions and pagination info
     */
    getTransactions: async (uid, role, page = 1, perPage = 8) => {
        try {
            const isFreelancer = role === 'freelancer';
            const fieldName = isFreelancer ? 'sellerId' : 'buyerId';

            const ordersRef = collection(db, 'orders');
            const q = query(
                ordersRef,
                where(fieldName, '==', uid),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);

            const allTransactions = snapshot.docs.map(doc => {
                const data = doc.data();
                const createdAt = data.createdAt?.toDate?.() || new Date();

                return {
                    id: doc.id,
                    date: createdAt.toLocaleDateString('en-IN'),
                    project: data.gigTitle || 'Untitled Project',
                    client: isFreelancer ? data.buyerName : data.sellerName,
                    type: data.paymentType || 'Fixed',
                    status: data.status === 'completed' ? 'Released' :
                        data.status === 'active' ? 'In Progress' :
                            data.status === 'delivered' ? 'Pending Review' : data.status,
                    amount: data.total || data.price || 0
                };
            });

            // Paginate
            const start = (page - 1) * perPage;
            const transactions = allTransactions.slice(start, start + perPage);
            const totalPages = Math.ceil(allTransactions.length / perPage);

            return {
                transactions,
                totalCount: allTransactions.length,
                page,
                totalPages,
                hasMore: page < totalPages
            };
        } catch (error) {
            console.error('Error fetching transactions:', error);
            return {
                transactions: [],
                totalCount: 0,
                page: 1,
                totalPages: 0,
                hasMore: false
            };
        }
    },

    /**
     * Get top clients/freelancers by revenue
     * @param {string} uid - User ID
     * @param {string} role - 'freelancer' or 'client'
     * @returns {Array} Top partners
     */
    getTopPartners: async (uid, role) => {
        try {
            const isFreelancer = role === 'freelancer';
            const fieldName = isFreelancer ? 'sellerId' : 'buyerId';
            const partnerField = isFreelancer ? 'buyerId' : 'sellerId';
            const partnerNameField = isFreelancer ? 'buyerName' : 'sellerName';

            const ordersRef = collection(db, 'orders');
            const q = query(
                ordersRef,
                where(fieldName, '==', uid),
                where('status', '==', 'completed')
            );
            const snapshot = await getDocs(q);

            // Group by partner
            const partnerMap = {};
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const partnerId = data[partnerField];
                const partnerName = data[partnerNameField] || 'Unknown';
                const amount = data.total || data.price || 0;

                if (!partnerMap[partnerId]) {
                    partnerMap[partnerId] = {
                        id: partnerId,
                        name: partnerName,
                        amount: 0,
                        projects: 0,
                        rating: 4.5 // Default, could be fetched from reviews
                    };
                }
                partnerMap[partnerId].amount += amount;
                partnerMap[partnerId].projects += 1;
            });

            // Sort by amount and take top 5
            return Object.values(partnerMap)
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 5);
        } catch (error) {
            console.error('Error fetching top partners:', error);
            return [];
        }
    },

    /**
     * Get performance metrics
     * @param {string} uid - User ID
     * @param {string} role - 'freelancer' or 'client'
     * @returns {Array} Performance metrics
     */
    getPerformanceMetrics: async (uid, role) => {
        try {
            const isFreelancer = role === 'freelancer';
            const fieldName = isFreelancer ? 'sellerId' : 'buyerId';

            const ordersRef = collection(db, 'orders');
            const q = query(
                ordersRef,
                where(fieldName, '==', uid)
            );
            const snapshot = await getDocs(q);
            const orders = snapshot.docs.map(doc => doc.data());

            const totalOrders = orders.length;
            const completedOrders = orders.filter(o => o.status === 'completed').length;
            const deliveredOrders = orders.filter(o => o.status === 'delivered' || o.status === 'completed').length;

            if (isFreelancer) {
                // Freelancer metrics
                const deliveryRate = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;
                const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

                return [
                    { label: 'Completion Rate', value: completionRate, color: 'bg-blue-500' },
                    { label: 'Delivery Rate', value: deliveryRate, color: 'bg-blue-500' },
                    { label: 'Active Orders', value: Math.min(100, orders.filter(o => o.status === 'active').length * 20), color: 'bg-purple-500' },
                    { label: 'Profile Strength', value: 75, color: 'bg-yellow-400' }
                ];
            } else {
                // Client metrics
                return [
                    { label: 'Order Completion', value: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0, color: 'bg-blue-500' },
                    { label: 'Repeat Hires', value: 0, color: 'bg-blue-500' }, // Would need more complex logic
                    { label: 'Satisfaction', value: 90, color: 'bg-purple-500' },
                    { label: 'On-Budget', value: 85, color: 'bg-blue-400' }
                ];
            }
        } catch (error) {
            console.error('Error fetching performance metrics:', error);
            return [];
        }
    }
};
