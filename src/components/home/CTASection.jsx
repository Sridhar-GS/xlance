import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

const CTASection = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto glass-effect-strong rounded-3xl p-12 md:p-16 text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Ready to get started?</h2>
        <p className="text-lg text-gray-600 mb-8">
          Join thousands of freelancers and clients already working on Xlance. Find your next opportunity or perfect match today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/auth/signup">
            <Button size="lg">Join as Freelancer</Button>
          </Link>
          <Link to="/auth/signup">
            <Button size="lg" variant="outline">
              Post Your First Job
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;
