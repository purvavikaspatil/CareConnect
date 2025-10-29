/**
 * Reusable Animation Utilities for Framer Motion
 * 
 * This file contains all animation variants, transitions, and utilities
 * used throughout the CareConnect application for consistent motion design.
 */

// ==================== EASING FUNCTIONS ====================

export const easings = {
  // Custom organic easing inspired by Apple
  organic: [0.25, 1, 0.5, 1],
  // Smooth spring-like easing
  smooth: [0.4, 0, 0.2, 1],
  // Bouncy animation
  bounce: [0.68, -0.55, 0.265, 1.55],
  // Sharp entry, smooth exit
  sharp: [0.4, 0, 0.6, 1],
}

// ==================== PAGE TRANSITIONS ====================

export const pageVariants = {
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

export const pageTransition = {
  type: 'tween',
  ease: easings.organic,
  duration: 0.5,
}

// ==================== FADE ANIMATIONS ====================

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.4, ease: easings.smooth }
  },
}

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: easings.organic }
  },
}

export const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: easings.organic }
  },
}

export const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: easings.organic }
  },
}

export const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: easings.organic }
  },
}

// ==================== SCALE ANIMATIONS ====================

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: 'spring',
      stiffness: 200,
      damping: 20
    }
  },
}

export const scaleInBounce = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 15,
      bounce: 0.4
    }
  },
}

// ==================== STAGGER CONTAINERS ====================

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  },
}

export const staggerContainerFast = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    }
  },
}

export const staggerContainerSlow = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    }
  },
}

// ==================== CARD ANIMATIONS ====================

export const cardVariants = {
  hidden: { opacity: 0, y: 50, rotateX: -10 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
    }
  },
}

export const cardHover = {
  scale: 1.03,
  y: -8,
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.12)",
  transition: {
    type: 'spring',
    stiffness: 400,
    damping: 25,
  }
}

// ==================== BUTTON ANIMATIONS ====================

export const buttonHover = {
  scale: 1.05,
  transition: {
    type: 'spring',
    stiffness: 400,
    damping: 20,
  }
}

export const buttonTap = {
  scale: 0.95,
}

export const buttonGlow = {
  scale: 1.08,
  boxShadow: "0px 0px 20px rgba(100, 180, 255, 0.6)",
  transition: {
    type: 'spring',
    stiffness: 400,
    damping: 25,
  }
}

// ==================== MESSAGE/CHAT ANIMATIONS ====================

export const messageVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: 'spring', 
      stiffness: 200, 
      damping: 20 
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    transition: { duration: 0.2 } 
  }
}

// ==================== ICON ANIMATIONS ====================

export const iconRotate = {
  rotate: [0, 360],
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: "linear"
  }
}

export const iconBounce = {
  y: [0, -10, 0],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: "easeInOut"
  }
}

export const iconPulse = {
  scale: [1, 1.2, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }
}

export const iconWiggle = {
  rotate: [0, -5, 5, 0],
  transition: {
    duration: 0.5,
    repeat: 3,
  }
}

// ==================== BACKGROUND ANIMATIONS ====================

export const floatingOrb = {
  scale: [1, 1.2, 1],
  opacity: [0.3, 0.5, 0.3],
  transition: {
    duration: 8,
    repeat: Infinity,
    ease: "easeInOut"
  }
}

export const floatingOrbSlow = {
  scale: [1.2, 1, 1.2],
  opacity: [0.3, 0.5, 0.3],
  transition: {
    duration: 10,
    repeat: Infinity,
    ease: "easeInOut"
  }
}

// ==================== LIST ITEM ANIMATIONS ====================

export const listItemVariants = {
  hidden: { opacity: 0, x: -30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: { 
      type: 'spring', 
      stiffness: 100,
      damping: 15 
    }
  },
  exit: {
    opacity: 0,
    x: -50,
    scale: 0.9,
    transition: { duration: 0.2 }
  }
}

// ==================== MODAL/POPUP ANIMATIONS ====================

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      type: 'spring', 
      stiffness: 150,
      damping: 20 
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -30,
    transition: { duration: 0.2 }
  }
}

export const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }
  }
}

// ==================== NOTIFICATION/TOAST ANIMATIONS ====================

export const notificationSlideIn = {
  hidden: { opacity: 0, y: -50, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: 'spring', 
      stiffness: 200,
      damping: 20 
    }
  },
  exit: {
    opacity: 0,
    y: -50,
    scale: 0.9,
    transition: { duration: 0.2 }
  }
}

// ==================== LOADING ANIMATIONS ====================

export const spinnerVariants = {
  rotate: 360,
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: "linear"
  }
}

export const pulseVariants = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: "easeInOut"
  }
}

export const breathingVariants = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
}

// ==================== RIPPLE EFFECT ====================

export const rippleVariants = {
  initial: {
    scale: 1,
    opacity: 1,
  },
  animate: {
    scale: 1.5,
    opacity: 0,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeOut"
    }
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Create a custom stagger container with specific timing
 * @param {number} stagger - Time between each child animation
 * @param {number} delay - Initial delay before animations start
 */
export const createStaggerContainer = (stagger = 0.1, delay = 0.2) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    }
  },
})

/**
 * Create a custom fade in variant with specific direction and distance
 * @param {string} direction - 'up', 'down', 'left', 'right'
 * @param {number} distance - Distance to travel in pixels
 */
export const createFadeIn = (direction = 'up', distance = 20) => {
  const axis = ['up', 'down'].includes(direction) ? 'y' : 'x'
  const value = ['down', 'right'].includes(direction) ? distance : -distance

  return {
    hidden: { opacity: 0, [axis]: value },
    visible: { 
      opacity: 1, 
      [axis]: 0,
      transition: { duration: 0.5, ease: easings.organic }
    },
  }
}

/**
 * Create glow animation for buttons or elements
 * @param {string} color - RGB color for the glow
 * @param {number} intensity - Glow intensity (0-1)
 */
export const createGlowAnimation = (color = "100, 180, 255", intensity = 0.6) => ({
  boxShadow: [
    `0 0 20px rgba(${color}, ${intensity * 0.5})`,
    `0 0 40px rgba(${color}, ${intensity})`,
    `0 0 20px rgba(${color}, ${intensity * 0.5})`
  ],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }
})

// ==================== PRESETS ====================

export const presets = {
  // Common animation presets for quick use
  fadeIn,
  fadeInUp,
  scaleIn,
  cardVariants,
  messageVariants,
  listItemVariants,
  staggerContainer,
  buttonHover,
  buttonTap,
  buttonGlow,
  cardHover,
}

export default presets

