'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/admin/dashboard');
    } else {
      setError(true);
      setPassword('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-deepblack flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex justify-center mb-12">
          <span className="text-xl font-bold tracking-tighter text-white">
            DADA<span className="text-white/50">.ADMIN</span>
          </span>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 relative">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter passcode"
              className={`w-full bg-transparent border-b ${error ? 'border-red-500/50 text-red-500' : 'border-white/20 text-white'} py-4 focus:outline-none focus:border-white transition-colors text-center text-lg tracking-widest`}
              autoFocus
            />
          </div>
          
          <button 
            type="submit"
            className="w-full text-white/50 hover:text-white uppercase tracking-widest text-xs py-4 transition-colors"
          >
            Access Vault
          </button>
        </form>
      </motion.div>
    </div>
  );
}
