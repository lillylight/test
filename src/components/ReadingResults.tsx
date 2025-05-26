'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReadingResultsProps {
  prediction: string;
  onNewReading: () => void;
}

export function ReadingResults({ prediction, onNewReading }: ReadingResultsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // UI logic only: download, copy, share, etc. (leave logic untouched)
  const handleDownload = () => {
    const blob = new Blob([prediction], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'astro-clock-reading.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(prediction)
      .then(() => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  const handleShareToX = () => {
    const text = encodeURIComponent("I just discovered my exact birth time with Astro Clock! Check it out:");
    const url = encodeURIComponent("https://astroclock.app");
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleShareToFacebook = () => {
    const url = encodeURIComponent("https://astroclock.app");
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const toggleShareMenu = () => {
    setShowShareMenu(!showShareMenu);
  };

  // Animation variants (leave as-is for framer-motion)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const shareMenuVariants = {
    hidden: { opacity: 0, scale: 0.9, y: -5 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: -5,
      transition: { duration: 0.15, ease: "easeIn" }
    }
  };

  // Modern, responsive UI wrapper
  return (
    <div className="max-w-xl mx-auto bg-secondary bg-opacity-90 p-6 rounded-3xl shadow-2xl border border-gray-600/30 my-8 mx-4 sm:my-4 sm:mx-2">
      <motion.div
        className="flex flex-col items-center justify-center w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 className="text-2xl font-bold mb-4 sm:text-xl text-center" variants={itemVariants}>
          Your Personalized Birth Time Prediction
        </motion.h2>
        <motion.div
          className="w-full mb-6 bg-gray-900/80 p-6 rounded-2xl border border-gray-700/50 shadow-lg sm:p-4 sm:mb-4"
          variants={itemVariants}
        >
          <div ref={contentRef} className="text-lg text-gray-100 whitespace-pre-line break-words text-center sm:text-base">
            {prediction}
          </div>
        </motion.div>
        <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full mb-4" variants={itemVariants}>
          <button
            onClick={handleDownload}
            className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-full shadow-lg font-medium text-white sm:py-2 sm:text-sm"
          >
            Download
          </button>
          <button
            onClick={handleCopyToClipboard}
            className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-full shadow-lg font-medium text-white sm:py-2 sm:text-sm"
          >
            {copySuccess || 'Copy'}
          </button>
          <div className="relative flex-1">
            <button
              onClick={toggleShareMenu}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-full shadow-lg font-medium text-white sm:py-2 sm:text-sm"
            >
              Share
            </button>
            <AnimatePresence>
              {showShareMenu && (
                <motion.div
                  className="absolute left-1/2 transform -translate-x-1/2 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-lg p-4 z-20 flex flex-col gap-2 min-w-[180px]"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={shareMenuVariants}
                >
                  <button
                    onClick={handleShareToX}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.162 5.656l-7.769 9.418 4.359 5.927h-3.498l-2.826-3.876-3.193 3.876h-3.498l4.359-5.927-7.769-9.418h3.498l6.02 7.292 6.02-7.292z"/></svg>
                    Share to X
                  </button>
                  <button
                    onClick={handleShareToFacebook}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.676 0h-21.352c-.731 0-1.324.593-1.324 1.324v21.352c0 .731.593 1.324 1.324 1.324h11.495v-9.294h-3.124v-3.622h3.124v-2.672c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.92.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12v9.294h6.116c.73 0 1.324-.593 1.324-1.324v-21.352c0-.731-.594-1.324-1.324-1.324z"/></svg>
                    Share to Facebook
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        <motion.button
          onClick={onNewReading}
          className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-full shadow-lg font-medium text-white mt-2 sm:py-2 sm:text-sm"
          variants={itemVariants}
        >
          New Prediction
        </motion.button>
      </motion.div>
    </div>
  );
}
