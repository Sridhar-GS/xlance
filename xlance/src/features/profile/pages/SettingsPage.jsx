import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { userService } from '../../auth/services/userService';
import { Card, Button, Input } from '../../../shared/components';
import PageTransition from '../../../shared/components/PageTransition';
import { User, Mail, Briefcase, DollarSign, Save, Camera } from 'lucide-react';

const SettingsPage = () => {
    const { user, userProfile, setUserProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        photoURL: '',
        skills: '',
        hourlyRate: '',
        title: '' // Professional Headline
    });

    useEffect(() => {
        if (userProfile) {
            setFormData({
                name: userProfile.name || '',
                bio: userProfile.bio || '',
                photoURL: userProfile.photoURL || '',
                skills: userProfile.skills ? userProfile.skills.join(', ') : '',
                hourlyRate: userProfile.hourlyRate || '',
                title: userProfile.title || ''
            });
        }
    }, [userProfile]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            // Prepare update payload
            const updates = {
                name: formData.name,
                bio: formData.bio,
                photoURL: formData.photoURL,
                title: formData.title,
                updatedAt: new Date().toISOString()
            };

            // Freelancer specific fields
            if (userProfile?.role?.includes('freelancer')) {
                updates.hourlyRate = formData.hourlyRate;
                updates.skills = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
            }

            // Update in Firestore
            await userService.updateUserProfile(user.uid, updates);

            // Update local context (Optimistic UI would be better, but this ensures sync)
            const newProfile = await userService.getUserProfile(user.uid);
            setUserProfile(newProfile);

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to update profile:", error);
            alert("Failed to save changes. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const isFreelancer = userProfile?.role?.includes('freelancer');

    return (
        <PageTransition>
            <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-background min-h-screen transition-colors duration-300">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-foreground tracking-tight">Account Settings</h1>
                        <p className="text-muted-foreground mt-1">Manage your profile information and preferences.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-8">

                            {/* Profile Header Card */}
                            <Card className="p-8 bg-card border-border">
                                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                                    <User size={20} className="text-primary" /> Basic Info
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Avatar Section */}
                                    <div className="col-span-full flex items-center gap-4 mb-2">
                                        <div className="w-20 h-20 rounded-full bg-muted overflow-hidden border-2 border-border shadow-sm">
                                            {formData.photoURL ? (
                                                <img src={formData.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-secondary text-muted-foreground">
                                                    <User size={32} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-foreground mb-1">Avatar URL</label>
                                            <Input
                                                name="photoURL"
                                                value={formData.photoURL}
                                                onChange={handleChange}
                                                placeholder="https://example.com/me.jpg"
                                                className="bg-background"
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">Paste a direct image link (hosting service coming soon).</p>
                                        </div>
                                    </div>

                                    <div className="col-span-full md:col-span-1">
                                        <label className="block text-sm font-medium text-foreground mb-1">Display Name</label>
                                        <Input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            required
                                            className="bg-background"
                                        />
                                    </div>

                                    <div className="col-span-full md:col-span-1">
                                        <label className="block text-sm font-medium text-foreground mb-1">Email Address</label>
                                        <div className="relative">
                                            <Input
                                                value={user?.email || ''}
                                                disabled
                                                className="bg-muted text-muted-foreground pl-10 cursor-not-allowed"
                                            />
                                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        </div>
                                    </div>

                                    <div className="col-span-full">
                                        <label className="block text-sm font-medium text-foreground mb-1">Headline</label>
                                        <Input
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="e.g. Senior Full Stack Developer"
                                            className="bg-background"
                                        />
                                    </div>

                                    <div className="col-span-full">
                                        <label className="block text-sm font-medium text-foreground mb-1">Bio</label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            rows={4}
                                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>
                                </div>
                            </Card>

                            {/* Freelancer Specifics */}
                            {isFreelancer && (
                                <Card className="p-8 bg-card border-border">
                                    <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                                        <Briefcase size={20} className="text-primary" /> Professional Details
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="col-span-full md:col-span-1">
                                            <label className="block text-sm font-medium text-foreground mb-1">Hourly Rate ($)</label>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    name="hourlyRate"
                                                    value={formData.hourlyRate}
                                                    onChange={handleChange}
                                                    placeholder="50"
                                                    className="bg-background pl-8"
                                                />
                                                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                            </div>
                                        </div>

                                        <div className="col-span-full">
                                            <label className="block text-sm font-medium text-foreground mb-1">Skills (comma separated)</label>
                                            <Input
                                                name="skills"
                                                value={formData.skills}
                                                onChange={handleChange}
                                                placeholder="React, Node.js, Design, Writing"
                                                className="bg-background"
                                            />
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* Action Bar */}
                            <div className="flex items-center justify-end gap-4">
                                {success && (
                                    <span className="text-green-600 font-medium flex items-center gap-2 animate-fade-in">
                                        <CheckCircle2 size={18} /> Saved Successfully
                                    </span>
                                )}
                                <Button type="submit" size="lg" isLoading={loading} className="px-8 shadow-xl">
                                    <Save size={18} className="mr-2" /> Save Changes
                                </Button>
                            </div>

                        </div>
                    </form>
                </div>
            </main>
        </PageTransition>
    );
};
import { CheckCircle2 } from 'lucide-react'; // Late import fix

export default SettingsPage;
