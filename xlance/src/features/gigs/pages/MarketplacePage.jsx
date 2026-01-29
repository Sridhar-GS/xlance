import React, { useState, useEffect } from 'react';
import { Filter, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { gigService } from '../services/gigService';
import PageTransition from '../../../shared/components/PageTransition';
import GigCard from '../components/GigCard';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import { Button } from '../../../shared/components';

export default function MarketplacePage() {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchGigs = async () => {
    setLoading(true);
    try {
      // In real implementation, pass category/search to service
      const data = await gigService.getGigs({ category });
      let filtered = data.gigs;
      if (searchTerm) {
        filtered = filtered.filter(g => g.title.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      setGigs(filtered);
    } catch (err) {
      console.error("Failed to load gigs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGigs();
  }, [category, searchTerm]); // Add debouncing for search later

  const categories = ["All", "Development & IT", "Design & Creative", "Digital Marketing", "Writing & Translation", "Video & Animation"];

  return (
    <PageTransition>
      <main className="min-h-screen bg-background pt-24 pb-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header / Hero Search (Compact) */}
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-black text-foreground mb-4 tracking-tight">Find the perfect <span className="text-primary">freelance services</span></h1>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for any service..."
                className="w-full px-6 py-4 rounded-full border border-input bg-background text-foreground shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent text-lg outline-none pl-14 transition-all"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Button className="absolute right-2 top-2 bottom-2 rounded-full font-bold px-6">
                Search
              </Button>
            </div>

            {/* Quick Categories */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${category === cat ? 'bg-foreground text-background border-foreground' : 'bg-background text-muted-foreground border-border hover:border-foreground/50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Content */}
          {loading ? (
            <div className="flex justify-center py-20"><LoadingSpinner /></div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
                {gigs.map((gig) => (
                  <GigCard key={gig.id} gig={gig} />
                ))}
              </div>

              {gigs.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                  <p className="text-xl font-medium">No gigs found in this category.</p>
                  <button onClick={() => { setCategory('All'); setSearchTerm('') }} className="mt-4 text-primary font-bold hover:underline">Clear Filters</button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </PageTransition>
  );
}
