import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { FEATURE_TAGS } from '../../utils/constants';

const HeroSection = () => {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Your Trusted Hub for<br />
            <span className="text-gradient">Freelance in India</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with top talent or find your next project. Secure payments, AI matching, and transparent communication - all built for India.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-4 mb-8"
        >
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-3">
            <Search className="text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search To Filter..."
              className="flex-1 bg-transparent outline-none text-gray-600 placeholder-gray-400"
            />
            <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
              <Filter size={20} className="text-primary-500" />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {FEATURE_TAGS.map((tag, index) => (
            <div key={index} className={`${tag.color} px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2`}>
              <span className="w-2 h-2 rounded-full bg-current" />
              {tag.label}
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/auth/signup">
            <Button size="lg">Get Started as Freelancer</Button>
          </Link>
          <Link to="/auth/signup">
            <Button size="lg" variant="outline">
              Post a Job
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
