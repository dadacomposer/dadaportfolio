'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = pathname.startsWith('/admin');

  const desktopLinks = [
    { name: 'Home', href: '/' },
    { name: 'Work', href: '/#work' },
    { name: 'Listen', href: '/listen' },
    { name: 'Pricing', href: '/pricing' },
  ];

  const mobileLinks = [
    { name: 'Home', href: '/' },
    { name: 'Work', href: '/#work' },
    { name: 'Listen', href: '/listen' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Contact', href: '/contact' },
  ];

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.header 
        className={`fixed top-0 left-0 z-[100] py-3.5 px-6 glass m-4 w-[calc(100%-2rem)] max-w-4xl mx-auto right-0 rounded-full border border-white/5 ${
          isAdmin ? 'flex justify-between items-center' : 'grid grid-cols-2 md:grid-cols-3 items-center'
        }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Link href="https://www.dadacomposer.com/" className="text-xl font-bold tracking-tighter text-white flex items-baseline justify-self-start">
          DADA<span className="text-accent">.</span>
          <span className="text-xl text-white/40 ml-0.5 tracking-tighter font-medium">COMPOSER</span>
        </Link>

        {/* Desktop Nav */}
        {!isAdmin && (
          <nav className="hidden md:flex gap-6 justify-self-center">
            {desktopLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className={`relative text-xs font-medium transition-colors hover:text-white ${pathname === link.href ? 'text-white' : 'text-gray-400'}`}
              >
                {link.name}
                {pathname === link.href && (
                  <motion.div 
                    layoutId="nav-underline"
                    className="absolute left-0 -bottom-2 w-full h-[2px] bg-accent"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>
        )}

        {/* Right Action / Toggle */}
        {!isAdmin ? (
          <div className="justify-self-end flex items-center gap-4">
            <Link 
              href="/contact" 
              className="hidden md:flex text-[11px] font-light tracking-widest uppercase px-4 py-2 rounded-full border border-white/10 hover:border-accent hover:bg-accent/10 text-white transition-all duration-300 cursor-pointer"
            >
              Let's Talk
            </Link>

            <button 
              className="md:hidden text-white p-1 cursor-pointer"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        ) : (
          <Link 
            href="/" 
            className="text-xs font-light tracking-widest uppercase px-4 py-2 rounded-full border border-white/10 hover:border-accent hover:bg-accent/10 text-white transition-all duration-300 cursor-pointer"
          >
            Exit Dashboard
          </Link>
        )}
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {!isAdmin && isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 left-4 right-4 z-[99] md:hidden glass rounded-3xl border border-white/10 p-8 flex flex-col gap-6 shadow-2xl"
          >
            {mobileLinks.map((link, i) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link 
                  href={link.href}
                  className={`text-2xl font-light tracking-tight ${pathname === link.href ? 'text-white' : 'text-gray-500'}`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
