import React from 'react';
import { motion } from 'framer-motion';

/**
 * LoadingScreen Component - Premium XLance Loading Animation
 * A professional, modern loading screen with smooth animations
 * Supports light & dark mode with glassmorphism design
 *
 * @param {string} size - Logo size: 'sm' (80px) | 'md' (96px) | 'lg' (128px) - default: 'lg'
 * @param {boolean} fullscreen - If true, fills entire viewport; if false, inline centered - default: true
 * @returns {JSX.Element}
 */
const LoadingScreen = ({ size = 'lg', fullscreen = true }) => {
  const sizeMap = {
    sm: { container: 'w-20 h-20', glow: 'w-28 h-28', ring: 'w-32 h-32' },
    md: { container: 'w-24 h-24', glow: 'w-32 h-32', ring: 'w-40 h-40' },
    lg: { container: 'w-32 h-32', glow: 'w-40 h-40', ring: 'w-48 h-48' },
  };

  const currentSize = sizeMap[size] || sizeMap.lg;

  const containerClasses = fullscreen
    ? 'fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-950 z-50'
    : 'flex items-center justify-center py-12';

  const logoVariants = {
    rotate: {
      rotate: [0, 360],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  const ringVariants = {
    scale: {
      scale: [1, 1.15, 1],
      opacity: [0.5, 0.2, 0.5],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    scale2: {
      scale: [1.1, 0.9, 1.1],
      opacity: [0.3, 0.6, 0.3],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 0.3,
      },
    },
  };

  // Particles setup (3-6 faint dots)
  const particles = [
    { x: -48, y: -20, size: 6, delay: 0 },
    { x: 52, y: -8, size: 5, delay: 0.3 },
    { x: -12, y: 56, size: 4, delay: 0.6 },
    { x: 36, y: 44, size: 5, delay: 0.9 },
  ];

  return (
    <div className={containerClasses}>
      {/* Animated Background Gradient Glow (fullscreen only) */}
      {fullscreen && (
        <motion.div
          animate={{
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary-500/20 via-primary-400/10 to-primary-500/20 dark:from-primary-400/30 dark:via-primary-500/20 dark:to-primary-400/30 rounded-full blur-3xl" />
        </motion.div>
      )}

      {/* Outer Animated Ring (Primary) */}
      <div className="absolute flex items-center justify-center">
        <motion.div
          className={`rounded-full border-2 border-primary-500/30 dark:border-primary-400/50 ${currentSize.ring}`}
          style={{ boxShadow: '0 8px 40px rgba(0,102,255,0.08)' }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        />
        <motion.svg
          className={`${currentSize.ring} absolute`}
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: 'visible' }}
        >
          <circle cx="60" cy="60" r="48" stroke="rgba(0,102,255,0.18)" strokeWidth="2" />
          <motion.circle
            cx="60"
            cy="60"
            r="48"
            stroke="#0066FF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="75 200"
            style={{ originX: '50%', originY: '50%' }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
          />
        </motion.svg>
      </div>

      {/* Glow Background Circle */}
      <motion.div
        animate={{
          opacity: [0.3, 0.8, 0.3],
          scale: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute ${currentSize.glow} rounded-full bg-gradient-to-r from-primary-500/15 to-primary-400/15 dark:from-primary-400/25 dark:to-primary-500/25 blur-2xl`}
      />

      {/* Shimmer sweep across core */}
      <motion.div
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
        initial={{ x: '-140%' }}
        animate={{ x: '140%' }}
        transition={{ duration: 2.3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.3 }}
        style={{
          background: 'linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.08) 60%, transparent 100%)',
          filter: 'blur(1px)',
        }}
      />

      {/* Main Logo Container */}
      <motion.div
        variants={logoVariants}
        animate="rotate"
        className={`relative ${currentSize.container} flex items-center justify-center animate-float-ud`}
      >
        {/* Logo - XLance Blue Circle with SVG */}
        <div className="relative w-full h-full flex items-center justify-center">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full drop-shadow-2xl dark:drop-shadow-[0_0_24px_rgba(0,102,255,0.6)]"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Blue Gradient Defs */}
            <defs>
              <linearGradient id="xlanceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0066FF" />
                <stop offset="100%" stopColor="#0052CC" />
              </linearGradient>
            </defs>

            {/* Circle Background */}
            <circle cx="100" cy="100" r="100" fill="url(#xlanceGradient)" />

            {/* XL Text */}
            <text
              x="100"
              y="115"
              fontFamily="Arial, sans-serif"
              fontSize="72"
              fontWeight="bold"
              fill="white"
              textAnchor="middle"
              letterSpacing="2"
            >
              XL
            </text>
          </svg>

          {/* Shine Overlay Effect */}
          <motion.div
            animate={{
              opacity: [0, 0.25, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={`absolute ${currentSize.container} rounded-full bg-gradient-to-tr from-white/20 to-white/5 dark:from-primary-300/15 dark:to-primary-300/5`}
          />
        </div>
      </motion.div>

      {/* Particles */}
      {particles.map((p, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 1, 0], y: [0, -6, 0] }}
          transition={{ duration: 3 + idx * 0.4, repeat: Infinity, delay: p.delay }}
          className="absolute"
          style={{ left: `calc(50% + ${p.x}px)`, top: `calc(50% + ${p.y}px)` }}
        >
          <div
            className="rounded-full bg-primary-500"
            style={{ width: p.size, height: p.size, opacity: 0.85 }}
          />
        </motion.div>
      ))}

      {/* Loading Text & Dots (fullscreen only) */}
      {fullscreen && (
        <motion.div
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-16 text-center space-y-2"
        >
          <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold tracking-wider">
            XLance
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-xs font-medium tracking-widest uppercase">
            Loading workspace
          </p>

          {/* Animated Dots */}
          <div className="flex justify-center gap-1.5 pt-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-1.5 h-1.5 bg-primary-500 rounded-full"
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LoadingScreen;
