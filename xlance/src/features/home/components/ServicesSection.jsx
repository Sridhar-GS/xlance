import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { SERVICES } from '../../../shared/utils/constants';
import { Button } from '../../../shared/components';
import { Link, useLocation } from 'react-router-dom';
import { userService } from '../../auth/services/userService';
import FreelancerCard from './FreelancerCard';

const ServicesSection = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  // Fetch freelancers when service is selected
  const fetchFreelancersForCategory = useCallback(async (categoryName) => {
    setLoading(true);
    try {
      const allFreelancers = await userService.getFreelancers();
      // Filter by category and sort by rating
      const filtered = allFreelancers
        .filter(f =>
          f.category === categoryName ||
          (f.freelancerProfile?.headline?.toLowerCase().includes(categoryName.toLowerCase())) ||
          (f.skills && f.skills.some(s => s.toLowerCase().includes(categoryName.toLowerCase())))
        )
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 3);
      setFreelancers(filtered);
    } catch (error) {
      console.error("Error fetching freelancers:", error);
      setFreelancers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (location.state?.serviceName) {
      const service = SERVICES.find(s => s.name === location.state.serviceName);
      if (service) {
        setSelectedService(service);
        fetchFreelancersForCategory(service.name);
        setTimeout(() => {
          const element = document.getElementById('explore-services');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  }, [location.state, fetchFreelancersForCategory]);

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

  const handleServiceClick = (service) => {
    if (selectedService?.id === service.id) {
      setSelectedService(null);
      setFreelancers([]);
    } else {
      setSelectedService(service);
      fetchFreelancersForCategory(service.name);
    }
  };

  return (
    <section id="explore-services" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-sky-50/50">
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
          {SERVICES.map((service, index) => {
            const isSelected = selectedService?.id === service.id;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => handleServiceClick(service)}
                className={`p-8 rounded-2xl text-center transition-all duration-300 cursor-pointer border ${isSelected
                  ? 'bg-primary-50 border-primary-200 shadow-md transform scale-[1.02]'
                  : 'glass-effect border-transparent hover:shadow-glass-lg hover:border-gray-200'
                  }`}
              >
                <div className={`flex justify-center mb-4 transition-colors ${isSelected ? 'text-primary-600' : 'text-primary-500'}`}>
                  {getIcon(service.icon)}
                </div>
                <h3 className={`font-semibold ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>{service.name}</h3>
                <motion.div
                  animate={{ rotate: isSelected ? 180 : 0 }}
                  className="mt-2 inline-block text-gray-400"
                >
                  <Icons.ChevronDown size={20} />
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Expandable Freelancer Section */}
        <AnimatePresence mode="wait">
          {selectedService && (
            <motion.div
              key="freelancers-grid"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-12">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Top Rated {selectedService.name} Experts</h3>
                    <p className="text-gray-500">Verified professionals ready to work</p>
                  </div>
                  <Link to={`/talent?category=${encodeURIComponent(selectedService.name)}`}>
                    <Button variant="outline" className="hidden sm:flex items-center gap-2">
                      View All <Icons.ArrowRight size={16} />
                    </Button>
                  </Link>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : freelancers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {freelancers.map((freelancer) => (
                      <FreelancerCard key={freelancer.id} freelancer={freelancer} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <Icons.UserX size={48} className="mx-auto text-gray-300 mb-4" />
                    <h4 className="text-lg font-semibold text-gray-600">No freelancers found</h4>
                    <p className="text-gray-500 mb-4">Be the first to join as a {selectedService.name} expert!</p>
                    <Link to="/auth/signup">
                      <Button variant="outline">Join as Freelancer</Button>
                    </Link>
                  </div>
                )}

                <div className="mt-8 sm:hidden text-center">
                  <Link to={`/talent?category=${encodeURIComponent(selectedService.name)}`}>
                    <Button className="w-full">View All Experts</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center">
          <Link to="/talent">
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
