import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CalendarToggle from '../components/CalendarToggle';
import { Providers } from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LifeOS',
  description: 'Your digital second brain',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <div className="pt-16"><Navbar />
          <div className="flex">
            <Sidebar />
            <CalendarToggle />
            <main className="w-full"> 
      {children}
    </main>
  </div>
</div>

        </Providers>
      </body>
    </html>
  );
}
