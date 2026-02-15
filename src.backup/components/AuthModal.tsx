"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [isLoginView, setIsLoginView] = useState(initialMode === 'login');

  // Update view when initialMode changes
  useEffect(() => {
    setIsLoginView(initialMode === 'login');
  }, [initialMode]);

  if (!isOpen) return null;

  const handleSwitchView = () => {
    setIsLoginView(!isLoginView);
  };

  const handleClose = () => {
    onClose();
    // Reset to initial mode when closing
    setIsLoginView(initialMode === 'login');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-gray-900/70 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 relative">
              <button 
                onClick={handleClose} 
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors rounded-full p-1 hover:bg-white/10"
              >
                <X size={24} />
              </button>
              
              <AnimatePresence mode="wait">
                {isLoginView ? (
                  <LoginForm key="login" onSwitchView={handleSwitchView} onClose={handleClose} />
                ) : (
                  <RegisterForm key="register" onSwitchView={handleSwitchView} onClose={handleClose} />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal; 