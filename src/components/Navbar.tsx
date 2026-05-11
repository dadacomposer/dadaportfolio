'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Work', href: '/#work' },
    { name: 'Listen', href: '/listen' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <motion.header 
      className="fixed top-0 left-0 w-full z-50 py-4 px-6 flex justify-between items-center glass m-4 w-[calc(100%-2rem)] max-w-4xl mx-auto right-0 rounded-full border border-white/5"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2, duration: 1 }}
    >
      <Link href="/#hero" className="text-xl font-bold tracking-tighter text-white flex items-baseline">
        DADA<span className="text-accent">.</span>
        <span className="text-xl text-white/40 ml-0.5 tracking-tighter font-medium">COMPOSER</span>
      </Link>

      <nav className="hidden md:flex gap-6">
        {links.map((link) => (
          <Link 
            key={link.name} 
            href={link.href}
            className={`relative text-xs font-medium transition-colors hover:text-white ${pathname === link.href ? 'text-white' : 'text-gray-400'}`}
          >
            {link.name}
            {pathname === link.href && (
              <motion.div 
                layoutId="nav-underline"
                className="absolute left-0 -bottom-2 w-full h-[2px] bg-neon"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </Link>
        ))}
      </nav>
    </motion.header>
  );
}
