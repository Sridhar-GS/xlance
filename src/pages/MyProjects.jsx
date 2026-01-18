import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  MoreVertical,
  FileText,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  Calendar,
  X,
  IndianRupee,
  Paperclip,
  Download,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import PageTransition from '../components/common/PageTransition';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import { messageService } from '../services/messageService';

// --- Sub-Components (Internal for unique page design) ---

const ProjectDetailsDrawer = ({ project, isOpen, onClose, onToggleMilestone, onAddMilestone }) => {
  const [newMilestone, setNewMilestone] = useState('');

  if (!isOpen || !project) return null;

  const bannerSubmit = (e) => {
    e.preventDefault();
    if (newMilestone.trim()) {
      onAddMilestone(project.id, newMilestone);
      setNewMilestone('');
    }
  }

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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[600px] lg:w-[700px] bg-white shadow-2xl z-[70] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur z-10 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-900 text-white flex items-center justify-center font-bold shadow-md">
                  {project.clientAvatar}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">{project.title}</h2>
                  <p className="text-xs text-gray-500 font-medium">{project.clientName}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              {/* Status & Timeline */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1 font-medium">Current Status</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${project.status === 'Active' ? 'bg-green-500' :
                      project.status === 'Completed' ? 'bg-gray-400' : 'bg-amber-500'
                      }`} />
                    <span className="font-bold text-gray-900">{project.status}</span>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1 font-medium">Timeline</p>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-primary-600" />
                    <span className="font-bold text-gray-900">{new Date(project.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Milestones */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-gray-400" />
                  Milestones
                </h3>
                <div className="space-y-3">
                  {project.milestones?.map((milestone) => (
                    <div key={milestone.id}
                      onClick={() => onToggleMilestone(project.id, milestone.id)}
                      className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-primary-100 hover:bg-gray-50 transition-all cursor-pointer group"
                    >
                      <div className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${milestone.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 group-hover:border-primary-400'
                        }`}>
                        {milestone.completed && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium transition-colors ${milestone.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {milestone.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">Click to toggle status</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${milestone.completed ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {milestone.completed ? 'Done' : 'Pending'}
                      </span>
                    </div>
                  ))}

                  {/* Add Milestone Input */}
                  <form onSubmit={bannerSubmit} className="flex gap-2 mt-4">
                    <input
                      type="text"
                      value={newMilestone}
                      onChange={(e) => setNewMilestone(e.target.value)}
                      placeholder="Add a new milestone..."
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 transition-colors"
                    />
                    <button type="submit" disabled={!newMilestone.trim()} className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      Add
                    </button>
                  </form>
                </div>
              </div>

              {/* Files & Assets */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Paperclip size={20} className="text-gray-400" />
                  Files & Assets
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg group cursor-pointer hover:border-primary-200 transition-colors">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">Project_Specs_v2.pdf</p>
                      <p className="text-xs text-gray-500">2.4 MB • 2 days ago</p>
                    </div>
                    <Download size={16} className="text-gray-400 group-hover:text-primary-600" />
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg group cursor-pointer hover:border-primary-200 transition-colors">
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">Design_Assets.zip</p>
                      <p className="text-xs text-gray-500">145 MB • 1 week ago</p>
                    </div>
                    <Download size={16} className="text-gray-400 group-hover:text-primary-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex gap-3">
              <button className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200">
                Message Client
              </button>
              <button className="px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                <ExternalLink size={20} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const StatusFilterBar = ({ activeStatus, onFilterChange, counts }) => {
  const tabs = [
    { id: 'All', label: 'All Projects', count: counts.total },
    { id: 'Active', label: 'In Progress', count: counts.active },
    { id: 'In Review', label: 'In Review', count: counts.review },
    { id: 'Completed', label: 'Completed', count: counts.completed },
  ];

  return (
    <div className="flex items-center gap-2 p-1 bg-gray-100/50 backdrop-blur-sm rounded-xl border border-gray-200/50 w-fit mb-8 overflow-x-auto max-w-full">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onFilterChange(tab.id)}
          className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeStatus === tab.id
            ? 'text-gray-900 shadow-sm bg-white'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
        >
          <span className="relative z-10 flex items-center gap-2">
            {tab.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeStatus === tab.id ? 'bg-gray-100 text-gray-900' : 'bg-gray-200 text-gray-600'
              }`}>
              {tab.count}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
};

const ProjectMissionCard = ({ project, onDetailsClick, onMenuAction, onMessageClick }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:border-primary-100 transition-colors duration-300"
    >
      {/* Glass / Gradient decorative top */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 rounded-t-2xl opacity-80" />

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold text-lg shadow-md group-hover:bg-primary-600 transition-colors">
            {project.clientAvatar}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
              {project.title}
            </h3>
            <p className="text-sm text-gray-500 font-medium">{project.clientName}</p>
          </div>
        </div>

        {/* Three Dots Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <MoreVertical size={20} />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-1 overflow-hidden"
              >
                <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onMenuAction('contract', project); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors flex items-center gap-2">
                  <FileText size={16} /> View Contract
                </button>
                <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onMenuAction('upload', project); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors flex items-center gap-2">
                  <Paperclip size={16} /> Upload Deliverable
                </button>
                <div className="h-px bg-gray-100 my-1" />
                <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onMenuAction('delete', project); }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                  <X size={16} /> Delete Project
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-semibold text-gray-700">Project Progress</span>
          <span className="font-bold text-primary-600">{project.progress}%</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${project.progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${project.progress === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-primary-500 to-purple-600'
              }`}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
          <TrendingUp size={12} />
          Next: {project.nextMilestone}
        </p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 group-hover:border-primary-100 transition-colors">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <Calendar size={14} /> Due Date
          </div>
          <div className="font-semibold text-gray-900 text-sm">
            {new Date(project.dueDate).toLocaleDateString()}
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 group-hover:border-primary-100 transition-colors">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <IndianRupee size={14} /> Budget Used
          </div>
          <div className="font-semibold text-gray-900 text-sm">
            ₹{project.budgetConsumed.toLocaleString()} <span className="text-gray-400 font-normal text-xs">/ ₹{project.budgetTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="flex gap-2 border-t border-gray-100 pt-4">
        <button onClick={() => onMessageClick && onMessageClick(project)} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-primary-200 hover:text-primary-600 hover:shadow-sm transition-all">
          <MessageSquare size={16} /> Chat
        </button>
        <button onClick={() => onDetailsClick(project)} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-primary-600 shdaow-sm transition-all">
          Details <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
};


