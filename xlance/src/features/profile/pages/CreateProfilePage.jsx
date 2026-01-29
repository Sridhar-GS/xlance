import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input } from '../../../shared/components';
import PageTransition from '../../../shared/components/PageTransition';
import { useAuth } from '../../auth/context/AuthContext';
import { userService } from '../../auth/services/userService';

const states = ['Select a state', 'Andhra Pradesh', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Delhi', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Kerala'];

const CreateProfilePage = () => {
  const { user, userProfile, setUserProfile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: userProfile?.name || '',
    email: user?.email || '',
    phone: userProfile?.phone || '',
    headline: userProfile?.freelancerProfile?.headline || '',
    skills: userProfile?.skills?.join(', ') || '',
    summary: userProfile?.bio || '',
    state: userProfile?.location?.split(',')[1]?.trim() || states[0],
    address: userProfile?.location?.split(',')[0]?.trim() || '',
    language: userProfile?.languages?.join(', ') || 'English',
  });
  const [photoPreview, setPhotoPreview] = useState(userProfile?.avatar || null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user?.uid) {
      setError('You must be logged in to save your profile');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const profileData = {
        name: form.fullName,
        phone: form.phone,
        bio: form.summary,
        location: form.address && form.state !== states[0] ? `${form.address}, ${form.state}` : form.address || form.state,
        languages: form.language.split(',').map(l => l.trim()).filter(Boolean),
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        freelancerProfile: {
          ...userProfile?.freelancerProfile,
          headline: form.headline,
        },
        avatar: photoPreview || userProfile?.avatar || '',
      };

      await userService.updateUserProfile(user.uid, profileData);

      // Update local state
      if (setUserProfile) {
        setUserProfile(prev => ({ ...prev, ...profileData }));
      }

      navigate('/dashboard/freelancer');
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageTransition>
      <main className="min-h-screen flex items-start justify-center py-16 px-4 pt-28">
        <div className="w-full max-w-2xl">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-1">Create your Freelancer Profile</h2>
            <p className="text-sm text-gray-500 mb-6">This information will be displayed on your public profile.</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              <section>
                <h3 className="font-medium text-gray-900 mb-4">Personal Details</h3>
                <div className="grid grid-cols-1 gap-4">
                  <Input label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} required />
                  <Input label="Email Address" name="email" value={form.email} onChange={handleChange} disabled />
                  <Input label="Phone Number" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 000 000 0000" />

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border">
                      {photoPreview ? (
                        <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-gray-400 text-xs text-center">No photo</div>
                      )}
                    </div>
                    <div>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                        <Button type="button" variant="outline" size="sm">Upload Photo</Button>
                      </label>
                      <p className="text-xs text-gray-400 mt-1">Recommended size: 400x400px</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="font-medium text-gray-900 mb-4">Professional Details</h3>
                <div className="grid grid-cols-1 gap-4">
                  <Input label="Professional Headline" name="headline" value={form.headline} onChange={handleChange} placeholder="e.g. Senior Web Developer" />
                  <Input label="Skills (comma separated)" name="skills" value={form.skills} onChange={handleChange} placeholder="e.g. HTML, CSS, JavaScript, React" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Summary / About You</label>
                    <textarea name="summary" value={form.summary} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary-500" rows={5} placeholder="Write about yourself..."></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <select name="state" value={form.state} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200">
                        {states.map((s, i) => (
                          <option key={i} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <Input label="City / Address" name="address" value={form.address} onChange={handleChange} />
                  </div>

                  <Input label="Languages (comma separated)" name="language" value={form.language} onChange={handleChange} placeholder="e.g. English, Hindi, Spanish" />
                </div>
              </section>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
                <Button type="submit" isLoading={isSaving}>Save Profile</Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </PageTransition>
  );
};

export default CreateProfilePage;
