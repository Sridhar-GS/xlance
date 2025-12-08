import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Circle, User, Mail, Briefcase, MapPin, DollarSign, Award, Save, Edit2, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';

const ProfileCompletionModal = ({ isOpen, onClose }) => {
  const { userProfile, user } = useAuth();
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const profileFields = useMemo(() => {
    if (!userProfile && !user) return [];

    return [
      {
        id: 'name',
        label: 'Full Name',
        icon: User,
        value: userProfile?.name || user?.displayName || '',
        completed: !!(userProfile?.name || user?.displayName),
        type: 'text',
        placeholder: 'Enter your full name',
        category: 'basic',
      },
      {
        id: 'email',
        label: 'Email Address',
        icon: Mail,
        value: userProfile?.email || user?.email || '',
        completed: !!(userProfile?.email || user?.email),
        type: 'email',
        placeholder: 'your@email.com',
        category: 'basic',
        readonly: true,
      },
      {
        id: 'photoURL',
        label: 'Profile Photo',
        icon: Upload,
        value: userProfile?.photoURL || user?.photoURL || '',
        completed: !!(userProfile?.photoURL || user?.photoURL),
        type: 'file',
        placeholder: 'Upload profile photo',
        category: 'basic',
      },
      {
        id: 'role',
        label: 'Professional Role',
        icon: Briefcase,
        value: userProfile?.role ? (Array.isArray(userProfile.role) ? userProfile.role.join(', ') : userProfile.role) : '',
        completed: !!(userProfile?.role && (Array.isArray(userProfile.role) ? userProfile.role.length > 0 : userProfile.role)),
        type: 'select',
        options: ['Freelancer', 'Client', 'Both'],
        placeholder: 'Select your role',
        category: 'role',
      },
      {
        id: 'skills',
        label: 'Skills & Expertise',
        icon: Award,
        value: userProfile?.skills ? (Array.isArray(userProfile.skills) ? userProfile.skills.join(', ') : userProfile.skills) : '',
        completed: !!(userProfile?.skills && Array.isArray(userProfile.skills) && userProfile.skills.length > 0),
        type: 'text',
        placeholder: 'e.g., React, Python, UI/UX Design',
        category: 'role',
      },
      {
        id: 'bio',
        label: 'Professional Bio',
        icon: User,
        value: userProfile?.bio || userProfile?.description || '',
        completed: !!(userProfile?.bio || userProfile?.description),
        type: 'textarea',
        placeholder: 'Tell us about your expertise and experience...',
        category: 'role',
      },
      {
        id: 'experienceLevel',
        label: 'Experience Level',
        icon: Award,
        value: userProfile?.experienceLevel || userProfile?.experience || '',
        completed: !!(userProfile?.experienceLevel || userProfile?.experience),
        type: 'select',
        options: ['Beginner', 'Intermediate', 'Expert', 'Professional'],
        placeholder: 'Select experience level',
        category: 'professional',
      },
      {
        id: 'location',
        label: 'Location',
        icon: MapPin,
        value: userProfile?.location || '',
        completed: !!(userProfile?.location),
        type: 'text',
        placeholder: 'e.g., Mumbai, India',
        category: 'professional',
      },
      {
        id: 'hourlyRate',
        label: 'Hourly Rate (₹)',
        icon: DollarSign,
        value: userProfile?.hourlyRate || userProfile?.rate || '',
        completed: !!(userProfile?.hourlyRate || userProfile?.rate),
        type: 'number',
        placeholder: 'e.g., 1500',
        category: 'professional',
      },
    ];
  }, [userProfile, user]);

  const totalFields = profileFields.length;
  const completedFields = profileFields.filter(f => f.completed).length;
  const completionPercentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

  const handleEdit = (field) => {
    setEditingField(field.id);
    setFormData({ [field.id]: field.value });
  };

  const handleCancel = () => {
    setEditingField(null);
    setFormData({});
  };

  const handleSave = async (field) => {
    setSaving(true);
    try {
      // Simulate save - replace with actual Firestore update
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('Saving field:', field.id, formData[field.id]);
      
      // TODO: Add actual Firestore update here
      // await updateUserProfile(user.uid, { [field.id]: formData[field.id] });
      
      setEditingField(null);
      setFormData({});
    } catch (error) {
      console.error('Error saving field:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderFieldInput = (field) => {
    const isEditing = editingField === field.id;
    const value = isEditing ? (formData[field.id] ?? field.value) : field.value;

    if (field.readonly) {
      return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-sm text-gray-700">{value || 'Not set'}</span>
          <span className="text-xs text-gray-500 italic">Read-only</span>
        </div>
      );
    }

    // Special handling for photo upload
    if (field.type === 'file') {
      if (!isEditing) {
        return (
          <div className="flex items-center gap-3">
            {value ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-200 transition group flex-1">
                <img src={value} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                <span className="text-sm text-gray-700 flex-1">Photo uploaded</span>
                <button
                  onClick={() => handleEdit(field)}
                  className="p-1.5 rounded-md text-primary-600 hover:bg-primary-50 transition opacity-0 group-hover:opacity-100"
                  title="Change photo"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleEdit(field)}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50/30 transition group"
              >
                <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-primary-600">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">Click to upload profile photo</span>
                  <span className="text-xs">PNG, JPG up to 5MB</span>
                </div>
              </button>
            )}
          </div>
        );
      }

      return (
        <div className="space-y-3">
          <label className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-primary-300 rounded-lg bg-primary-50/30 cursor-pointer hover:bg-primary-50 transition">
            <svg className="w-12 h-12 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div className="text-center">
              <span className="text-sm font-semibold text-primary-700">Drop your photo here or click to browse</span>
              <p className="text-xs text-gray-600 mt-1">Supports: JPG, PNG, GIF (Max 5MB)</p>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Preview the image
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setFormData({ ...formData, [field.id]: reader.result });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </label>
          
          {formData[field.id] && (
            <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
              <img src={formData[field.id]} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Preview</p>
                <p className="text-xs text-gray-500">New profile photo</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleSave(field)}
              disabled={saving || !formData[field.id]}
              isLoading={saving}
              className="flex-1"
            >
              <Save size={14} className="mr-1" />
              Save Photo
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              disabled={saving}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      );
    }

    if (!isEditing) {
      return (
        <div className="flex items-center justify-between p-3.5 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-sm transition-all group">
          <span className="text-sm text-gray-800 flex-1 truncate font-medium">
            {value || <span className="text-gray-400 font-normal italic">{field.placeholder}</span>}
          </span>
          <button
            onClick={() => handleEdit(field)}
            className="ml-2 p-2 rounded-lg text-primary-600 bg-white hover:bg-primary-50 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="relative">
          {field.type === 'textarea' ? (
            <textarea
              value={value}
              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
              placeholder={field.placeholder}
              rows={4}
              className="w-full px-4 py-3 border-2 border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white shadow-sm transition-all resize-none"
            />
          ) : field.type === 'select' ? (
            <div className="relative">
              <select
                value={value}
                onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                className="w-full px-4 py-3 border-2 border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white shadow-sm appearance-none cursor-pointer transition-all"
              >
                <option value="">{field.placeholder}</option>
                {field.options?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          ) : (
            <input
              type={field.type}
              value={value}
              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
              placeholder={field.placeholder}
              className="w-full px-4 py-3 border-2 border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white shadow-sm transition-all"
            />
          )}
          
          {/* Character count for textarea */}
          {field.type === 'textarea' && value && (
            <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded">
              {value.length} characters
            </div>
          )}

          {/* Prefix icon for number inputs */}
          {field.type === 'number' && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleSave(field)}
            disabled={saving || !formData[field.id]}
            isLoading={saving}
            className="flex-1 shadow-md hover:shadow-lg transition-shadow"
          >
            <Save size={14} className="mr-1.5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
            className="px-6"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-2xl bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Unique Gradient Header with Glassmorphism */}
            <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-purple-600 p-8 overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
              
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition"
                aria-label="Close"
              >
                <X size={20} className="text-white" />
              </button>

              <div className="relative flex items-start gap-6">
                {/* Animated Progress Ring */}
                <div className="relative">
                  <svg className="transform -rotate-90 w-24 h-24">
                    <circle
                      cx="48"
                      cy="48"
                      r="44"
                      stroke="white"
                      strokeWidth="6"
                      fill="none"
                      className="opacity-20"
                    />
                    <motion.circle
                      cx="48"
                      cy="48"
                      r="44"
                      stroke="white"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 44}`}
                      strokeDashoffset={`${2 * Math.PI * 44 * (1 - completionPercentage / 100)}`}
                      className="drop-shadow-lg"
                      strokeLinecap="round"
                      initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - completionPercentage / 100) }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{completionPercentage}%</div>
                      <div className="text-xs text-white/80">Complete</div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 text-white">
                  <h2 className="text-3xl font-bold mb-2">Complete Your Profile</h2>
                  <p className="text-white/90 text-sm mb-3">
                    Fill in your details to unlock all features and get better job matches
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 size={16} />
                    <span>{completedFields} of {totalFields} fields completed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Body with Editable Fields */}
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              {profileFields.map((field) => {
                const Icon = field.icon;
                
                return (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      field.completed 
                        ? 'border-green-200 bg-green-50/50' 
                        : editingField === field.id
                        ? 'border-primary-300 bg-primary-50/50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-lg flex-shrink-0 ${
                        field.completed ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Icon size={18} className={field.completed ? 'text-green-600' : 'text-gray-600'} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{field.label}</h3>
                          {field.completed && (
                            <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                          )}
                        </div>
                        
                        {renderFieldInput(field)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {completionPercentage === 100 ? (
                    <span className="text-green-600 font-semibold flex items-center gap-2">
                      <CheckCircle2 size={16} />
                      Profile Complete! 🎉
                    </span>
                  ) : (
                    <span>Complete your profile to stand out</span>
                  )}
                </div>
                <Button onClick={onClose}>
                  Done
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfileCompletionModal;
