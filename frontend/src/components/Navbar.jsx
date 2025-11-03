import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, LogOut } from 'lucide-react';
import { clearAuth, isAuthenticated, getUserFromStorage } from '../utils/auth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
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

    const handleStorageChange = () => checkAuth();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    navigate('/auth');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          {/* Left-aligned Logo */}
          <Link
            to="/feed"
            className="flex items-center text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent"
            style={{ paddingLeft: '10px', marginLeft: '5px' }}
          >
            LinkUp
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
              <div className="relative" ref={dropdownRef}>
                {/* Profile Icon */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
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

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100"
                  >
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </motion.div>
                )}
              </div>
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
                <div className="pt-4 border-t">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut size={16} /> Logout
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
