import './globals.css';
import { Cormorant_Garamond, Noto_Sans, Noto_Sans_SC } from 'next/font/google';
import { Providers } from './providers';
import ClientLayout from './ClientLayout';
import { CartProvider } from './contexts/CartContext';
import { LanguageProvider } from './contexts/LanguageContext';

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const notoSans = Noto_Sans({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'devanagari'],
  variable: '--font-sans',
  display: 'swap',
});

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  variable: '--font-sans-sc',
  display: 'swap',
});



export const metadata = {
  title: 'Nakshatra Gyaan - Your Spiritual Journey Begins Here',
  description: 'Discover your path with comprehensive Vedic astrology and spiritual guidance.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorantGaramond.variable} ${notoSans.variable} ${notoSansSC.variable}`}>
      <body className="bg-white">
        <CartProvider>
          <LanguageProvider>
            <Providers>
              <ClientLayout>{children}</ClientLayout>
            </Providers>
          </LanguageProvider>
        </CartProvider>
      </body>
    </html>
  );
}
