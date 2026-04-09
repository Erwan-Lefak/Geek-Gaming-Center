/**
 * Header Component
 * Main navigation header with logo, nav links, and cart
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ShoppingCart, User, Search, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Debug: log when menu state changes
  console.log('mobileMenuOpen:', mobileMenuOpen);

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/store', label: 'Boutique' },
    { href: '/arena', label: 'Salle de Jeux' },
    { href: '/arena/booking', label: 'Réservations' },
    { href: '/about', label: 'À Propos' },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 glass ${mobileMenuOpen ? 'z-[10002]' : 'z-50'}`}>
        {/* Mobile Announcement Bar */}
        <Link href="/arena/booking" className="lg:hidden block bg-gradient-to-r from-blue-600 to-violet-600 text-white py-0.5 px-4 text-center border-b-2 border-white/30 hover:opacity-90 transition-opacity cursor-pointer">
          <p className="text-2xl font-bold uppercase tracking-wide my-0">
            Réservez maintenant
          </p>
        </Link>

        {/* Header Content */}
        <div className="border-b border-border h-[96px]">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 h-full flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-16 h-16 rounded-lg group-hover:shadow-glow transition-all duration-300 overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Geek Gaming Center Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="nav-link text-lg md:text-xl lg:text-2xl font-bold uppercase text-white hover:text-white transition-colors duration-200 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-surface transition-colors duration-200"
                aria-label={theme === 'dark' ? 'Passer en mode jour' : 'Passer en mode nuit'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-white" />
                ) : (
                  <Moon className="w-5 h-5 text-white" />
                )}
              </button>

              {/* Search */}
              <button className="p-2 rounded-lg hover:bg-surface transition-colors duration-200">
                <Search className="w-5 h-5 text-white" />
              </button>

              {/* Cart */}
              <Link href="/cart" className="p-2 rounded-lg hover:bg-surface transition-colors duration-200 relative">
                <ShoppingCart className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  0
                </span>
              </Link>

              {/* User */}
              <Link href="/account" className="hidden sm:flex p-2 rounded-lg hover:bg-surface transition-colors duration-200">
                <User className="w-5 h-5 text-white" />
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-surface transition-colors duration-200 relative z-[10001]"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
                style={{ zIndex: 10001 }}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Dark Overlay when menu is open */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black z-[9999]"
          onClick={() => setMobileMenuOpen(false)}
          style={{ zIndex: 9999, backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
        />
      )}

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden fixed top-[135px] left-0 right-0 bg-transparent" style={{ zIndex: 10000 }}>
          <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xl font-bold uppercase text-white hover:text-primary-400 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-border" />
            <Link
              href="/account"
              className="text-xl font-bold uppercase text-white hover:text-primary-400 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Mon Compte
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}
