import './globals.css';
import { Inter, Poppins } from 'next/font/google';
import ClientProviders from '@/components/ClientProviders';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'ShopHub | Premium E-Commerce Shopping',
    template: '%s | ShopHub',
  },
  description: 'Discover premium products at the best prices. Shop with confidence with our secure checkout and fast shipping.',
  keywords: ['ecommerce', 'shopping', 'online store', 'premium products', 'ShopHub'],
  authors: [{ name: 'ShopHub' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://shophub.com',
    siteName: 'ShopHub',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
