import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { NICHES } from '../../utils/constants';
import Button from '../common/Button';
import { Link } from 'react-router-dom';

const NichesSection = () => {
  const getIcon = (iconName) => {
    const iconMap = {
      Code: <Icons.Code size={40} />,
      Smartphone: <Icons.Smartphone size={40} />,
      Palette: <Icons.Palette size={40} />,
      TrendingUp: <Icons.TrendingUp size={40} />,
    };
    return iconMap[iconName] || <Icons.Sparkles size={40} />;
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-primary-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Top Niches</h2>
          <p className="text-gray-600 text-lg">Explore the most popular services on our platform</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {NICHES.map((niche, index) => (
            <motion.div
              key={niche.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`${niche.color} rounded-2xl p-8 text-center hover:shadow-lg transition-all duration-300 cursor-pointer`}
            >
              <div className="flex justify-center mb-4 text-gray-700">
                {getIcon(niche.icon)}
              </div>
              <h3 className="font-semibold text-gray-900">{niche.name}</h3>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/">
            <Button variant="ghost" size="lg">
              Explore more niches →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NichesSection;
