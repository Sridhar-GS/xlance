import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Users, DollarSign, CheckCircle } from 'lucide-react';
import { Card, Button } from '../common';
import { Link } from 'react-router-dom';

const ClientDashboard = () => {
  const stats = [
    { label: 'Posted Jobs', value: '5', icon: Briefcase, color: 'text-blue-600' },
    { label: 'Freelancers Hired', value: '8', icon: Users, color: 'text-green-600' },
    { label: 'Total Spent', value: '₹2,50,000', icon: DollarSign, color: 'text-purple-600' },
    { label: 'Completed Projects', value: '12', icon: CheckCircle, color: 'text-yellow-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back, Client</h1>
          <p className="text-gray-600">Manage your projects and team</p>
        </div>
        <Link to="/">
          <Button>Post a New Job</Button>
        </Link>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Posted Jobs</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start justify-between pb-4 border-b border-gray-200 last:border-b-0">
                <div>
                  <h3 className="font-semibold text-gray-900">Mobile App Development</h3>
                  <p className="text-sm text-gray-600">12 proposals received</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                  Open
                </span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ClientDashboard;
