import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { SERVICES } from '../../utils/constants';
import Button from '../common/Button';
import { Link } from 'react-router-dom';

const ServicesSection = () => {
  const getIcon = (iconName) => {
    const iconMap = {
      Sparkles: <Icons.Sparkles size={32} />,
      Code: <Icons.Code size={32} />,
      Palette: <Icons.Palette size={32} />,
      TrendingUp: <Icons.TrendingUp size={32} />,
      LifeBuoy: <Icons.LifeBuoy size={32} />,
      BookOpen: <Icons.BookOpen size={32} />,
    };
    return iconMap[iconName] || <Icons.Sparkles size={32} />;
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Explore our services</h2>
          <p className="text-gray-600 text-lg">Find the perfect services and connect with skilled professionals</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {SERVICES.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-effect p-8 rounded-2xl text-center hover:shadow-glass-lg transition-all duration-300 cursor-pointer"
            >
              <div className="flex justify-center mb-4 text-primary-500">
                {getIcon(service.icon)}
              </div>
              <h3 className="font-semibold text-gray-900">{service.name}</h3>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/">
            <Button variant="ghost" size="lg">
              View more categories →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
