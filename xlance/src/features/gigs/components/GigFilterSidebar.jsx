import React, { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, Search, Check } from 'lucide-react';

const FilterSection = ({ title, children, defaultOpen = true }) => {
    // ... same as before
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-gray-100 py-5 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full group mb-2"
            >
                <h4 className="font-bold text-gray-900 text-sm group-hover:text-primary-600 transition-colors uppercase tracking-wide">{title}</h4>
                <div className={`p-1 rounded-full group-hover:bg-primary-50 transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={14} className="text-gray-400 group-hover:text-primary-600" />
                </div>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                <div className="space-y-3">
                    {children}
                </div>
            </div>
        </div>
    );
};

const Checkbox = ({ label, count }) => (
    <label className="flex items-center justify-between cursor-pointer group select-none">
        <div className="flex items-center gap-3 relative">
            <div className="relative">
                <input type="checkbox" className="peer sr-only" />
                <div className="w-5 h-5 rounded-md border-2 border-gray-300 peer-checked:bg-primary-600 peer-checked:border-primary-600 transition-all duration-200 flex items-center justify-center group-hover:border-primary-400 bg-white">
                    <Check size={12} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200 transform scale-0 peer-checked:scale-100" strokeWidth={3} />
                </div>
                {/* Explicit Tick for Checked State managed by CSS sibling selector */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 peer-checked:opacity-100">
                    <Check size={12} className="text-white" strokeWidth={3} />
                </div>
            </div>
            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 peer-checked:text-gray-900 peer-checked:font-semibold transition-colors">{label}</span>
        </div>
        {count && (
            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full group-hover:text-primary-600 group-hover:bg-primary-50 transition-colors">
                {count}
            </span>
        )}
    </label>
);

const JobFilterSidebar = ({ counts = {} }) => {
    return (
        <aside className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <Filter size={20} className="text-primary-600" /> Filters
                </h3>
                <button className="text-xs font-bold text-gray-400 hover:text-primary-600 transition-colors uppercase tracking-wider">
                    Reset
                </button>
            </div>

            <FilterSection title="Category" defaultOpen={true}>
                <Checkbox label="Development & IT" count={counts.category?.['Development & IT'] || 0} />
                <Checkbox label="Design & Creative" count={counts.category?.['Design & Creative'] || 0} />
                <Checkbox label="Sales & Marketing" count={counts.category?.['Sales & Marketing'] || 0} />
                <Checkbox label="Writing" count={counts.category?.['Writing'] || 0} />
                <Checkbox label="AI Services" count={counts.category?.['AI Services'] || 0} />
            </FilterSection>

            <FilterSection title="Job Type">
                <Checkbox label="Hourly" count={counts.jobType?.['hourly'] || 0} />
                <Checkbox label="Fixed-Price" count={counts.jobType?.['fixed-price'] || 0} />
            </FilterSection>

            <FilterSection title="Experience Level">
                <Checkbox label="Entry Level" count={counts.level?.['entry'] || 0} />
                <Checkbox label="Intermediate" count={counts.level?.['intermediate'] || 0} />
                <Checkbox label="Expert" count={counts.level?.['expert'] || 0} />
            </FilterSection>

            <FilterSection title="Budget">
                <div className="flex items-center gap-2 mb-3">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₹</span>
                        <input type="number" placeholder="Min" className="w-full pl-6 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none" />
                    </div>
                    <span className="text-gray-300 font-medium">-</span>
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₹</span>
                        <input type="number" placeholder="Max" className="w-full pl-6 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none" />
                    </div>
                </div>
                <button className="w-full py-2 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gray-800 transition-colors">
                    Apply Price
                </button>
            </FilterSection>

            <FilterSection title="Project Length">
                <Checkbox label="< 1 month" count={counts.duration?.['less_1_month'] || 0} />
                <Checkbox label="1 to 3 months" count={counts.duration?.['1_3_months'] || 0} />
                <Checkbox label="3 to 6 months" count={counts.duration?.['3_6_months'] || 0} />
                <Checkbox label="> 6 months" count={counts.duration?.['more_6_months'] || 0} />
            </FilterSection>
        </aside>
    );
};

export default JobFilterSidebar;
