import React from 'react';
import { motion } from 'framer-motion';
import BlurText from '../../../shared/components/BlurText';
import { Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../../shared/components';
import { FEATURE_TAGS } from '../../../shared/utils/constants';

const HeroSection = () => {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-background min-h-[80vh] flex flex-col justify-center">
      <div className="max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-black text-foreground mb-6 leading-tight tracking-tight">
            <span className="block mb-2">
              Your Trusted Hub for
            </span>
            <span className="text-primary inline-block">
              Freelance in India
            </span>
          </h1>

          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
            Connect with top talent or find your next project. Secure payments, AI matching, and transparent communication - all built for India.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-card border border-border rounded-2xl shadow-lg p-2 mb-12 max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-4 py-3 border border-transparent focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <Search className="text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search for any service..."
              className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground font-medium"
            />
            <button className="p-2 hover:bg-background rounded-lg transition-colors border border-transparent hover:border-border">
              <Filter size={20} className="text-primary" />
            </button>
            <Button size="sm" className="ml-2">Search</Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {FEATURE_TAGS.map((tag, index) => (
            <div key={index} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-primary transition-colors cursor-default`}>
              <span className={`w-2 h-2 rounded-full ${index % 2 === 0 ? 'bg-green-500' : 'bg-blue-500'}`} />
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
          <Link to="/auth/signup" state={{ role: 'freelancer' }}>
            <Button size="lg" className="w-full sm:w-auto text-lg h-14 bg-foreground text-background hover:bg-foreground/90">
              Get Started as Freelancer
            </Button>
          </Link>
          <Link to="/auth/signup" state={{ role: 'client' }}>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14">
              Hire Talent
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
