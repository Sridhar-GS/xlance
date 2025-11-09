import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, DollarSign, Star, TrendingUp } from 'lucide-react';
import { Card } from '../common';

const FreelancerDashboard = () => {
  const stats = [
    { label: 'Active Projects', value: '3', icon: Briefcase, color: 'text-blue-600' },
    { label: 'Total Earnings', value: '₹45,230', icon: DollarSign, color: 'text-green-600' },
    { label: 'Rating', value: '4.8/5', icon: Star, color: 'text-yellow-600' },
    { label: 'Profile Views', value: '234', icon: TrendingUp, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back, Freelancer</h1>
        <p className="text-gray-600">Here's your performance overview</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 text-center">
              <div className={`flex justify-center mb-4 ${stat.color}`}>
                <stat.icon size={32} />
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.label}</h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Jobs</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start justify-between pb-4 border-b border-gray-200 last:border-b-0">
                <div>
                  <h3 className="font-semibold text-gray-900">Web Development Project</h3>
                  <p className="text-sm text-gray-600">Posted 2 days ago</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  In Progress
                </span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default FreelancerDashboard;
