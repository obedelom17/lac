import './globals.css';
import { Hanken_Grotesk } from 'next/font/google';
import Providers from '@/components/Providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Extras from '@/components/Extras';
import Cart from '@/components/Cart';

const body = Hanken_Grotesk({ subsets: ['latin'], variable: '--f-body', display: 'swap' });

const site = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL : 'http://localhost:3000');
const title = 'Lumière à la Cité — Lomé';
const description = 'Église à Lomé : cultes, direct, événements, boutique, prière et témoignages.';
const og = { url: '/og.jpg', width: 1200, height: 630, alt: 'Lumière à la Cité' };

export const metadata = {
  metadataBase: new URL(site),
  title,
  description,
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon-192.png', apple: '/icon-192.png' },
  openGraph: { title, description, siteName: 'Lumière à la Cité', type: 'website', locale: 'fr_FR', url: '/', images: [og] },
  twitter: { card: 'summary_large_image', title, description, images: ['/og.jpg'] },
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
