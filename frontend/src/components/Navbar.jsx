import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, User, LogOut } from 'lucide-react';
import { clearAuth, isAuthenticated, getUserFromStorage } from '../utils/auth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        const userData = getUserFromStorage();
        setUser(userData);
      } else {
        setUser(null);
      }
    };
    checkAuth();
    
    // Listen for storage changes (for logout from other tabs)
    const handleStorageChange = () => checkAuth();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    navigate('/auth');
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-white shadow-lg backdrop-blur-sm bg-opacity-95"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/feed" className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent"
            >
              LinkUp
            </motion.div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/feed"
              className="relative text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium"
            >
              Feed
              <motion.span
                className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600"
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.3 }}
              />
            </Link>
            {user && (
              <>
                <Link to="/profile">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold cursor-pointer shadow-md hover:shadow-lg transition-shadow"
                  >
                    {user.profilePhoto ? (
                        <img
                          src={`${user.profilePhoto}`}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span className={user.profilePhoto ? 'hidden' : ''}>
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </motion.div>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg transition-shadow duration-300"
                >
                  <LogOut size={18} />
                  Logout
                </motion.button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 hover:text-blue-600"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 space-y-4"
          >
            <Link
              to="/feed"
              onClick={() => setIsOpen(false)}
              className="block text-gray-700 hover:text-blue-600 font-medium"
            >
              Feed
            </Link>
            {user && (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {user.profilePhoto ? (
                        <img
                          src={`${user.profilePhoto}`}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span className={user.profilePhoto ? 'hidden' : ''}>
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </Link>
                <div className="pt-4 border-t">
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white w-full"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
