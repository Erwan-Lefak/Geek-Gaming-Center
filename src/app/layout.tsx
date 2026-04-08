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
              <Header className="dashboard-hidden" />
            <main className="flex-1 dashboard-hidden pt-7 md:pt-28">{children}</main>
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
                    <a href="mailto:contact@geekgamingcenter.com" className="hover:text-primary-400 transition-colors">
                      contact@geekgamingcenter.com
                    </a>
                  </li>
                  <li>
                    <a href="tel:+33123456789" className="hover:text-primary-400 transition-colors">
                      +33 1 23 45 67 89
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
                    href="#"
                    className="text-white hover:text-primary-400 transition-colors"
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.465c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.566.683.748 1.15.137.353.3.882.344 1.857.047 1.023.058 1.351.058 3.807v.468c0 2.456-.011 2.784-.058 3.807-.045.975-.207 1.504-.344 1.857-.182.466-.399.8-.748 1.15-.35.35-.566.683-1.15.748-.353.137-.882.3-1.857.344-1.054.048-1.37.058-4.041.058H12.457c-2.671 0-2.987-.012-4.041-.058-.975-.045-1.504-.207-1.857-.344-.466-.182-.8-.398-1.15-.748-.35-.35-.566-.683-.748-1.15-.137-.353-.3-.882-.344-1.857-.047-1.023-.058-1.351-.058-3.807v-.468c0-2.456.011-2.784.058-3.807.045-.975.207-1.504.344-1.857.182-.466.399-.8.748-1.15.35-.35.566-.683 1.15-.748.353-.137.882-.3 1.857-.344 1.054-.048 1.37-.058 4.041-.058h.468c2.671 0 2.987.011 4.041.058.975.045 1.504.207 1.857.344.466.182.8.398 1.15.748.35.35.566.683.748 1.15.137.353.3.882.344 1.857.047 1.023.058 1.351.058 3.807v.468c0 2.456-.011 2.784-.058 3.807-.045.975-.207 1.504-.344 1.857-.182.466-.399.8-.748 1.15-.35.35-.566.683-1.15.748-.353.137-.882.3-1.857.344-1.054.048-1.37.058-4.041.058h-.468c-2.671 0-2.987-.011-4.041-.058-.975-.045-1.504-.207-1.857-.344-.466-.182-.8-.398-1.15-.748-.35-.35-.566-.683-.748-1.15-.137-.353-.3-.882-.344-1.857-.047-1.023-.058-1.351-.058-3.807v-.468zm0 3.807c-2.328 0-4.216 1.888-4.216 4.216s1.888 4.216 4.216 4.216 4.216-1.888 4.216-4.216-1.888-4.216-4.216-4.216zM12 16.416c-2.328 0-4.216-1.888-4.216-4.216S9.672 7.984 12 7.984s4.216 1.888 4.216 4.216-1.888 4.216-4.216 4.216z" />
                    </svg>
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
