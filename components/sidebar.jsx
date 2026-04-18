'use client';

import { useState, useReducer, useEffect, useRef } from 'react';
import React from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, HelpCircle, LayoutDashboard, MessageSquare, SidebarClose, SidebarOpenIcon, User, X, Menu, ChevronDown, Search } from 'lucide-react';

const Sidebar = ({ userName = 'User', userRole = 'Staff' }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef(null);
  const pathname = usePathname();

  const reducer = (state, action) => {
    switch (action.type) {
      case 'TOGGLE_DROPDOWN':
        return { ...state, isDropdownOpen: !state.isDropdownOpen };
      case 'TOGGLE_MENU':
        return { ...state, isMinimised: !state.isMinimised };
      case 'LINK_ACTIVE':
        return { ...state, linkActive: action.payload };
      case 'TOGGLE_PREFERENCES':
        return { ...state, isPreferencesOpen: !state.isPreferencesOpen };
      case 'CLOSE_DROPDOWNS':
        return { ...state, isDropdownOpen: false };
      default:
        return state;
    }
  };

  const initialState = {
    isMinimised: false, // Changed to false by default for better UX
    isDropdownOpen: false,
    isPreferencesOpen: false,
    linkActive: null,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const toggleDropdown = () => dispatch({ type: 'TOGGLE_DROPDOWN' });
  const toggleMenu = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      dispatch({ type: 'TOGGLE_MENU' });
    }
  };
  const togglePreferences = () => dispatch({ type: 'TOGGLE_PREFERENCES' });
  const closeDropdowns = () => {
    dispatch({ type: 'CLOSE_DROPDOWNS' });
    setActiveDropdown(null);
  };

  // Detect mobile screens
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        closeDropdowns();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // FIXED: Better active state detection
  useEffect(() => {
    // Check for exact matches first
    if (pathname === '/admin/dashboard') {
      setActiveMenu('dashboard');
      setActiveDropdown(null);
    } else if (pathname === '/admin/mails') {
      setActiveMenu('Mails');
      setActiveDropdown(null);
    } else if (pathname === '/admin/notifications') {
      setActiveMenu('notifications');
      setActiveDropdown(null);
    }
    // Check for student management children
    else if (pathname.startsWith('/admin/admissions')) {
      setActiveMenu('admissions');
      setActiveDropdown('student_management');
      dispatch({ type: 'TOGGLE_DROPDOWN' });
    } else if (pathname === '/admin/students') {
      setActiveMenu('learners');
      setActiveDropdown('student_management');
      dispatch({ type: 'TOGGLE_DROPDOWN' });
    } else if (pathname.startsWith('/admin/students/bulk-upload')) {
      setActiveMenu('bulk_upload'); // You need to add this ID
      setActiveDropdown('student_management');
      dispatch({ type: 'TOGGLE_DROPDOWN' });
    }
    // Check for help desk children
    else if (pathname.startsWith('/admin/help/faq')) {
      setActiveMenu('faq');
      setActiveDropdown('help');
      dispatch({ type: 'TOGGLE_DROPDOWN' });
    } else if (pathname.startsWith('/admin/help/support')) {
      setActiveMenu('support');
      setActiveDropdown('help');
      dispatch({ type: 'TOGGLE_DROPDOWN' });
    } else if (pathname.startsWith('/admin/help/contact')) {
      setActiveMenu('contact');
      setActiveDropdown('help');
      dispatch({ type: 'TOGGLE_DROPDOWN' });
    }
  }, [pathname]);

  const drawerContent = (
    <div className="w-full p-4 h-full bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0"
          >
            <div className="w-8 h-8 flex items-center justify-center text-white font-bold">
              {!isMobile && (
                <motion.button
                  onClick={toggleMenu}
                  className="text-secondary hover:bg-secondary/20 p-2 dark:hover:text-red-400 transition-colors rounded-full"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {state.isMinimised ? (
                    <Menu className="w-6 h-6" />
                  ) : (
                    <SidebarClose className="w-5 h-5" />
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>

        </div>
        <motion.div
          className="ml-3 text-xl font-bold text-gray-900 dark:text-gray-100 overflow-hidden"
          initial={false}
          animate={{
            opacity: state.isMinimised && !isMobile ? 0 : 1,
            width: state.isMinimised && !isMobile ? 0 : "auto",
          }}
          transition={{
            duration: 0.5,
            delay: 0.1,
          }}
        >
          <Search className='w-5 h-5 text-secondary' />
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 pt-4">
        <MenuLink
          id="dashboard"
          href="/admin/dashboard"
          title="Dashboard"
          icon={LayoutDashboard}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          isMinimised={state.isMinimised && !isMobile}
          closeDropdowns={closeDropdowns}
          pathname={pathname}
        />

        <MenuDropdown
          id="student_management"
          title="Student Management"
          toggleDropdown={toggleDropdown}
          isDropdownOpen={state.isDropdownOpen}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          icon={User}
          setActiveDropdown={setActiveDropdown}
          activeDropdown={activeDropdown}
          isMinimised={state.isMinimised && !isMobile}
          closeDropdowns={closeDropdowns}
          pathname={pathname}
        >
          <MenuLink
            id="admissions"
            href="/admin/admissions"
            title="Admissions"
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            isMinimised={state.isMinimised && !isMobile}
            isSubmenu={true}
            closeDropdowns={closeDropdowns}
            pathname={pathname}
          />
          <MenuLink
            id="learners"
            href="/admin/students"
            title="View Learners"
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            isMinimised={state.isMinimised && !isMobile}
            isSubmenu={true}
            closeDropdowns={closeDropdowns}
            pathname={pathname}
          />
          <MenuLink
            id="bulk_upload"
            href="/admin/students/bulk-upload"
            title="Bulk Upload"
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            isMinimised={state.isMinimised && !isMobile}
            isSubmenu={true}
            closeDropdowns={closeDropdowns}
            pathname={pathname}
          />
          <MenuLink
            id="Data Cleaning"
            href="/admin/students/data-cleaning"
            title="Data Cleaning"
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            isMinimised={state.isMinimised && !isMobile}
            isSubmenu={true}
            closeDropdowns={closeDropdowns}
            pathname={pathname}
          />
          <MenuLink
            id="performance"
            href="/admin/performance"
            title="Performance"
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            isMinimised={state.isMinimised && !isMobile}
            isSubmenu={true}
            closeDropdowns={closeDropdowns}
            pathname={pathname}
          />
        </MenuDropdown>

        <MenuLink
          id="Mails"
          href="/admin/mails"
          title="Mails"
          icon={MessageSquare}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          isMinimised={state.isMinimised && !isMobile}
          closeDropdowns={closeDropdowns}
          pathname={pathname}
        />

        <MenuLink
          id="notifications"
          href="/admin/notifications"
          title="Notifications"
          icon={Bell}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          isMinimised={state.isMinimised && !isMobile}
          closeDropdowns={closeDropdowns}
          pathname={pathname}
        />

        <MenuDropdown
          id="help"
          title="Help Desk"
          toggleDropdown={toggleDropdown}
          isDropdownOpen={state.isDropdownOpen}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          icon={HelpCircle}
          setActiveDropdown={setActiveDropdown}
          isMinimised={state.isMinimised && !isMobile}
          activeDropdown={activeDropdown}
          closeDropdowns={closeDropdowns}
          pathname={pathname}
        >
          <MenuLink
            id="faq"
            href="/admin/help/faq"
            title="FAQ"
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            isMinimised={state.isMinimised && !isMobile}
            isSubmenu={true}
            closeDropdowns={closeDropdowns}
            pathname={pathname}
          />
          <MenuLink
            id="support"
            href="/admin/help/support"
            title="Support Ticket"
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            isMinimised={state.isMinimised && !isMobile}
            isSubmenu={true}
            closeDropdowns={closeDropdowns}
            pathname={pathname}
          />
          <MenuLink
            id="contact"
            href="/admin/help/contact"
            title="Contact Us"
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            isMinimised={state.isMinimised && !isMobile}
            isSubmenu={true}
            closeDropdowns={closeDropdowns}
            pathname={pathname}
          />
        </MenuDropdown>
      </nav>
    </div>
  );

  return (
    <div className="flex">
      {/* Hamburger Menu for Mobile */}
      {isMobile && (
        <button
          onClick={toggleMenu}
          className="fixed z-[60] top-4 left-4 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 p-2.5 rounded-lg shadow-lg hover:text-red-600 dark:hover:text-red-400 border border-gray-200 dark:border-gray-700 transition-colors"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed z-[55] left-0 h-screen bg-white dark:bg-gray-900 shadow-xl transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-800',
          {
            'w-64': !isMobile && !state.isMinimised,
            'w-20': !isMobile && state.isMinimised, // Increased from 16 to 20 for better icon spacing
            'w-64 translate-x-0': isMobile && mobileOpen,
            'w-64 -translate-x-full': isMobile && !mobileOpen,
          }
        )}
        ref={sidebarRef}
      >
        {drawerContent}
        {isMobile && mobileOpen && (
          <button
            onClick={toggleMenu}
            className="absolute top-4 right-4 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Main Content Spacer */}
      {!isMobile && (
        <div
          className={clsx(
            'flex-shrink-0 transition-all duration-300',
            state.isMinimised ? 'w-20' : 'w-64'
          )}
        />
      )}
    </div>
  );
};

// FIXED: MenuLink Component with better styling
const MenuLink = ({
  id,
  href,
  activeMenu,
  setActiveMenu,
  title,
  icon: Icon,
  issues,
  isMinimised,
  isSubmenu,
  closeDropdowns,
  pathname
}) => {
  // FIXED: Better active state detection
  const isActive = (() => {
    if (!href) return false;
    if (pathname === href) return true;
    if (href === '/admin/students' && pathname === '/admin/students') return true;
    if (href === '/admin/students/bulk-upload' && pathname === '/admin/students/bulk-upload') return true;
    if (href !== '/admin/students' && pathname.startsWith(href + '/')) return true;
    return false;
  })();

  const handleClick = (e) => {
    if (href === '#') e.preventDefault();
    setActiveMenu(id);
    if (!isSubmenu) {
      closeDropdowns();
    }
  };

  return (
    <Link href={href || '#'} passHref>
      <motion.div
        className={clsx(
          "mb-1",
          isSubmenu && "pl-10"
        )}
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.98 }}
      >
        <div
          onClick={handleClick}
          className={clsx(
            'relative flex items-center w-full rounded-lg transition-all duration-200 cursor-pointer',
            {
              'px-3 py-2': !isMinimised || isSubmenu,
              'justify-center p-2': isMinimised && !isSubmenu,
              'gap-3': !isMinimised || isSubmenu,
            },
            isActive
              ? 'bg-red-600 text-white shadow-md shadow-red-200 dark:shadow-red-900/30'
              : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          )}
        >
          {Icon && (
            <Icon
              size={isSubmenu ? 16 : 20}
              className={clsx(
                "flex-shrink-0",
                isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'
              )}
            />
          )}

          {(!isMinimised || isSubmenu) && (
            <span className="flex-1 text-sm font-medium truncate">
              {title}
            </span>
          )}

          {issues && (
            <motion.span
              className={clsx(
                'ml-auto w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium',
                isActive
                  ? 'bg-white text-red-600'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              12
            </motion.span>
          )}
        </div>
      </motion.div>
    </Link>
  );
};

// FIXED: MenuDropdown Component with proper z-index and positioning
const MenuDropdown = ({
  id,
  title,
  toggleDropdown,
  isDropdownOpen,
  activeMenu,
  setActiveMenu,
  setActiveDropdown,
  activeDropdown,
  icon: Icon,
  isMinimised,
  closeDropdowns,
  pathname,
  children
}) => {
  const dropdownRef = useRef(null);
  const isDown = activeDropdown === id;

  // FIXED: Better active state detection for dropdown parent
  const isActive = React.Children.toArray(children).some(child => {
    const href = child.props.href;
    if (!href) return false;
    if (pathname === href) return true;
    if (href === '/admin/students' && pathname === '/admin/students') return true;
    if (href === '/admin/students/bulk-upload' && pathname === '/admin/students/bulk-upload') return true;
    if (href !== '/admin/students' && pathname.startsWith(href + '/')) return true;
    return false;
  });

  const handleClick = () => {
    toggleDropdown();
    setActiveDropdown(isDown ? null : id);
    setActiveMenu(id);
  };

  // FIXED: Minimized state with hover dropdown
  if (isMinimised) {
    return (
      <div
        ref={dropdownRef}
        className="relative mb-1"
        onMouseEnter={() => setActiveDropdown(id)}
        onMouseLeave={() => setActiveDropdown(null)}
      >
        <button
          onClick={handleClick}
          className={clsx(
            'w-full p-2 rounded-lg transition-all flex justify-center relative',
            isActive || isDown
              ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
              : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          )}
          title={title}
        >
          <Icon size={20} />
        </button>

        {/* FIXED: Dropdown with higher z-index */}
        <AnimatePresence>
          {isDown && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute left-full top-0 ml-2 w-56 z-[100]"
              style={{
                filter: 'drop-shadow(0 4px 6px -1px rgb(0 0 0 / 0.1))'
              }}
            >
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-red-600 to-red-500">
                  <h3 className="text-sm font-semibold text-white">
                    {title}
                  </h3>
                </div>
                <div className="p-2">
                  {children}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Expanded state
  return (
    <div className="mb-1">
      <button
        onClick={handleClick}
        className={clsx(
          'flex items-center justify-between w-full px-3 py-2 rounded-lg transition-all group',
          isActive || isDown
            ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
            : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
        )}
      >
        <div className="flex items-center gap-3">
          <Icon
            size={20}
            className={clsx(
              "flex-shrink-0",
              isActive || isDown ? 'text-red-600' : 'text-gray-400 dark:text-gray-500'
            )}
          />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isDown && isDropdownOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown
            size={16}
            className={clsx(
              "transition-colors",
              isActive || isDown ? 'text-red-600' : 'text-gray-400 dark:text-gray-500'
            )}
          />
        </motion.div>
      </button>

      <AnimatePresence>
        {isDown && isDropdownOpen && (
          <motion.div
            className="overflow-hidden pl-9 mt-1 space-y-0.5"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sidebar;