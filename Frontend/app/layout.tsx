import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import Header from '@/components/Header';
import FloatingWhatsAppButton from '@/components/FloatingWhatsAppButton';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Personal Safety Guardian',
  description: 'Analyze images, videos, audio, and text for safety threats',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        {children}
        <FloatingWhatsAppButton />
      </body>
    </html>
  );
}

