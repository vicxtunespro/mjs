'use client';

import { useState, useReducer, useEffect, useRef } from 'react';
import React from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, ColumnsSettingsIcon, HelpCircle, LayoutDashboard, MessageSquare, SidebarClose, SidebarOpenIcon, User, X, Menu } from 'lucide-react';

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
    isMinimised: true,
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
      setIsMobile(window.innerWidth < 640); // Tailwind's 'sm' breakpoint
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

  // Set active menu based on current pathname
  useEffect(() => {
    // Map paths to menu IDs
    const pathToMenuMap = {
      '/admin/dashboard': 'dashboard',
      '/admin/mails': 'Mails',
      '/admin/notifications': 'notifications',
      // Add more path mappings as needed
    };
    
    // Check if current path matches any mapped path
    for (const [path, menuId] of Object.entries(pathToMenuMap)) {
      if (pathname.startsWith(path)) {
        setActiveMenu(menuId);
        break;
      }
    }
    
    // For dropdown items, you might need more complex logic
    if (pathname.includes('/admin/students')) {
      setActiveMenu('learners');
      setActiveDropdown('student_management');
      dispatch({ type: 'TOGGLE_DROPDOWN' });
    }
  }, [pathname]);

  const drawerContent = (
    <div className="w-full p-4 h-full bg-primary dark:bg-secondary">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-8 h-8 text-secondary  dark:text-primary mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
          </motion.div>
          <motion.h2 
            className={`text-xl font-bold text-secondary  dark:text-primary ${state.isMinimised && !isMobile ? 'hidden' : 'block'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            METRO SMS
          </motion.h2>
        </div>
        {!isMobile && (
          <motion.button
            onClick={toggleMenu}
            className="text-secondary  dark:text-primary hover:text-secondary dark:text-primary"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <SidebarClose className={`${state.isMinimised ? 'hidden' : 'block'} w-6 h-6`} />
          </motion.button>
        )}
      </div>

      <MenuLink
        id="dashboard"
        href="/admin/dashboard"
        title="Dashboard"
        icon={LayoutDashboard}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isDropdownOpen={state.isDropdownOpen}
        setActiveDropdown={setActiveDropdown}
        isMinimised={state.isMinimised && !isMobile}
        closeDropdowns={closeDropdowns}
        pathname={pathname}
      />

      <MenuDropdown 
        id="student_management"
        href="#"
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
          href="/admin/students/admissions"
          title="Admissions"
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          isDropdownOpen={state.isDropdownOpen}
          isMinimised={state.isMinimised && !isMobile}
          isDown={activeDropdown === "student_management"}
          isDropper={true}
          closeDropdowns={closeDropdowns}
          pathname={pathname}
        />
        <MenuLink
          id="learners"
          href="/admin/students/learners"
          title="View Learners"
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          isDropdownOpen={state.isDropdownOpen}
          isMinimised={state.isMinimised && !isMobile}
          isDown={activeDropdown === "student_management"}
          isDropper={true}
          closeDropdowns={closeDropdowns}
          pathname={pathname}
        />
        <MenuLink
          id="Performance"
          href="/admin/students/performance"
          title="Performance"
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          isDropdownOpen={state.isDropdownOpen}
          isMinimised={state.isMinimised && !isMobile}
          isDown={activeDropdown === "student_management"}
          isDropper={true}
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
        isDropdownOpen={state.isDropdownOpen}
        setActiveDropdown={setActiveDropdown}
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
        isDropdownOpen={state.isDropdownOpen}
        isMinimised={state.isMinimised && !isMobile}
        setActiveDropdown={setActiveDropdown}
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
          isDropdownOpen={state.isDropdownOpen}
          isMinimised={state.isMinimised && !isMobile}
          isDown={activeDropdown === "help"}
          isDropper={true}
          closeDropdowns={closeDropdowns}
          pathname={pathname}
        />
        <MenuLink
          id="support"
          href="/admin/help/support"
          title="Support Ticket"
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          isDropdownOpen={state.isDropdownOpen}
          isMinimised={state.isMinimised && !isMobile}
          isDown={activeDropdown === "help"}
          isDropper={true}
          closeDropdowns={closeDropdowns}
          pathname={pathname}
        />
        <MenuLink
          id="contact"
          href="/admin/help/contact"
          title="Contact Us"
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          isDropdownOpen={state.isDropdownOpen}
          isMinimised={state.isMinimised && !isMobile}
          isDown={activeDropdown === "help"}
          isDropper={true}
          closeDropdowns={closeDropdowns}
          pathname={pathname}
        />
      </MenuDropdown>
    </div>
  );

  return (
    <div className="flex">
      {/* Hamburger Menu for Mobile */}
      {isMobile && (
        <button
          onClick={toggleMenu}
          className="fixed z-50 top-4 left-4 text-secondary  dark:text-primary bg-primary dark:bg-secondary p-2 rounded-lg hover:text-secondary dark:text-primary"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed z-50 left-0 h-screen bg-primary dark:bg-secondary shadow-lg transition-all duration-300 ease-in-out',
          {
            'w-64': !isMobile && !state.isMinimised,
            'w-16': !isMobile && state.isMinimised,
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
            className="absolute top-4 right-4 text-secondary  dark:text-primary hover:text-secondary dark:text-primary"
          >
            <X size={24} />
          </button>
        )}
        {!isMobile && (
          <motion.button
            onClick={toggleMenu}
            className={clsx(
              'absolute -right-6 top-4 text-secondary  dark:text-primary bg-primary dark:bg-secondary p-2 pl-3 rounded-lg hover:text-secondary dark:text-primary',
              { hidden: !state.isMinimised }
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <SidebarOpenIcon className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Main Content Area */}
      <div
        className={clsx(
          'flex-1 transition-all duration-300',
          {
            'ml-64': !isMobile && !state.isMinimised,
            'ml-16': !isMobile && state.isMinimised,
            'ml-0': isMobile,
          }
        )}
      >
      </div>
    </div>
  );
};

const MenuLink = ({ 
  id, 
  href, 
  activeMenu, 
  setActiveMenu, 
  isDropdownOpen, 
  title, 
  icon: Icon, 
  issues, 
  isDown, 
  setActiveDropdown, 
  isMinimised, 
  isDropper, 
  closeDropdowns,
  pathname 
}) => {
  const isActive = activeMenu === id || (href && pathname.startsWith(href));

  const handleClick = () => {
    setActiveMenu(id);
    if (isDown) {
      closeDropdowns();
    }
  };

  return (
    <motion.div 
      className="mb-2 text-sm flex items-center"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <a
        href={href || '#'}
        onClick={handleClick}
        className={clsx(
          'relative flex items-center w-full p-2 gap-2 text-secondary  dark:text-primary hover:bg-primary-hover rounded-lg transition-colors duration-200',
          { 
            'bg-cta hover:bg-cta text-primary dark:text-secondary rounded-lg': isActive && !isDown,
            'bg-rose-600 hover:bg-rose-600 text-primary': isActive && isDown,
          }
        )}
      >
        {Icon && <Icon size={21} />}
        <span className={clsx('', { hidden: isMinimised && isDropper, hidden: isMinimised && !isDropper })}>
          {title}
        </span>

        {issues && (
          <motion.span
            className={clsx(
              'absolute right-4 bg-secondary rounded-full w-5 h-5 flex items-center justify-center text-[10px]',
              {
                'bg-primary dark:bg-secondary text-secondary dark:text-primary': isActive,
                'bg-secondary text-primary': !isActive,
              }
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            12
          </motion.span>
        )}
      </a>
    </motion.div>
  );
};

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
  const isDown = activeDropdown === id;
  const isActive = activeMenu === id || React.Children.toArray(children).some(child => 
    child.props.href && pathname.startsWith(child.props.href)
  );

  const handleClick = () => {
    toggleDropdown();
    setActiveDropdown(id);
    setActiveMenu(id);
  };

  return (
    <div className="mb-4 text-sm relative">
      <motion.button 
        onClick={handleClick}
        className={clsx(
          'flex items-center w-full p-2 mb-1 text-secondary  dark:text-primary hover:bg-cta rounded-lg gap-2 transition-colors duration-200',
          { 
            'bg-cta hover:bg-cta text-secondary dark:text-primary': isActive && isDown,
            'bg-primary-hover hover:bg-ba text-secondary dark:text-primary': isDown 
          }
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {Icon && <Icon size={21} />}
        <span className={clsx('', { hidden: isMinimised })}>
          {title}
        </span>
        <motion.svg 
          className={clsx('w-4 h-4 ml-auto', { hidden: isMinimised })}
          animate={{ rotate: isDown && isDropdownOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>
      
      <AnimatePresence>
        {isDown && isDropdownOpen && (
          <motion.div
            className={clsx(
              'bg-primary dark:bg-secondary rounded-lg overflow-hidden',
              { 'shadow-md absolute -right-54 top-1 p-2 w-48': isMinimised }
            )}
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