// --- Main Page Component ---

const MyProjects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState('All');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [activeModal, setActiveModal] = useState(null); // 'contract' | 'upload'
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (user?.uid) {
        try {
          const data = await projectService.getProjectsByFreelancer(user.uid);
          // If no projects found, seed a demo project for better initial experience
          setProjects(data);
        } catch (error) {
          console.error("Error fetching projects:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProjects();
  }, [user]);

  // Derived Logic: Recalculate counts based on dynamic state
  const counts = useMemo(() => {
    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'Active').length,
      review: projects.filter(p => p.status === 'In Review').length,
      completed: projects.filter(p => p.status === 'Completed').length,
    }
  }, [projects]);

  const filteredProjects = projects.filter(p => filter === 'All' ? true : p.status === filter);

  // --- Actions Handlers ---

  // 1. Toggle Milestone: Updates Progress & Budget
  const handleToggleMilestone = async (projectId, milestoneId) => {
    // Optimistic Update
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedMilestones = project.milestones.map(m =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );

    // Recalculate Progress
    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const newProgress = Math.round((completedCount / updatedMilestones.length) * 100);
    const newBudgetConsumed = Math.round((newProgress / 100) * project.budgetTotal);

    let newStatus = project.status;
    if (newProgress === 100) newStatus = 'Completed';
    else if (newProgress > 0 && project.status === 'open') newStatus = 'Active';

    // Update State
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        milestones: updatedMilestones,
        progress: newProgress,
        budgetConsumed: newBudgetConsumed,
        status: newStatus
      };
    }));

    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject(prevSelected => ({
        ...prevSelected,
        milestones: updatedMilestones,
        progress: newProgress,
        budgetConsumed: newBudgetConsumed,
        status: newStatus
      }));
    }

    // Persist to FireStore
    try {
      await projectService.updateProject(projectId, {
        milestones: updatedMilestones,
        progress: newProgress,
        budgetConsumed: newBudgetConsumed,
        status: newStatus
      });
    } catch (err) {
      console.error("Failed to update project", err);
      // Revert state if needed (skipped for brevity)
    }
  };

  // 2. Add New Milestone
  const handleAddMilestone = async (projectId, title) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newMilestone = { id: Date.now(), title, completed: false };
    const updatedMilestones = [...(project.milestones || []), newMilestone];

    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const newProgress = Math.round((completedCount / updatedMilestones.length) * 100);

    const updateData = { milestones: updatedMilestones, progress: newProgress };

    // Optimistic
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return { ...p, ...updateData };
    }));

    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject(prev => ({ ...prev, ...updateData }));
    }

    // Persist
    try {
      await projectService.updateProject(projectId, updateData);
    } catch (err) {
      console.error("Failed to add milestone", err);
    }
  };

  // 3. Status Action Handler (from Dropdown)
  const handleMenuAction = async (action, project) => {
    if (action === 'delete') {
      if (window.confirm("Are you sure you want to delete this project? This cannot be undone.")) {
        try {
          await projectService.deleteProject(project.id);
          setProjects(prev => prev.filter(p => p.id !== project.id));
        } catch (err) {
          console.error("Failed to delete project:", err);
          alert("Failed to delete project");
        }
      }
      return;
    }
    setModalData(project);
    setActiveModal(action);
  };


  // 4. Message Handler
  const handleMessageClick = async (project) => {
    // Determine the other user ID (client)
    // Project service uses `clientUserId` or `clientId` depending on source
    // proposalService.acceptProposal sets `clientUserId`.
    const otherId = project.clientUserId || project.clientId;

    if (!otherId) {
      alert("Cannot connect to client. ID missing.");
      return;
    }

    try {
      const conv = await messageService.startConversation(
        user.uid,
        otherId,
        project.clientName || 'Client',
        project.clientAvatar || ''
      );
      navigate('/messages', { state: { conversationId: conv.id } });
    } catch (err) {
      console.error("Chat Error:", err);
      alert("Failed to open chat.");
    }
  };

  return (
    <PageTransition>
      <main className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mission Control</h1>
            <p className="text-gray-500 mt-2 text-lg">Manage your active contracts and delivers.</p>
          </header>

          {/* Filter Bar */}
          <StatusFilterBar activeStatus={filter} onFilterChange={setFilter} counts={counts} />

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode='popLayout'>
              {loading ? (
                // Loading Skeletons
                [1, 2, 3].map(i => (
                  <div key={i} className="rounded-2xl p-6 bg-white border border-gray-100 h-[400px] animate-pulse relative">
                    <div className="flex gap-3 mb-6">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full mb-6"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-16 bg-gray-200 rounded-xl"></div>
                      <div className="h-16 bg-gray-200 rounded-xl"></div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {filteredProjects.map((project) => (
                    <ProjectMissionCard
                      key={project.id}
                      project={project}
                      onDetailsClick={setSelectedProject}
                      onMenuAction={handleMenuAction}
                      onMessageClick={handleMessageClick}
                    />
                  ))}

                  {/* Add New Project Placeholder */}
                  {filter !== 'Completed' && !loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-primary-300 hover:bg-primary-50/50 transition-all cursor-pointer min-h-[400px] group"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400 group-hover:text-primary-500 transition-colors">
                        <span className="text-3xl font-light">+</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">New Project</h3>
                      <p className="text-sm text-gray-500 mt-2 max-w-[200px]">Start a new contract or import a mission.</p>
                    </motion.div>
                  )}
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* --- Drawers & Modals --- */}

        {/* 1. Project Details Drawer (Enhanced with interactivity) */}
        <ProjectDetailsDrawer
          project={selectedProject}
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          onToggleMilestone={handleToggleMilestone}
          onAddMilestone={handleAddMilestone}
        />

        {/* 2. Simple Modals for Actions */}
        <AnimatePresence>
          {activeModal && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setActiveModal(null)}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
              >
                {activeModal === 'contract' && (
                  <div className="p-0">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <FileText size={20} className="text-primary-600" /> Contract Details
                      </h3>
                      <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-gray-200 rounded-full"><X size={20} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Project:</span>
                        <span className="font-medium">{modalData?.title}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Rate:</span>
                        <span className="font-medium">₹{modalData?.budgetTotal?.toLocaleString()} (Fixed Price)</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600 italic border border-gray-100">
                        "This contract serves as a binding agreement between {modalData?.clientName} and the Freelancer..."
                        <br /><br />
                        <span className="text-xs text-gray-400">Signed on {new Date(modalData?.dueDate).toLocaleDateString()}</span>
                      </div>
                      <button className="w-full py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium">Download PDF</button>
                    </div>
                  </div>
                )}

                {activeModal === 'upload' && (
                  <div className="p-0">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Paperclip size={20} className="text-primary-600" /> Upload Deliverable
                      </h3>
                      <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-gray-200 rounded-full"><X size={20} /></button>
                    </div>
                    <div className="p-6">
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-primary-400 hover:bg-primary-50/30 transition-all cursor-pointer">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                          <Download size={24} className="rotate-180" />
                        </div>
                        <p className="font-medium text-gray-900">Drag & drop files here</p>
                        <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium mr-2">Cancel</button>
                        <button onClick={() => setActiveModal(null)} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">Upload</button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </PageTransition>
  );
};

export default MyProjects;
