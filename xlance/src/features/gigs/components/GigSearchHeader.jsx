import React, { useState, useEffect } from 'react'; // React import
import { Search, MapPin } from 'lucide-react'; // Removed TrendingUp icon import from here
import { Button } from '../../../shared/components';

const JobSearchHeader = ({ onToggleFilters }) => {
    return (
        <div className="py-4 sticky top-0 z-40 transition-all bg-gray-50 backdrop-blur-md">
            <div className="max-w-[95%] xl:max-w-7xl mx-auto px-3 sm:px-5">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    {/* Main Search Bar - Floating Card Style */}
                    <div className="flex-1 w-full flex bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                        <div className="flex-1 flex items-center px-4 relative border-r border-gray-100">
                            <Search size={22} className="text-gray-400 absolute left-3" />
                            <input
                                type="text"
                                placeholder="Search for jobs..."
                                className="w-full pl-9 pr-4 py-3.5 bg-transparent focus:outline-none text-gray-900 placeholder:text-gray-500 text-base"
                            />
                        </div>
                        <div className="w-[30%] hidden md:flex items-center px-4 relative bg-gray-50/50">
                            <MapPin size={20} className="text-gray-400 absolute left-3" />
                            <input
                                type="text"
                                value="Any Location"
                                readOnly
                                className="w-full pl-8 pr-4 py-3.5 bg-transparent focus:outline-none text-gray-900 cursor-pointer font-medium"
                            />
                        </div>
                        <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-2 m-1 rounded-lg transition-colors">
                            Search
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobSearchHeader;
