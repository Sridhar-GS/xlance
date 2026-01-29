import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Rocket } from 'lucide-react';
import { SERVICES } from '../../../shared/utils/constants';
import { userService } from '../../auth/services/userService';
import FreelancerCard from '../../home/components/FreelancerCard';
import Button from '../../../shared/components/Button';
import PageTransition from '../../../shared/components/PageTransition';
import { LoadingSpinner } from '../../../shared/components';

const TalentPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Get initial category from URL, default to 'All'
    // The URLs from ServicesSection will look like /talent?category=AI%20Services
    const categoryParam = searchParams.get('category');

    // State
    // State
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [freelancers, setFreelancers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Freelancers
    useEffect(() => {
        const fetchFreelancers = async () => {
            try {
                const data = await userService.getFreelancers();
                setFreelancers(data);
            } catch (error) {
                console.error("Error fetching freelancers:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFreelancers();
    }, []);

    // Sync URL param to state on mount/update
    useEffect(() => {
        if (categoryParam) {
            setSelectedCategory(categoryParam);
        }
    }, [categoryParam]);

    // Categories list: 'All' + those in SERVICES
    const categories = ['All', ...SERVICES.map(s => s.name)];

    // Filtering logic
    const filteredFreelancers = freelancers.filter(f => {
        // Category Match
        const matchesCategory = selectedCategory === 'All' ||
            f.category === selectedCategory ||
            (f.category && f.category.toLowerCase().includes(selectedCategory.toLowerCase()));

        // Search Match
        const matchesSearch = searchQuery === '' ||
            f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (f.skills && f.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));

        return matchesCategory && matchesSearch;
    });

    const handleBack = () => {
        // Navigate back to Home, preserving the selected service context if it's not 'All'
        // We pass the service name in state so ServicesSection can pick it up
        navigate('/', {
            state: {
                serviceName: selectedCategory !== 'All' ? selectedCategory : null
            }
        });
    };

    return (
        <PageTransition>
            <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    {/* Header with Back Button */}
                    <div className="mb-8">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-gray-500 hover:text-primary-600 font-medium transition-colors mb-4"
                        >
                            <ArrowLeft size={20} />
                            <span>Back to Explore Services</span>
                        </button>

                        <div className="text-center">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">
                                {selectedCategory === 'All' ? 'Browse All Talent' : `Top ${selectedCategory} Experts`}
                            </h1>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Connect with verified professionals ready to work on your project.
                            </p>
                        </div>
                    </div>

                    {/* Filters & Search */}
                    <div className="max-w-4xl mx-auto mb-10 space-y-6">
                        {/* Search Input */}
                        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-200 flex items-center">
                            <Search className="ml-4 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name or skills..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400 font-medium"
                            />
                        </div>

                        {/* Category Pills */}
                        <div className="flex flex-wrap justify-center gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all transform hover:-translate-y-0.5 ${selectedCategory === cat
                                        ? 'bg-gray-900 text-white shadow-md'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results Grid */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : filteredFreelancers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
                            {filteredFreelancers.map((freelancer) => (
                                <FreelancerCard key={freelancer.id} freelancer={freelancer} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Rocket className="text-gray-300" size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No freelancers found</h3>
                            <p className="text-gray-500 mb-6">Try adjusting your filters or search terms.</p>
                            <Button variant="outline" onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}>
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default TalentPage;
