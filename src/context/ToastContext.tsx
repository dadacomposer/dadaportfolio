'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.15 } }}
              layout
              className="pointer-events-auto w-full bg-anthracite/90 backdrop-blur-lg border border-white/10 p-4 rounded-2xl flex items-start gap-3 shadow-2xl relative overflow-hidden group"
            >
              {/* Highlight bar */}
              <div
                className={`absolute top-0 left-0 w-1 h-full ${
                  toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-accent'
                }`}
              />
              
              <div className="shrink-0 mt-0.5">
                {toast.type === 'success' && <CheckCircle size={18} className="text-green-500" />}
                {toast.type === 'error' && <AlertCircle size={18} className="text-red-500" />}
                {toast.type === 'info' && <Info size={18} className="text-accent" />}
              </div>
              
              <div className="flex-grow text-sm text-white/90 font-medium font-sans pr-4 leading-tight">
                {toast.message}
              </div>
              
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-white/30 hover:text-white/80 transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
