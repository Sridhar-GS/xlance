import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { NICHES } from '../../../shared/utils/constants';
import { Button } from '../../../shared/components';
import { Link } from 'react-router-dom';

const NichesSection = () => {
  const getIcon = (iconName) => {
    const iconMap = {
      Code: <Icons.Code size={48} />,
      Smartphone: <Icons.Smartphone size={48} />,
      Palette: <Icons.Palette size={48} />,
      TrendingUp: <Icons.TrendingUp size={48} />,
    };
    return iconMap[iconName] || <Icons.Sparkles size={48} />;
  };

  const getGradientClasses = (id) => {
    const gradients = {
      1: 'bg-gradient-to-br from-orange-400 to-red-500',
      2: 'bg-gradient-to-br from-blue-400 to-blue-600',
      3: 'bg-gradient-to-br from-blue-400 to-indigo-500',
      4: 'bg-gradient-to-br from-yellow-400 to-amber-500',
    };
    return gradients[id] || 'bg-gradient-to-br from-gray-400 to-gray-500';
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {NICHES.map((niche, index) => (
            <motion.div
              key={niche.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col items-center text-center"
            >
              <div className={`${getGradientClasses(niche.id)} rounded-2xl p-6 mb-4 text-white shadow-lg transform hover:scale-110 transition-transform duration-300`}>
                {getIcon(niche.icon)}
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">{niche.name}</h3>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/">
            <Button variant="ghost" size="lg" className="text-primary-600 hover:text-primary-700">
              Explore more niches →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NichesSection;
