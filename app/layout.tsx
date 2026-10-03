import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { Header } from '@/components/layout/header';
import { CategoryMegaMenu } from '@/components/layout/category-mega-menu';
import { Footer } from '@/components/layout/footer';
import { AuthModal } from '@/components/layout/auth-modal';
import { PincodeModal } from '@/components/layout/pincode-modal';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'NovaMarket — Online Shopping for Mobiles, Electronics, Fashion & More',
  description:
    'Shop the best deals online at NovaMarket India. Genuine products, 100% buyer protection, fast delivery, and no-cost EMI on smartphones, laptops, electronics, and fashion.',
  keywords: [
    'online shopping',
    'ecommerce',
    'smartphones',
    'electronics',
    'fashion',
    'best deals',
    'nova market',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
        <QueryProvider>
          <Header />
          <CategoryMegaMenu />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
          <AuthModal />
          <PincodeModal />
          <Toaster position="top-right" richColors closeButton />
        </QueryProvider>
      </body>
    </html>
  );
}
