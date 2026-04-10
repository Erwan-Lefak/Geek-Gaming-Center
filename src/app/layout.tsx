/**
 * Root Layout - Geek Gaming Center
 * Main layout with header, footer, and global styles
 */

import type { Metadata } from 'next';
import Image from 'next/image';
import './globals.css';
import Header from '@/components/ui/Header';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CartProvider } from '@/contexts/CartContext';
import { Providers } from '@/components/providers';
import { DashboardMode } from '@/components/DashboardMode';
import ChatWidget from '@/components/chat/ChatWidget';
import { Instagram } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Geek Gaming Center - Boutique Composants & Salle de Jeux',
  description:
    'Votre destination gaming ultime : boutique de composants électroniques premium et salle de jeux immersive avec PS5, Xbox, VR et simulation automobile.',
  keywords: [
    'gaming',
    'composants PC',
    'PS5',
    'Xbox',
    'VR',
    'simulation auto',
    'location gaming',
    'carte graphique',
    'processeur',
    'Geek Gaming Center',
  ],
  authors: [{ name: 'Geek Gaming Center' }],
  creator: 'Geek Gaming Center',
  publisher: 'Geek Gaming Center',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GGC CRM',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://geekgamingcenter.com',
    siteName: 'Geek Gaming Center',
    title: 'Geek Gaming Center - Boutique Composants & Salle de Jeux',
    description:
      'Votre destination gaming ultime : boutique de composants électroniques premium et salle de jeux immersive avec PS5, Xbox, VR et simulation automobile.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Geek Gaming Center',
    description:
      'Votre destination gaming ultime : boutique de composants électroniques premium et salle de jeux immersive.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add verification codes when available
    // google: '...',
    // yandex: '...',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="antialiased bg-background text-foreground min-h-screen flex flex-col">
        <Providers>
          <DashboardMode />
          <CartProvider>
            <ThemeProvider>
              <Header />
            <main className="flex-1 dashboard-hidden pt-0">{children}</main>
            <footer className="border-t border-border bg-surface dashboard-hidden">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                    <Image
                      src="/logo.png"
                      alt="Geek Gaming Center Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold gradient-text">GEEK</span>
                    <span className="text-xs text-sm opacity-80">Gaming Center</span>
                  </div>
                </div>
                <p className="text-sm text-white">
                  Votre destination gaming ultime. Boutique de composants électroniques premium et salle de jeux immersive.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="font-semibold mb-4 text-white">Navigation</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="/store" className="text-white hover:text-primary-400 transition-colors">
                      Boutique
                    </a>
                  </li>
                  <li>
                    <a href="/arena" className="text-white hover:text-primary-400 transition-colors">
                      Salle de Jeux
                    </a>
                  </li>
                  <li>
                    <a href="/restaurant" className="text-white hover:text-primary-400 transition-colors">
                      Restaurant
                    </a>
                  </li>
                  <li>
                    <a href="/cinema" className="text-white hover:text-primary-400 transition-colors">
                      Cinéma
                    </a>
                  </li>
                  <li>
                    <a href="/arena/booking" className="text-white hover:text-primary-400 transition-colors">
                      Réservations
                    </a>
                  </li>
                  <li>
                    <a href="/about" className="text-white hover:text-primary-400 transition-colors">
                      À Propos
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 className="font-semibold mb-4 text-white">Contact</h3>
                <ul className="space-y-2 text-sm text-white">
                  <li>
                    <a href="mailto:support@geekgamingcenter.com" className="hover:text-primary-400 transition-colors">
                      support@geekgamingcenter.com
                    </a>
                  </li>
                  <li>
                    <a href="tel:+237679702298" className="hover:text-primary-400 transition-colors">
                      +237 6 79 70 22 98
                    </a>
                  </li>
                </ul>
                <div className="mt-6 flex gap-4">
                  <a
                    href="#"
                    className="text-white hover:text-primary-400 transition-colors"
                    aria-label="Facebook"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.instagram.com/ggc_cameroun/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-primary-400 transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="text-white hover:text-primary-400 transition-colors"
                    aria-label="TikTok"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-border text-center text-sm text-white">
              <p>&copy; {new Date().getFullYear()} Geek Gaming Center. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
            <ChatWidget />
          </ThemeProvider>
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
