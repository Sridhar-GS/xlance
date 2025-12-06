import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { user, userProfile, signOut } = useAuth();
  const location = useLocation();
  const isHome = location?.pathname === '/';
  // determine dashboard path based on role
  const dashboardPath = userProfile?.role && Array.isArray(userProfile.role) && userProfile.role.includes('freelancer')
    ? '/dashboard/freelancer'
    : '/dashboard/client';

  // known nav paths (used to decide default active)
  const navPaths = ['/', dashboardPath, '/find-work', '/projects', '/messages', '/reports'];
  const pathname = location?.pathname || '';
  // if none of the nav paths match current pathname, we'll default to highlighting the dashboard
  const activeFound = navPaths.some((p) => pathname.startsWith(p));

  // helper to compute active class for nav links
  const getLinkClass = (to) => {
    const base = 'text-gray-600 hover:text-gray-900 transition-colors';
    const active = 'text-primary-600 font-semibold bg-primary-50 px-2 py-1 rounded-md';

    const matches = pathname.startsWith(to);
    const isActive = matches || (!activeFound && to === dashboardPath);
    return isActive ? `${base} ${active}` : base;
  };
  const homeLinkClass = 'text-primary-600 hover:text-primary-700 transition-colors';

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  // hide on scroll down, show on scroll up
  const prevScrollY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);
  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY || window.pageYOffset || 0;
      // if mobile menu is open, keep navbar visible
      if (isOpen) {
        prevScrollY.current = current;
        setHidden(false);
        return;
      }

      const delta = current - prevScrollY.current;
      const threshold = 10; // small threshold to avoid jitter

      if (delta > threshold && current > 40) {
        // scrolling down
        setHidden(true);
      } else if (prevScrollY.current - current > threshold) {
        // scrolling up
        setHidden(false);
      }

      prevScrollY.current = current;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isOpen]);

  return (
    <nav className={`fixed top-6 left-1/2 transform -translate-x-1/2 ${hidden && !isOpen ? '-translate-y-28' : 'translate-y-0'} transition-transform duration-300 w-[calc(100%-2rem)] md:w-[92%] max-w-7xl z-50 bg-white/40 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] backdrop-blur-2xl border border-white/30 py-2`}>
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
              // Render original simple home navbar
              <>
                <Link to="/" className={homeLinkClass}>Home</Link>
                {user ? (
                  <>
                    <Link to={dashboardPath} className={homeLinkClass}>Dashboard</Link>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-700">{userProfile?.name || user?.displayName || user?.email}</span>
                      <button onClick={handleSignOut} className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-md hover:bg-white/10" title="Sign out">
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
              // Render expanded navbar for app pages (dashboard, find work, etc.)
              <>
                {/* If user is a freelancer, hide the Home link */}
                {!(userProfile?.role && userProfile.role.includes('freelancer')) && (
                  <Link to="/" className={getLinkClass('/')}>Home</Link>
                )}

                <Link to={dashboardPath} className={getLinkClass(dashboardPath)}>Dashboard</Link>
                <Link to="/find-work" className={getLinkClass('/find-work')}>Find Work</Link>
                <Link to="/projects" className={getLinkClass('/projects')}>My Projects</Link>
                <Link to="/messages" className={getLinkClass('/messages')}>Messages</Link>
                <Link to="/reports" className={getLinkClass('/reports')}>Reports</Link>

                {user ? (
                  <div className="flex items-center gap-4">
                    <button className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-md hover:bg-white/10" title="Notifications">
                      <Bell size={20} />
                    </button>
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100">
                      <img src={userProfile?.photoURL || user?.photoURL || '/src/assets/logo.png'} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    <button onClick={handleSignOut} className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-md hover:bg-white/10" title="Sign out">
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
            {/* Mobile menu: ordered links */}
            {!(userProfile?.role && userProfile.role.includes('freelancer')) && (
              <Link to="/" className={(isHome ? homeLinkClass : getLinkClass('/')) + ' block py-2'}>Home</Link>
            )}
            {user ? (
              <>
                <Link to={dashboardPath} className={getLinkClass(dashboardPath) + ' block py-2'}>Dashboard</Link>
                <Link to="/find-work" className={getLinkClass('/find-work') + ' block py-2'}>Find Work</Link>
                <Link to="/projects" className={getLinkClass('/projects') + ' block py-2'}>My Projects</Link>
                <Link to="/messages" className={getLinkClass('/messages') + ' block py-2'}>Messages</Link>
                <Link to="/reports" className={getLinkClass('/reports') + ' block py-2'}>Reports</Link>
                <button onClick={handleSignOut} className="w-full text-left text-gray-600 hover:text-gray-900 py-2">Sign Out</button>
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
  );
};

export default Navbar;
