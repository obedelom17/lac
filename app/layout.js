import './globals.css';
import { Hanken_Grotesk } from 'next/font/google';
import Providers from '@/components/Providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Extras from '@/components/Extras';
import Cart from '@/components/Cart';

const body = Hanken_Grotesk({ subsets: ['latin'], variable: '--f-body', display: 'swap' });

export const metadata = {
  title: 'Lumière à la Cité — Lomé',
  description: 'Église à Lomé : cultes, direct, événements, boutique, prière et témoignages.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon-192.png', apple: '/icon-192.png' },
};
export const viewport = { themeColor: '#7b1a9a', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${body.variable}`}>
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
          <Cart />
          <Extras />
        </Providers>
      </body>
    </html>
  );
}
