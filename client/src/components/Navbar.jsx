import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { User, Home, Building, X, Menu, ChevronDown, GraduationCap, FileText, BarChart3, Briefcase, Moon, Sun } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
// NEW: Import motion for animations
import { motion, AnimatePresence } from 'framer-motion'
import Logo from './Logo'

// --- Creative Feature: Dynamic Greeting ---
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

const Navbar = () => {
  const location = useLocation()
  const { isDarkMode, toggleTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [greeting, setGreeting] = useState('')
  const [studentsDropdown, setStudentsDropdown] = useState(false)
  const [companiesDropdown, setCompaniesDropdown] = useState(false)
  const [dropdownTimeout, setDropdownTimeout] = useState(null)

  // Set the greeting only once when the component mounts
  useEffect(() => {
    setGreeting(getGreeting())
  }, [])

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    {
      label: 'For Students',
      icon: GraduationCap,
      hasDropdown: true,
      dropdownItems: [
        { path: '/assessment', label: 'Take Assessment', icon: FileText },
        { path: '/saved-jobs', label: 'Saved Jobs', icon: User }
      ]
    },
    {
      label: 'For Companies',
      icon: Building,
      hasDropdown: true,
      dropdownItems: [
        { path: '/post-job', label: 'Post a Job', icon: Briefcase },
        { path: '/results', label: 'View Results', icon: BarChart3 }
      ]
    },
  ]

  const NavLink = ({ item }) => {
    const Icon = item.icon

    if (item.hasDropdown) {
      const isDropdownOpen = item.label === 'For Students' ? studentsDropdown : companiesDropdown
      const setDropdownOpen = item.label === 'For Students' ? setStudentsDropdown : setCompaniesDropdown

      return (
        <div
          className="relative"
          onMouseEnter={() => {
            // Clear any existing timeout
            if (dropdownTimeout) {
              clearTimeout(dropdownTimeout)
              setDropdownTimeout(null)
            }
            // Close other dropdowns immediately
            if (item.label === 'For Students') {
              setCompaniesDropdown(false)
            } else {
              setStudentsDropdown(false)
            }
            setDropdownOpen(true)
          }}
          onMouseLeave={() => {
            const timeout = setTimeout(() => setDropdownOpen(false), 200)
            setDropdownTimeout(timeout)
          }}
        >
          <button
            onClick={() => {
              // Toggle dropdown on click - if it's open, keep it open; if closed, open it
              setDropdownOpen(!isDropdownOpen)
              // Close other dropdown when clicking
              if (item.label === 'For Students') {
                setCompaniesDropdown(false)
              } else {
                setStudentsDropdown(false)
              }
            }}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white transition-colors duration-300 whitespace-nowrap"
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50"
              >
                {item.dropdownItems.map((dropdownItem) => {
                  const DropdownIcon = dropdownItem.icon
                  return (
                    <Link
                      key={dropdownItem.path}
                      to={dropdownItem.path}
                      onClick={() => {
                        setDropdownOpen(false)
                        setIsMenuOpen(false)
                        // Scroll to top for specific pages
                        if (dropdownItem.path === '/assessment' || dropdownItem.path === '/post-job' || dropdownItem.path === '/career-roles' || dropdownItem.path === '/results') {
                          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
                        }
                      }}
                      className="flex items-center space-x-2 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg transition-colors duration-200"
                    >
                      <DropdownIcon className="w-4 h-4" />
                      <span>{dropdownItem.label}</span>
                    </Link>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )
    }

    const isActive = location.pathname === item.path
    return (
      <Link
        to={item.path}
        onClick={() => setIsMenuOpen(false)}
        className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
          isActive ? 'text-white' : 'text-gray-300 hover:text-white'
        }`}
      >
        <Icon className="w-4 h-4" />
        <span>{item.label}</span>
        {isActive && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"
            layoutId="underline"
            initial={false}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
      </Link>
    )
  }

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 backdrop-blur-lg border-b border-gray-700/50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-20">
          {/* Logo - Left Side */}
          <div className="flex items-center flex-1">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex-shrink-0">
              <Logo />
            </Link>
          </div>

          {/* Desktop Menu - Center */}
          <div className="hidden md:flex items-center space-x-6 flex-1 justify-center">
            {navItems.map((item, index) => (
              <NavLink key={item.path || index} item={item} />
            ))}
          </div>

          {/* Right side - Greeting, Theme Toggle and User Profile */}
          <div className="flex items-center justify-end space-x-4 flex-1">
             {/* Greeting */}
             <div className="hidden lg:block text-sm text-gray-400 dark:text-gray-300 font-light">
               {greeting}, Admin
             </div>

             {/* Theme Toggle */}
             <button
               onClick={toggleTheme}
               className="p-2 rounded-lg text-gray-300 hover:text-white transition-colors duration-200 hover:bg-gray-800"
               aria-label="Toggle theme"
             >
               {isDarkMode ? (
                 <Sun className="w-5 h-5" />
               ) : (
                 <Moon className="w-5 h-5" />
               )}
             </button>

             {/* Admin Profile */}
             <Link
               to="/admin"
               className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 cursor-pointer group"
               title="Admin Dashboard"
               onClick={() => setIsMenuOpen(false)}
             >
                <User className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
             </Link>

             {/* Mobile Menu Button and Theme Toggle */}
             <div className="md:hidden flex items-center space-x-2">
                {/* Mobile Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-gray-300 hover:text-white dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
                  aria-label="Toggle theme"
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-lg text-gray-300 hover:text-white dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Now with smooth animation) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
          >
            <div className="px-2 pt-2 pb-4 space-y-2 border-t border-gray-700/50 bg-gray-900">
              {navItems.map((item) => (
                <NavLink key={item.path} item={item} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
