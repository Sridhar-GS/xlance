import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';
import ProfileCompletionModal from './ProfileCompletionModal';
import NotificationsPanel from './NotificationsPanel';
import LogoutConfirmationModal from '../modals/LogoutConfirmationModal';
import { notificationService } from '../../services/notificationService';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, userProfile, signOut } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Subscribe to notifications for the badge
  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = notificationService.subscribeToNotifications(user.uid, (notifications) => {
      const count = notifications.filter(n => !n.read).length;
      setUnreadCount(count);
    });
    return () => unsubscribe();
  }, [user]);

  // Define logic that doesn't use hooks
  const isAuthPage = location?.pathname?.startsWith('/auth/');
  const isHome = location?.pathname === '/';
  const pathname = location?.pathname || '';

  // Robust role check helper
  const hasRole = (role) => {
    if (!userProfile?.role) return false;
    const roles = Array.isArray(userProfile.role)
      ? userProfile.role
      : [userProfile.role];

    return roles.some(r => r.toLowerCase() === role.toLowerCase());
  };

  // Determine dashboard path based on role
  const dashboardPath = hasRole('freelancer')
    ? '/dashboard/freelancer'
    : '/dashboard/client';

  // Known nav paths (used to decide default active)
  const navPaths = ['/', dashboardPath, '/find-work', '/projects', '/messages', '/reports', '/client/jobs', '/client/talent'];

  // If none of the nav paths match current pathname, we'll default to highlighting the dashboard
  const activeFound = navPaths.some((p) => pathname.startsWith(p));

  // Helper to compute active class for nav links
  const getLinkClass = (to) => {
    const base = 'text-gray-600 hover:text-gray-900 transition-colors';
    const active = 'text-primary-600 font-semibold bg-primary-50 px-2 py-1 rounded-md';

    const matches = pathname.startsWith(to);
    const isActive = matches || (!activeFound && to === dashboardPath);
    return isActive ? `${base} ${active}` : base;
  };
  const homeLinkClass = 'text-primary-600 hover:text-primary-700 transition-colors';

  const handleSignOutClick = () => {
    setShowLogoutModal(true);
    setIsOpen(false); // Close mobile menu if open
  };

  const confirmSignOut = async () => {
    await signOut();
    setShowLogoutModal(false);
  };

  // 🛠️ HOOKS MUST BE CALLED BEFORE EARLY RETURNS 🛠️
  const prevScrollY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY || window.pageYOffset || 0;
      if (isOpen) {
        prevScrollY.current = current;
        setHidden(false);
        return;
      }

      const delta = current - prevScrollY.current;
      const threshold = 10;

      if (delta > threshold && current > 40) {
        setHidden(true);
      } else if (prevScrollY.current - current > threshold) {
        setHidden(false);
      }

      prevScrollY.current = current;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isOpen]);

  // 🚦 NOW WE CAN RETURN EARLY 🚦
  if (isAuthPage) return null;

  const isFindWork = location.pathname === '/find-work';
  // If Find Work page, use absolute (scrolls with page). Else use fixed (sticky/auto-hide).
  const positionClass = isFindWork ? 'absolute' : 'fixed';
  // If Find Work page, disable the hide transform (it scrolls away naturally).
  const transformClass = isFindWork ? '' : (hidden && !isOpen ? '-translate-y-28' : 'translate-y-0');

  return (
    <>
      <nav className={`${positionClass} top-6 left-1/2 transform -translate-x-1/2 ${transformClass} transition-transform duration-300 w-[calc(100%-2rem)] md:w-[92%] max-w-7xl z-50 bg-white/40 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] backdrop-blur-2xl border border-white/30 py-2`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary-500/95 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">X</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Xlance</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {isHome ? (
                <>
                  <Link to="/" className={homeLinkClass}>Home</Link>
                  {user ? (
                    <>
                      <Link to={dashboardPath} className={homeLinkClass}>Dashboard</Link>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-700">{userProfile?.name || user?.displayName || user?.email}</span>
                        <button onClick={handleSignOutClick} className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-md hover:bg-white/10" title="Sign out">
                          <LogOut size={20} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Link to="/auth/signin"><Button variant="ghost">Sign In</Button></Link>
                      <Link to="/auth/signup"><Button>Join Now</Button></Link>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {user ? (
                    <>
                      <Link to={dashboardPath} className={getLinkClass(dashboardPath)}>Dashboard</Link>

                      {hasRole('client') ? (
                        <>
                          <Link to="/client/jobs" className={getLinkClass('/client/jobs')}>My Jobs</Link>
                          <Link to="/client/talent" className={getLinkClass('/client/talent')}>Find Talent</Link>
                        </>
                      ) : (
                        <>
                          <Link to="/find-work" className={getLinkClass('/find-work')}>Find Work</Link>
                          <Link to="/projects" className={getLinkClass('/projects')}>My Projects</Link>
                        </>
                      )}

                      <Link to="/messages" className={getLinkClass('/messages')}>Messages</Link>
                      <Link to="/reports" className={getLinkClass('/reports')}>Reports</Link>
                    </>
                  ) : (
                    <Link to="/" className={homeLinkClass}>Home</Link>
                  )}

                  {user ? (
                    <div className="flex items-center gap-4 relative">
                      <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`transition-colors p-2 rounded-md hover:bg-white/10 relative ${showNotifications ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900'}`}
                        title="Notifications"
                      >
                        <Bell size={20} />
                        {/* Notification Dot */}
                        {unreadCount > 0 && (
                          <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border border-white pointer-events-none"></span>
                        )}
                      </button>
                      <NotificationsPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
                      <button
                        onClick={() => setShowProfileModal(true)}
                        className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 ring-2 ring-transparent hover:ring-primary-300 transition-all cursor-pointer"
                        title="View Profile Progress"
                      >
                        <img src={userProfile?.photoURL || user?.photoURL || '/src/assets/logo.png'} alt="avatar" className="w-full h-full object-cover" />
                      </button>
                      <button onClick={handleSignOutClick} className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-md hover:bg-white/10" title="Sign out">
                        <LogOut size={20} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Link to="/auth/signin"><Button variant="ghost">Sign In</Button></Link>
                      <Link to="/auth/signup"><Button>Join Now</Button></Link>
                    </div>
                  )}
                </>
              )}
            </div>

            <button
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setIsOpen(prev => { const next = !prev; if (next) setHidden(false); return next; })}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          {isOpen && (
            <div className="md:hidden mt-2 bg-white/30 backdrop-blur-2xl rounded-xl border border-white/30 p-4 space-y-3 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
              {!(hasRole('freelancer')) && (
                <Link to="/" onClick={() => setIsOpen(false)} className={(isHome ? homeLinkClass : getLinkClass('/')) + ' block py-2'}>Home</Link>
              )}
              {user ? (
                <>
                  <button
                    onClick={() => { setShowProfileModal(true); setIsOpen(false); }}
                    className="flex items-center gap-3 w-full py-2 text-left"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 ring-2 ring-primary-300">
                      <img src={userProfile?.photoURL || user?.photoURL || '/src/assets/logo.png'} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{userProfile?.name || user?.displayName || 'User'}</p>
                      <p className="text-xs text-gray-600">View Profile Progress</p>
                    </div>
                  </button>
                  <div className="border-t border-white/30 my-2" />
                  <Link to={dashboardPath} onClick={() => setIsOpen(false)} className={getLinkClass(dashboardPath) + ' block py-2'}>Dashboard</Link>

                  {hasRole('client') ? (
                    <>
                      <Link to="/client/jobs" onClick={() => setIsOpen(false)} className={getLinkClass('/client/jobs') + ' block py-2'}>My Jobs</Link>
                      <Link to="/client/talent" onClick={() => setIsOpen(false)} className={getLinkClass('/client/talent') + ' block py-2'}>Find Talent</Link>
                    </>
                  ) : (
                    <>
                      <Link to="/find-work" onClick={() => setIsOpen(false)} className={getLinkClass('/find-work') + ' block py-2'}>Find Work</Link>
                      <Link to="/projects" onClick={() => setIsOpen(false)} className={getLinkClass('/projects') + ' block py-2'}>My Projects</Link>
                    </>
                  )}

                  <Link to="/messages" onClick={() => setIsOpen(false)} className={getLinkClass('/messages') + ' block py-2'}>Messages</Link>
                  <Link to="/reports" onClick={() => setIsOpen(false)} className={getLinkClass('/reports') + ' block py-2'}>Reports</Link>
                  <button onClick={handleSignOutClick} className="w-full text-left text-gray-600 hover:text-gray-900 py-2">Sign Out</button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link to="/auth/signin" className="block">
                    <Button variant="ghost" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/auth/signup" className="block">
                    <Button className="w-full">Join Now</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
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
