import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Heart, Brain, Video, Shield } from 'lucide-react'
import UnifiedAssistant from '../components/UnifiedAssistant'

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -10 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 20
      }
    }
  }

  return (
    <main className="flex-grow relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 min-h-[calc(100vh-4rem)]">
        <motion.div 
          className="max-w-6xl w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Section */}
          <motion.div className="text-center mb-12" variants={itemVariants}>
            {/* Animated Badge */}
            <motion.div
              className="inline-flex items-center gap-2 glass-strong px-5 py-2 rounded-full mb-6 shadow-lg"
              whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(100, 180, 255, 0.4)" }}
            >
              <Sparkles size={18} className="text-primary-600 dark:text-primary-300" />
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-300">
                Your Digital Companion
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black dark:text-white mb-6 leading-tight tracking-tight"
              variants={itemVariants}
            >
              Welcome to{' '}
              <span className="text-blue-700 dark:text-primary-300 font-extrabold">
                CareConnect
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              className="text-lg sm:text-xl lg:text-2xl text-gray-900 dark:text-gray-100 mb-10 max-w-3xl mx-auto leading-relaxed font-medium"
              variants={itemVariants}
            >
              Your trusted companion for daily reminders, health tracking, and staying connected with loved ones. 
              <br />
              <span className="text-gray-900 dark:text-primary-300 font-bold">We're here to make every day easier and more comfortable.</span>
            </motion.p>

            {/* Action Buttons - Only show if NOT logged in */}
            {!isLoggedIn && (
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center"
                variants={itemVariants}
              >
                <Link to="/signup">
                  <motion.button
                    className="bg-gradient-to-r from-primary-500 via-secondary-400 to-accent-400 text-white font-bold text-lg sm:text-xl px-10 py-5 rounded-full shadow-2xl hover-lift relative overflow-hidden group"
                    whileHover={{ scale: 1.08, boxShadow: "0px 0px 25px rgba(90, 96, 248, 0.6)" }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Sparkles size={20} />
                      Get Started Free
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-accent-400 via-secondary-400 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                  </motion.button>
                </Link>
                <Link to="/login">
                  <motion.button
                    className="glass-strong text-text-primary-light dark:text-text-primary-dark font-semibold text-lg px-8 py-4 rounded-full border-2 border-warm-300 dark:border-warm-600 hover:border-primary-400 dark:hover:border-primary-500"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign In
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </motion.div>

          {/* Unified AI Assistant - Show if logged in */}
          {isLoggedIn && (
            <motion.div 
              className="mb-16"
              variants={itemVariants}
            >
              <UnifiedAssistant />
            </motion.div>
          )}

          {/* Feature Cards with Stagger Animation */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
            variants={containerVariants}
          >
            {[
              {
                icon: Shield,
                color: 'from-primary-500 to-primary-700',
                bgColor: 'bg-primary-50 dark:bg-primary-900/20',
                iconColor: 'text-primary-600 dark:text-primary-400',
                title: 'AI Companion',
                description: '24/7 empathetic AI that listens and helps with tasks'
              },
              {
                icon: Video,
                color: 'from-secondary-400 to-secondary-600',
                bgColor: 'bg-secondary-50 dark:bg-secondary-900/20',
                iconColor: 'text-secondary-500 dark:text-secondary-400',
                title: 'Video Chats',
                description: 'Connect with friends who share your interests'
              },
              {
                icon: Heart,
                color: 'from-danger to-danger-dark',
                bgColor: 'bg-red-50 dark:bg-red-900/20',
                iconColor: 'text-red-600 dark:text-red-400',
                title: 'Emergency SOS',
                description: 'Voice-activated emergency alerts with GPS location'
              },
              {
                icon: Brain,
                color: 'from-accent-400 to-accent-600',
                bgColor: 'bg-accent-50 dark:bg-accent-900/20',
                iconColor: 'text-accent-600 dark:text-accent-400',
                title: 'Smart Reminders',
                description: 'Never miss medications or appointments'
              }
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.03,
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.12)"
                  }}
                  className="glass-card p-6 sm:p-8 rounded-3xl cursor-pointer group"
                >
                  <motion.div 
                    className={`w-14 h-14 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className={`w-7 h-7 ${feature.iconColor}`} />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-200 text-base leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Trust Badge */}
          <motion.div 
            className="mt-16 text-center"
            variants={itemVariants}
          >
            <motion.div
              className="inline-flex items-center gap-3 glass-strong px-6 py-3 rounded-full"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Heart className="text-danger" size={20} />
              <span className="text-sm text-gray-700 dark:text-gray-200">
                Trusted by <strong className="text-primary-700 dark:text-primary-300">10,000+</strong> seniors worldwide
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}

export default Home

