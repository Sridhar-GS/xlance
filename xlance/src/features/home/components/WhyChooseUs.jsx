import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { FEATURES } from '../../../shared/utils/constants';

const WhyChooseUs = () => {
  const getIcon = (iconName) => {
    const iconMap = {
      Lock: <Icons.Lock size={32} />,
      MessageSquare: <Icons.MessageSquare size={32} />,
      PieChart: <Icons.PieChart size={32} />,
      Zap: <Icons.Zap size={32} />,
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
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
          <p className="text-gray-600 text-lg">Discover the Xlance advantage for your freelance needs</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-effect p-8 rounded-2xl"
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-100 text-primary-600">
                    {getIcon(feature.icon)}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
