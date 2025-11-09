import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] md:w-[92%] max-w-7xl z-50 bg-white/40 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] backdrop-blur-2xl border border-white/30 py-2">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary-500/95 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">X</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Xlance</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Home
            </Link>
            {user ? (
              <>
                <Link
                  to={user.role === 'freelancer' ? '/dashboard/freelancer' : '/dashboard/client'}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-700">{user.name}</span>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-md hover:bg-white/10"
                    title="Sign out"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/auth/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/auth/signup">
                  <Button>Join Now</Button>
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {isOpen && (
          <div className="md:hidden mt-2 bg-white/30 backdrop-blur-2xl rounded-xl border border-white/30 p-4 space-y-3 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
            <Link to="/" className="block text-gray-600 hover:text-gray-900 py-2">
              Home
            </Link>
            {user ? (
              <>
                <Link
                  to={user.role === 'freelancer' ? '/dashboard/freelancer' : '/dashboard/client'}
                  className="block text-gray-600 hover:text-gray-900 py-2"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left text-gray-600 hover:text-gray-900 py-2"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link to="/auth/signin" className="block">
                  <Button variant="ghost" className="w-full">
                    Sign In
                  </Button>
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
