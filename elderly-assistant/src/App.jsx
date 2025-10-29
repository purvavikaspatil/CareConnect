import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Reminders from './pages/Reminders'
import Contacts from './pages/Contacts'
import Help from './pages/Help'
import VoiceAssistantPage from './pages/VoiceAssistantPage'
import FriendConnect from './pages/FriendConnect'
import AIGuardian from './pages/AIGuardian'
import SOSDashboard from './pages/SOSDashboard'
import Profile from './pages/Profile'

// Premium page transition variants with organic easing
const pageVariants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 0.98,
  },
}

const pageTransition = {
  type: 'tween',
  ease: [0.25, 1, 0.5, 1], // Custom organic easing
  duration: 0.5,
}

function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col animated-bg-hero transition-colors duration-500 relative overflow-x-hidden">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
          <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
          <Route path="/reminders" element={<PageWrapper><Reminders /></PageWrapper>} />
          <Route path="/contacts" element={<PageWrapper><Contacts /></PageWrapper>} />
          <Route path="/help" element={<PageWrapper><Help /></PageWrapper>} />
          <Route path="/voice" element={<PageWrapper><VoiceAssistantPage /></PageWrapper>} />
          <Route path="/friends" element={<PageWrapper><FriendConnect /></PageWrapper>} />
          <Route path="/guardian" element={<PageWrapper><AIGuardian /></PageWrapper>} />
          <Route path="/sos-dashboard" element={<PageWrapper><SOSDashboard /></PageWrapper>} />
          <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </div>
  )
}

// Page wrapper with animations
function PageWrapper({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  )
}

export default App
