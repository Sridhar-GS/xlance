import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input } from '../../../shared/components';
import PageTransition from '../../../shared/components/PageTransition';
import { useAuth } from '../../auth/context/AuthContext';
import { gigService } from '../services/gigService';
import { Upload } from 'lucide-react';

const CreateGigPage = () => {
    const navigate = useNavigate();
    const { user, userProfile } = useAuth();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Development & IT', // Default
        price: '',
        deliveryTime: '3', // Days
        gigImage: '',
        features: '' // Internal comma-separated
    });

    const [touched, setTouched] = useState({});
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const categories = [
        "Development & IT",
        "Design & Creative",
        "Digital Marketing",
        "Writing & Translation",
        "Video & Animation",
        "Music & Audio",
        "Business",
        "Consulting"
    ];

    const validateField = (name, value) => {
        if (!value && name !== 'features') return "This field is required";
        if (name === 'price' && Number(value) < 5) return "Minimum price is ₹5";
        if (name === 'deliveryTime' && Number(value) < 1) return "Minimum 1 day delivery";
        if (name === 'title' && value.length < 15) return "Title must be at least 15 characters";
        return "";
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (touched[name]) {
            setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        // Final Validation
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
            return;
        }

        setIsLoading(true);
        setSubmitError(null);

        try {
            const gigData = {
                sellerId: user.uid,
                title: formData.title,
                description: formData.description,
                category: formData.category,
                price: Number(formData.price),
                deliveryTime: Number(formData.deliveryTime),
                image: formData.gigImage || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop", // Default geometric
                features: formData.features.split(',').map(s => s.trim()).filter(Boolean),
                seller: {
                    name: user.displayName || userProfile?.name || "Seller",
                    avatar: user.photoURL || userProfile?.photoURL || "",
                    level: userProfile?.level || "New Seller"
                }
            };

            await gigService.createGig(gigData);
            navigate('/dashboard/freelancer'); // Redirect to Seller Dashboard
        } catch (err) {
            console.error("Error creating gig:", err);
            setSubmitError("Failed to create Gig. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to render error
    const renderError = (name) => errors[name] ? <p className="text-red-500 text-xs mt-1 font-bold pl-1">{errors[name]}</p> : null;

    return (
        <PageTransition>
            <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Create a New Gig</h1>
                        <p className="text-gray-500 mt-2">Showcase your services to millions of potential buyers.</p>
                    </div>

                    <Card className="p-0 border-none shadow-xl overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div> {/* Brand Blue */}

                        <div className="p-8 sm:p-10">
                            {submitError && (
                                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100">
                                    {submitError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                                <div className="space-y-6">
                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Gig Title</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">I will</span>
                                            <input
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className={`w-full pl-16 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-medium transition-all ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                                                placeholder="do something I'm really good at"
                                            />
                                        </div>
                                        {renderError('title')}
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                                        >
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    {/* Image URL (Simple for MVP) */}
                                    <div>
                                        <Input
                                            label="Gig Cover Image (URL)"
                                            name="gigImage"
                                            value={formData.gigImage}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="https://example.com/my-gig-cover.jpg"
                                            className={errors.gigImage ? 'border-red-500' : ''}
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Paste a direct link to an image (Unsplash, etc.)</p>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            rows={6}
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="Describe your service in detail..."
                                        />
                                        {renderError('description')}
                                    </div>

                                    {/* Pricing Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-xl border border-gray-100">
                                        <div>
                                            <Input
                                                label="Price (₹)"
                                                name="price"
                                                type="number"
                                                value={formData.price}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="500"
                                                className={errors.price ? 'border-red-500' : ''}
                                            />
                                            {renderError('price')}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Time (Days)</label>
                                            <input
                                                type="number"
                                                name="deliveryTime"
                                                value={formData.deliveryTime}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                min="1"
                                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${errors.deliveryTime ? 'border-red-500' : 'border-gray-300'}`}
                                            />
                                            {renderError('deliveryTime')}
                                        </div>
                                    </div>

                                    <div>
                                        <Input
                                            label="Key Features (Comma separated)"
                                            name="features"
                                            value={formData.features}
                                            onChange={handleChange}
                                            placeholder="Source File, High Resolution, 3 Revisions..."
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 flex items-center justify-end gap-4 border-t border-gray-100">
                                    <Button variant="ghost" type="button" onClick={() => navigate(-1)}>Cancel</Button>
                                    <Button type="submit" isLoading={isLoading} className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-xl shadow-lg">
                                        Publish Gig
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Card>
                </div>
            </main>
        </PageTransition>
    );
};

export default CreateGigPage;
