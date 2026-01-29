import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Bell, PlusCircle, Search } from 'lucide-react';
import { useAuth } from '../../features/auth/context/AuthContext';
import Button from './Button';
import ProfileCompletionModal from './ProfileCompletionModal';
import NotificationsPanel from './NotificationsPanel';
import LogoutConfirmationModal from './modals/LogoutConfirmationModal';
import { notificationService } from '../services/notificationService';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false); // New Dropdown State
  const { user, userProfile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Subscribe to notifications
  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = notificationService.subscribeToNotifications(user.uid, (notifications) => {
      const count = notifications.filter(n => !n.read).length;
      setUnreadCount(count);
    });
    return () => unsubscribe();
  }, [user]);

  const isAuthPage = location?.pathname?.startsWith('/auth/');
  const isHome = location?.pathname === '/';
  const pathname = location?.pathname || '';

  const hasRole = (role) => {
    if (!userProfile?.role) return false;
    const roles = Array.isArray(userProfile.role) ? userProfile.role : [userProfile.role];
    return roles.some(r => r.toLowerCase() === role.toLowerCase());
  };

  // Determine effective mode:
  // 1. If no user -> Buying Mode (Public)
  // 2. If user -> Depends on state (Default to Selling if Freelancer)
  const [viewMode, setViewMode] = useState('buying'); // 'buying' | 'selling'

  useEffect(() => {
    if (userProfile?.role?.includes('freelancer')) {
      setViewMode('selling');
    }
  }, [userProfile]);

  const toggleMode = () => {
    setViewMode(prev => prev === 'buying' ? 'selling' : 'buying');
  };

  const dashboardPath = viewMode === 'selling' ? '/dashboard/freelancer' : '/dashboard/client';

  const getLinkClass = (to) => {
    const base = 'text-muted-foreground hover:text-foreground transition-colors font-medium text-sm';
    const active = 'text-primary font-bold bg-primary/10 px-3 py-1.5 rounded-full';
    return pathname.startsWith(to) ? `${base} ${active}` : base;
  };

  const handleSignOutClick = () => {
    setShowLogoutModal(true);
    setIsOpen(false);
  };

  const confirmSignOut = async () => {
    await signOut();
    setShowLogoutModal(false);
  };

  if (isAuthPage) return null;

  return (
    <>

      <nav className={`fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-transform duration-300 ${hidden && !isOpen ? '-translate-y-full' : 'translate-y-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tighter text-foreground">
                Xlance<span className="text-primary">.</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            {/* Desktop Nav - Mode Based */}
            <div className="hidden md:flex items-center gap-6">
              {user ? (
                <>
                  {viewMode === 'selling' ? (
                    // SELLING MODE
                    <>
                      <Link to="/dashboard/freelancer" className={getLinkClass('/dashboard/freelancer')}>Dashboard</Link>
                      <Link to="/my-gigs" className={getLinkClass('/my-gigs')}>My Gigs</Link>
                      <Link to="/reports" className={getLinkClass('/reports')}>Earnings</Link>
                      <Link to="/messages" className={getLinkClass('/messages')}>Messages</Link>
                    </>
                  ) : (
                    // BUYING MODE
                    <>
                      <Link to="/dashboard/client" className={getLinkClass('/dashboard/client')}>Dashboard</Link>
                      <Link to="/marketplace" className={getLinkClass('/marketplace')}>Marketplace</Link>
                      <Link to="/orders" className={getLinkClass('/orders')}>Orders</Link>
                      <Link to="/messages" className={getLinkClass('/messages')}>Messages</Link>
                    </>
                  )}
                </>
              ) : (
                // PUBLIC MODE
                <>
                  <Link to="/marketplace" className={getLinkClass('/marketplace')}>Find Talent</Link>
                  <Link to="/auth/signin" className={getLinkClass('/auth/signin')}>Sign In</Link>
                </>
              )}
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-4">

              {/* Mode Switcher */}
              {user && hasRole('freelancer') && (
                <button
                  onClick={toggleMode}
                  className="text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {viewMode === 'buying' ? 'Switch to Selling' : 'Switch to Buying'}
                </button>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-muted-foreground hover:bg-accent hover:text-foreground rounded-full transition-colors"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {user ? (
                <>
                  {/* Create Gig Button (Seller Mode Only) */}
                  {viewMode === 'selling' && (
                    <Link to="/gigs/create">
                      <Button className="py-2 px-4 shadow-md bg-emerald-600 hover:bg-emerald-700 text-white border-none">
                        <PlusCircle size={18} className="mr-2" /> Post Gig
                      </Button>
                    </Link>
                  )}

                  {/* Bell */}
                  <div className="relative">
                    <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
                      <Bell size={20} />
                      {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>}
                    </button>
                    <NotificationsPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
                  </div>

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="w-10 h-10 rounded-full bg-muted overflow-hidden ring-2 ring-transparent hover:ring-primary transition-all focus:outline-none"
                    >
                      <img src={userProfile?.photoURL || user?.photoURL} alt="User" className="w-full h-full object-cover" />
                    </button>

                    {/* Desktop Dropdown Menu */}
                    {showProfileMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl py-1 z-50 animate-fade-in">
                        <div className="px-4 py-2 border-b border-border">
                          <p className="text-sm font-bold text-foreground truncate">{userProfile?.name || 'User'}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                        <Link
                          to={dashboardPath}
                          className="block px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/settings"
                          className="block px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          Settings
                        </Link>
                        <button
                          onClick={handleSignOutClick}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link to="/auth/signup"><Button className="bg-black hover:bg-gray-800 text-white">Join Now</Button></Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-gray-600" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 shadow-xl">
            {user ? (
              <>
                <Link to={dashboardPath} onClick={() => setIsOpen(false)} className="block py-2 font-medium">Dashboard</Link>
                {hasRole('freelancer') ? (
                  <>
                    <Link to="/my-gigs" onClick={() => setIsOpen(false)} className="block py-2 font-medium">My Gigs</Link>
                    <Link to="/gigs/create" onClick={() => setIsOpen(false)} className="block py-2 font-medium text-green-600">Post a Gig</Link>
                  </>
                ) : (
                  <Link to="/marketplace" onClick={() => setIsOpen(false)} className="block py-2 font-medium">Browse Gigs</Link>
                )}
                <button onClick={handleSignOutClick} className="block w-full text-left py-2 text-red-600 font-medium">Sign Out</button>
              </>
            ) : (
              <Link to="/auth/signin" className="block py-2 font-medium">Sign In</Link>
            )}
          </div>
        )}
      </nav>

      <ProfileCompletionModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmSignOut}
      />
    </>
  );
};

export default Navbar;
