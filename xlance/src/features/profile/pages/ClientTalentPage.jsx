import React, { useState, useEffect } from 'react';
import { Search, Rocket } from 'lucide-react';
import { userService } from '../../auth/services/userService';
import { Button, Card } from '../../../shared/components';
import FreelancerCard from '../../home/components/FreelancerCard';
import usePageTitle from "../../../shared/hooks/usePageTitle";

const ClientTalentPage = () => {
    usePageTitle("Find Talent");
    const [freelancers, setFreelancers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const fetchFreelancers = async () => {
            try {
                setLoading(true);
                // Fetch real users from Firestore
                const realUsers = await userService.getFreelancers();
                setFreelancers(realUsers);
            } catch (error) {
                console.error("Error fetching talent:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFreelancers();
    }, []);

    const categories = ['All', 'Development & IT', 'Design & Creative', 'Sales & Marketing', 'Writing & Translation', 'AI Services', 'Admin & Support'];

    const filteredFreelancers = freelancers.filter(f => {
        const matchesCategory = selectedCategory === 'All' ||
            f.category === selectedCategory ||
            (f.skills && f.skills.some(s => s.toLowerCase().includes(selectedCategory.toLowerCase())));
        const matchesSearch = searchQuery === '' ||
            f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.skills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Hero / Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">
                        Hire Top <span className="text-primary-600">Freelance Talent</span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Connect with expert developers, designers, and creatives ready to bring your vision to life.
                    </p>
                </div>

                {/* Search & Categories */}
                <div className="max-w-4xl mx-auto mb-10 space-y-6">
                    <Card className="p-4 bg-white border-none shadow-lg shadow-primary-900/5">
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by name or skills..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-100 text-gray-900 placeholder-gray-400 font-medium transition-all"
                                />
                            </div>
                            <Button className="px-8 hidden md:block">Search</Button>
                        </div>
                    </Card>

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

                {/* Results */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="h-96 w-full max-w-[320px] bg-gray-200 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredFreelancers.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Rocket className="text-gray-400" size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No talent found</h3>
                        <p className="text-gray-500">Try adjusting your search terms or filters.</p>
                        <Button variant="ghost" onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }} className="mt-4">
                            Clear Filters
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center">
                        {filteredFreelancers.map((freelancer, index) => (
                            <FreelancerCard key={freelancer.id || index} freelancer={freelancer} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientTalentPage;
