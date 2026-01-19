import React, { useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, User, Briefcase, MapPin, IndianRupee, Award, Edit2, Upload, Star, ShieldCheck, Zap, Laptop, Users, Rocket, Trophy, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { storage } from '../../services/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Button from './Button';

const ProfileCompletionModal = ({ isOpen, onClose }) => {
  const { userProfile, user } = useAuth();
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  // Crop State
  const [cropImage, setCropImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const imageRef = useRef(null);

  const profileFields = useMemo(() => {
    if (!userProfile && !user) return [];

    const p = userProfile || {};
    const fl = p.freelancerProfile || {};

    // Robust role check (case-insensitive)
    const roles = Array.isArray(p.role) ? p.role : (p.role ? [p.role] : []);
    const isClient = roles.some(r => String(r).toLowerCase() === 'client');

    return [
      {
        id: 'name',
        label: 'Full Name',
        icon: User,
        value: p.name || user?.displayName || '',
        completed: !!(p.name || user?.displayName),
        type: 'text',
        placeholder: 'Enter your full name',
        category: 'Basic',
      },
      {
        id: 'photoURL',
        label: 'Profile Photo',
        icon: Upload,
        value: p.photoURL || user?.photoURL || '',
        completed: !!(p.photoURL || user?.photoURL),
        type: 'file',
        placeholder: 'Paste photo URL (or upload)',
        category: 'Basic',
      },
      {
        id: 'role',
        label: 'Professional Role',
        icon: Briefcase,
        value: p.role ? (Array.isArray(p.role) ? p.role.join(', ') : p.role) : '',
        completed: !!(p.role && (Array.isArray(p.role) ? p.role.length > 0 : p.role)),
        disabled: !!(p.role && (Array.isArray(p.role) ? p.role.length > 0 : p.role)),
        type: 'select',
        options: [
          { value: 'Freelancer', icon: Laptop, desc: 'I want to offer my services' },
          { value: 'Client', icon: Users, desc: 'I want to hire talent' },
          { value: 'Both', icon: Rocket, desc: 'I want to do both' }
        ],
        placeholder: 'How will you use Xlance?',
        category: 'Professional',
      },
      {
        id: 'skills',
        label: 'Skills & Expertise',
        icon: Award,
        value: p.skills ? (Array.isArray(p.skills) ? p.skills.join(', ') : p.skills) : (Array.isArray(fl.skills) ? fl.skills.join(', ') : fl.skills || ''),
        completed: !!((p.skills && Array.isArray(p.skills) && p.skills.length > 0) || (fl.skills && Array.isArray(fl.skills) && fl.skills.length > 0) || (typeof p.skills === 'string' && p.skills) || (typeof fl.skills === 'string' && fl.skills)),
        type: 'text',
        placeholder: 'e.g., React, Python, UI/UX Design',
        category: 'Professional',
      },
      {
        id: 'bio',
        label: 'Professional Bio',
        icon: User,
        value: p.bio || p.description || fl.headline || '',
        completed: !!(p.bio || p.description || fl.headline),
        type: 'textarea',
        placeholder: 'Tell us about your expertise and experience...',
        category: 'Professional',
      },
      {
        id: 'location',
        label: 'Location',
        icon: MapPin,
        value: p.location || '',
        completed: !!(p.location),
        type: 'text',
        placeholder: 'e.g., Mumbai, India',
        category: 'Professional',
      },
      {
        id: 'hourlyRate',
        label: 'Hourly Rate (₹)',
        icon: IndianRupee,
        value: p.hourlyRate || p.rate || '',
        completed: !!(p.hourlyRate || p.rate),
        type: 'number',
        placeholder: 'e.g., 1500',
        category: 'Expert',
      },
      {
        id: 'experienceLevel',
        label: 'Experience Level',
        icon: Award,
        value: p.experienceLevel || p.experience || fl.experienceLevel || '',
        completed: !!(p.experienceLevel || p.experience || fl.experienceLevel),
        type: 'select',
        options: [
          { value: 'Beginner', icon: Star, desc: 'New to this field' },
          { value: 'Intermediate', icon: Zap, desc: 'Solid professional experience' },
          { value: 'Expert', icon: ShieldCheck, desc: 'Highly experienced specialist' },
          { value: 'Professional', icon: Trophy, desc: 'Top-tier industry leader' }
        ],
        placeholder: 'Select experience level',
        category: 'Expert',
      },
    ].filter(field => {
      if (isClient) {
        return !['hourlyRate', 'skills', 'experienceLevel'].includes(field.id);
      }
      return true;
    });
  }, [userProfile, user]);

  const completedFields = profileFields.filter(f => f.completed).length;
  const completionPercentage = profileFields.length > 0 ? Math.round((completedFields / profileFields.length) * 100) : 0;

  // Determine Tier
  const tier = useMemo(() => {
    if (completionPercentage >= 100) return { name: 'Elite Partner', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500', level: 3, benefits: ['Priority Bidding', 'Verified Badge', 'Fee Reduction'] };
    if (completionPercentage >= 60) return { name: 'Verified Pro', icon: ShieldCheck, color: 'text-primary-600', bg: 'bg-primary-600', level: 2, benefits: ['Smart Matching', 'Custom Proposals'] };
    return { name: 'Basic Talent', icon: User, color: 'text-gray-500', bg: 'bg-gray-500', level: 1, benefits: ['Standard Features'] };
  }, [completionPercentage]);

  const handleEdit = (field) => {
    setEditingField(field.id);
    setFormData({ [field.id]: field.value });
  };

  const handleCancel = () => {
    setEditingField(null);
    setFormData({});
    setCropImage(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleSave = async (field) => {
    setSaving(true);
    try {
      if (user?.uid) {
        const updates = { [field.id]: formData[field.id] };
        await userService.updateUserProfile(user.uid, updates);
      }
      setEditingField(null);
      setFormData({});
    } catch (error) {
      console.error('Error saving field:', error);
    } finally {
      setSaving(false);
    }
  };

  // Crop Handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  const performCrop = async () => {
    if (!imageRef.current) return;
    const img = imageRef.current;

    // Calculate fitting logic (Contain)
    const boxSize = 256; // w-64
    const aspect = img.naturalWidth / img.naturalHeight;
    let renderW, renderH;

    if (aspect > 1) {
      renderW = boxSize;
      renderH = boxSize / aspect;
    } else {
      renderH = boxSize;
      renderW = boxSize * aspect;
    }

    const baseScale = renderW / img.naturalWidth; // Scale to fit in box

    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    // Center Canvas
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Apply Pan (Adjusted for Canvas/Box ratio)
    const canvasRatio = canvas.width / boxSize;
    ctx.translate(pan.x * canvasRatio, pan.y * canvasRatio);

    // Apply Scale mechanism
    // natural * baseScale -> fits in box
    // fits in box * zoom -> visual size in box
    // visual size * canvasRatio -> size in canvas
    const finalScale = baseScale * zoom * canvasRatio;
    ctx.scale(finalScale, finalScale);

    // Draw centered
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      try {
        setSaving(true); // Reuse saving state for upload indication if needed, or add separate
        const filename = `profile_photos/${user.uid}_${Date.now()}.jpg`;
        const storageRef = ref(storage, filename);

        const snapshot = await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(snapshot.ref);

        setFormData(prev => ({ ...prev, photoURL: downloadURL }));
        setCropImage(null);
      } catch (error) {
        console.error("Error uploading image:", error);
        // Optional: Add toast error here
      } finally {
        setSaving(false);
      }
    }, 'image/jpeg', 0.9);
  };

  const renderFieldInput = (field) => {
    const isEditing = editingField === field.id;
    const value = isEditing ? (formData[field.id] ?? field.value) : field.value;

    if (!isEditing) return null;

    const inputClass = "w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none text-sm transition-all shadow-sm";

    // LOCKED ROLE
    if (field.id === 'role' && field.disabled) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-semibold text-gray-900">{field.label}</label>
            <div className="flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-600 px-2 py-1 rounded">
              <Lock size={12} /> <span>Locked</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed opacity-90">
            <div className="p-2 bg-gray-100 rounded-lg"><field.icon size={20} /></div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider mb-0.5 text-gray-400">Assigned Role</p>
              <p className="font-bold text-gray-700">{field.value}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button size="sm" variant="ghost" onClick={handleCancel} className="rounded-lg border border-gray-200">Close</Button>
          </div>
        </div>
      );
    }

    // PHOTO CROPPER
    if (field.id === 'photoURL') {
      if (cropImage) {
        return (
          <div className="space-y-4 p-5 bg-gray-50 rounded-2xl border border-gray-200 animate-in fade-in slide-in-from-top-2 shadow-lg">
            <h4 className="text-sm font-bold text-center text-gray-700">Adjust Profile Photo</h4>

            {/* Crop Area: Flex Center for Contain logic */}
            <div
              className="relative w-64 h-64 mx-auto bg-gray-900 rounded-full overflow-hidden cursor-move border-4 border-white shadow-xl touch-none select-none flex items-center justify-center"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                ref={imageRef}
                src={cropImage}
                className="max-w-full max-h-full object-contain pointer-events-none select-none"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                }}
                draggable={false}
              />
              {/* Overlay guide */}
              <div className="absolute inset-0 border-2 border-white/30 rounded-full pointer-events-none z-10"></div>
            </div>

            <div className="flex items-center gap-4 px-4">
              <span className="text-xs font-bold text-gray-500">Zoom</span>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-primary-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button size="sm" onClick={performCrop} className="w-full">Apply & Preview</Button>
              <Button size="sm" variant="ghost" onClick={() => { setCropImage(null); setZoom(1); setPan({ x: 0, y: 0 }); }} className="w-full border bg-white">Cancel</Button>
            </div>
          </div>
        );
      }

      return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-semibold text-gray-900">{field.label}</label>
            {field.completed && <CheckCircle2 size={16} className="text-green-500" />}
          </div>

          <div className="space-y-4">
            {/* Preview Area */}
            <div className="flex items-center justify-center mb-2">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-primary-300 border-4 border-white shadow-lg overflow-hidden relative group/img">
                {value ? <img src={value} className="w-full h-full object-cover" /> : <Upload size={32} />}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 bg-white rounded-lg border border-gray-200">
              <button
                onClick={() => setFormData(prev => ({ ...prev, [field.id + '_mode']: 'upload' }))}
                className={`py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${(!formData[field.id + '_mode'] || formData[field.id + '_mode'] === 'upload') ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Upload
              </button>
              <button
                onClick={() => setFormData(prev => ({ ...prev, [field.id + '_mode']: 'url' }))}
                className={`py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${(formData[field.id + '_mode'] === 'url') ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                URL Link
              </button>
            </div>

            {(!formData[field.id + '_mode'] || formData[field.id + '_mode'] === 'upload') ? (
              <div className="text-center">
                <label className="block w-full cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setCropImage(reader.result);
                          setZoom(1);
                          setPan({ x: 0, y: 0 });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <div className="flex flex-col items-center gap-2 py-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-400 hover:bg-primary-50/30 transition-all group/upload">
                    <div className="p-3 bg-primary-50 text-primary-600 rounded-full group-hover/upload:scale-110 transition-transform"><Upload size={20} /></div>
                    <span className="text-xs font-bold text-gray-500 group-hover/upload:text-primary-600">Click to Upload</span>
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                <input type="text" value={value} onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })} placeholder="https://example.com/image.png" className={inputClass} />
                <p className="text-[10px] text-gray-400 text-center">Paste a direct link to a public image.</p>
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-4">
            <Button size="sm" onClick={() => handleSave(field)} isLoading={saving} className="rounded-lg w-full shadow-md shadow-primary-500/20">Save Photo</Button>
            <Button size="sm" variant="ghost" onClick={handleCancel} className="rounded-lg border border-gray-200">Cancel</Button>
          </div>
        </div>
      );
    }

    // STANDARD FIELDS
    return (
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-top-2">
        <div className="flex justify-between items-center mb-4">
          <label className="text-sm font-semibold text-gray-900">{field.label}</label>
          {field.completed && <CheckCircle2 size={16} className="text-green-500" />}
        </div>

        <div className="space-y-4">
          {field.type === 'textarea' ? (
            <textarea value={value} onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })} placeholder={field.placeholder} className={`${inputClass} min-h-[120px]`} />
          ) : field.type === 'select' ? (
            <div className="grid grid-cols-1 gap-2">
              {field.options?.map(opt => {
                const OptIcon = opt.icon;
                const isSelected = value === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, [field.id]: opt.value })}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${isSelected ? 'border-primary-500 bg-primary-50 text-primary-900' : 'border-gray-200 bg-white hover:border-primary-200 hover:bg-gray-50'}`}
                  >
                    <div className={`p-2 rounded-md ${isSelected ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}><OptIcon size={16} /></div>
                    <div className="text-left">
                      <p className={`text-sm font-semibold ${isSelected ? 'text-primary-900' : 'text-gray-700'}`}>{opt.value}</p>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </div>
                    {isSelected && <CheckCircle2 size={16} className="ml-auto text-primary-600" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="relative group">
              <input type={field.type} value={value} onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })} placeholder={field.placeholder} className={inputClass} />
              {field.type === 'number' && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-xs">INR</span>}
            </div>
          )}
        </div>
        <div className="flex gap-3 pt-4">
          <Button size="sm" onClick={() => handleSave(field)} isLoading={saving} className="rounded-lg">Save</Button>
          <Button size="sm" variant="ghost" onClick={handleCancel} className="rounded-lg border border-gray-200">Cancel</Button>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] overflow-hidden">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div
          initial={{ x: '100%', opacity: 0.5 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-y-0 right-0 w-full md:w-[85%] lg:w-[80%] max-w-6xl bg-white/95 backdrop-blur-xl border-l border-white/20 shadow-2xl flex flex-col md:flex-row h-full z-[999] overflow-hidden"
        >
          {/* LEFT SIDEBAR */}
          <div className="w-full md:w-[320px] lg:w-[380px] bg-slate-50 border-b md:border-b-0 md:border-r border-gray-200 p-6 flex flex-col overflow-y-auto overflow-x-hidden shrink-0 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            <div className="mb-8 relative">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center font-bold shadow-lg"><User size={20} /></div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">Profile Setup</h2>
                </div>
                <button onClick={onClose} className="md:hidden p-2 bg-white border border-gray-200 rounded-full text-gray-500"><X size={20} /></button>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">Complete your freelancer identity to unlock higher tiers and better job matches.</p>
            </div>

            <div className="relative w-48 h-48 mx-auto mb-8 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-200" />
                <motion.circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={2 * Math.PI * (45 * 0.9)} initial={{ pathLength: 0 }} animate={{ pathLength: completionPercentage / 100 }} transition={{ duration: 1.5, ease: "easeOut" }} className={`${tier.color}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-gray-900">{completionPercentage}%</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Complete</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group mb-auto">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl ${tier.bg} bg-opacity-10 text-primary-600`}><tier.icon size={24} className={tier.color} /></div>
                <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Tier</p><p className={`text-lg font-bold ${tier.color}`}>{tier.name}</p></div>
              </div>
              <div className="space-y-2">{tier.benefits.map((b, i) => (<div key={i} className="flex items-center gap-2 text-xs font-medium text-gray-600"><CheckCircle2 size={12} className="text-green-500" /> {b}</div>))}</div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 hidden md:block">
              <div className="flex items-start gap-3">
                <ShieldCheck size={20} className="text-gray-400 mt-0.5" />
                <div><p className="text-xs font-bold text-gray-900 uppercase">Private & Secure</p><p className="text-xs text-gray-500">Your information is only shared with clients you propose to.</p></div>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
            <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hidden md:flex"><X size={24} /></button>
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-12 custom-scrollbar">
              <div className="max-w-3xl mx-auto">
                <div className="mb-10"><h3 className="text-2xl font-bold text-gray-900 mb-2">My Information</h3><p className="text-gray-500">Update your profile to stand out to clients.</p></div>
                {['Basic', 'Professional', 'Expert'].map((cat) => {
                  const fields = profileFields.filter(f => f.category === cat);
                  if (fields.length === 0) return null;
                  return (
                    <div key={cat} className="mb-12 last:mb-0">
                      <div className="flex items-center gap-4 mb-6"><span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1 rounded-full">{cat} Details</span><div className="h-px bg-gray-100 flex-1" /></div>
                      <div className="grid grid-cols-1 gap-4">
                        {fields.map((field) => (
                          <div key={field.id} className={`transition-all duration-300 ${editingField === field.id ? 'ring-2 ring-primary-100 rounded-xl bg-gray-50/50 p-2 -m-2' : ''}`}>
                            {editingField === field.id ? (
                              renderFieldInput(field)
                            ) : (
                              <div onClick={() => handleEdit(field)} className="group flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-primary-200 hover:shadow-md transition-all cursor-pointer">
                                <div className={`p-3 rounded-lg ${field.completed ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-400'} group-hover:bg-primary-600 group-hover:text-white transition-colors`}><field.icon size={20} /></div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <div><p className="text-sm font-medium text-gray-500 mb-0.5">{field.label}</p><p className="text-base font-semibold text-gray-900">{field.value ? (field.id === 'photoURL' ? 'Photo Uploaded' : field.value) : <span className="text-gray-400 italic font-normal">Not set</span>}</p></div>
                                    {field.completed ? <CheckCircle2 size={18} className="text-green-500" /> : <div className="w-2 h-2 rounded-full bg-red-400 mt-2" />}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-white z-10 flex justify-end"><Button onClick={onClose} size="lg" className="px-8 bg-gray-900 text-white hover:bg-black rounded-xl">Done</Button></div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProfileCompletionModal;
