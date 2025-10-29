import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Bell, Users, HelpCircle, Mic, UserCircle, MessageCircle, Shield, AlertCircle, LogOut, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const { darkMode, toggleTheme } = useTheme()

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (token && user) {
      setIsLoggedIn(true)
      try {
        const userData = JSON.parse(user)
        setUserName(userData.name)
      } catch (e) {
        console.error('Error parsing user data:', e)
      }
    } else {
      setIsLoggedIn(false)
      setUserName('')
    }
  }, [location])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setUserName('')
    setMenuOpen(false)
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  // Navigation items with icons
  const navItems = isLoggedIn ? [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: Shield },
    { path: '/reminders', label: 'Reminders', icon: Bell },
    { path: '/contacts', label: 'Contacts', icon: Users },
    { path: '/help', label: 'Help', icon: HelpCircle },
    { path: '/voice', label: 'Voice', icon: Mic },
    { path: '/friends', label: 'Friends', icon: MessageCircle },
    { path: '/guardian', label: 'AI', icon: Shield },
    { path: '/sos-dashboard', label: 'SOS', icon: AlertCircle },
    { path: '/profile', label: 'Profile', icon: UserCircle },
  ] : [
    { path: '/', label: 'Home', icon: Home },
  ]

  return (
    <motion.nav 
      className="glass-navbar sticky top-0 z-50 shadow-lg"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* App Title with Logo Animation */}
          <motion.div 
            className="flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <Link to="/" className="flex items-center gap-2">
              <motion.div
                className="text-2xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                💙
              </motion.div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-primary-600 dark:text-primary-300">
                CareConnect
              </h1>
            </Link>
          </motion.div>

          {/* Desktop Navigation Links with Animated Underlines */}
          <div className="hidden lg:flex lg:space-x-1 lg:items-center">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.path} to={item.path} className="relative px-3 py-2 group">
                  <motion.div
                    className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
                    whileHover={{ y: -2 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </motion.div>
                  {isActive(item.path) && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-400 rounded-full"
                      layoutId="navbar-underline"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
            
            {/* Theme Toggle Button */}
            <motion.button
              onClick={toggleTheme}
              className="glass px-3 py-2 rounded-full ml-2"
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400 }}
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <Sun size={20} className="text-warning" />
              ) : (
                <Moon size={20} className="text-primary-600" />
              )}
            </motion.button>
            
            {isLoggedIn ? (
              <>
                <motion.div 
                  className="flex items-center gap-2 px-3 py-2 ml-2 glass rounded-full"
                  whileHover={{ scale: 1.05 }}
                >
                  <UserCircle size={16} className="text-primary-600 dark:text-primary-400" />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{userName}</span>
                </motion.div>
                <motion.button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-gradient-to-r from-danger to-danger-dark text-white font-medium px-4 py-2 rounded-full shadow-md ml-2"
                  whileHover={{ scale: 1.08, boxShadow: "0px 0px 12px rgba(229, 57, 53, 0.6)" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </motion.button>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-4">
                <Link to="/login">
                  <motion.button
                    className="text-gray-800 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 font-medium px-4 py-2 rounded-full transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Login
                  </motion.button>
                </Link>
                <Link to="/signup">
                  <motion.button
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold px-5 py-2 rounded-full shadow-md"
                    whileHover={{ scale: 1.08, boxShadow: "0px 0px 12px rgba(90, 96, 248, 0.6)" }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    Sign Up
                  </motion.button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu Button */}
          <motion.div className="lg:hidden">
            <motion.button
              onClick={() => setMenuOpen(!menuOpen)}
              className="glass p-2 rounded-lg text-gray-700"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-expanded={menuOpen}
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Mobile Menu with Premium Animation */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="lg:hidden glass-strong border-t border-white/30"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
          >
            <motion.div 
              className="px-4 pt-4 pb-3 space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {navItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                          : 'text-gray-800 dark:text-gray-100 hover:bg-white/50 dark:hover:bg-white/10'
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                )
              })}
              
              {/* Theme Toggle in Mobile Menu */}
              <motion.button
                onClick={toggleTheme}
                className="w-full flex items-center justify-center gap-3 glass px-4 py-3 rounded-xl mt-2 font-medium"
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navItems.length * 0.05 }}
              >
                {darkMode ? (
                  <>
                    <Sun size={20} className="text-warning" />
                    <span className="text-gray-800 dark:text-gray-100">Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon size={20} className="text-primary-600" />
                    <span className="text-gray-800 dark:text-gray-100">Dark Mode</span>
                  </>
                )}
              </motion.button>

              {isLoggedIn ? (
                <>
                  <motion.div 
                    className="flex items-center gap-3 px-4 py-3 glass rounded-xl mt-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navItems.length + 1) * 0.05 }}
                  >
                    <UserCircle size={20} className="text-primary-600 dark:text-primary-400" />
                    <span className="font-medium text-gray-800 dark:text-gray-100">{userName}</span>
                  </motion.div>
                  <motion.button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-danger to-danger-dark text-white font-semibold px-4 py-3 rounded-xl shadow-md mt-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navItems.length + 2) * 0.05 }}
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </motion.button>
                </>
              ) : (
                <div className="space-y-2 mt-2">
                  <Link
                    to="/login"
                    className="block text-center text-gray-800 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 font-medium px-4 py-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-all"
                    onClick={() => setMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block text-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold px-4 py-3 rounded-xl shadow-md"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar

