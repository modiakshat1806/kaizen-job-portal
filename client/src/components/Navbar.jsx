import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { User, QrCode, Home, Building, X, Menu } from 'lucide-react'
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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [greeting, setGreeting] = useState('')

  // Set the greeting only once when the component mounts
  useEffect(() => {
    setGreeting(getGreeting())
  }, [])

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/assessment', label: 'Assessment', icon: User },
    { path: '/post-job', label: 'For Companies', icon: Building },
    { path: '/scan', label: 'Scan QR', icon: QrCode },
  ]

  const NavLink = ({ item }) => {
    const Icon = item.icon
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
        {/* --- Creative Feature: Animated Underline --- */}
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
    <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-700/50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Dynamic Greeting */}
          <div className="flex items-center space-x-4">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>
              {/* Pass showText={false} to hide the "Jobs" tag */}
              <Logo showText={false} />
            </Link>
            <div className="hidden lg:block text-sm text-gray-400 font-light">
              {greeting}
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
          </div>

          {/* Right side actions - User Profile */}
          <div className="flex items-center space-x-4">
             <div className="hidden md:block bg-gray-700/50 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                Demo Mode
             </div>
             {/* --- Creative Feature: User Profile Mockup --- */}
             <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
             </div>
             {/* Mobile Menu Button */}
             <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-lg text-gray-300 hover:text-white"
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
            <div className="px-2 pt-2 pb-4 space-y-2 border-t border-gray-700/50">
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
