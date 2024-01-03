// layout.jsx
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import Header from './components/Header';
import './globals.css';
import '../middleware'

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
      <ClerkProvider>
        <html lang='en'>
          <body className={inter.className}>
            <Header />
            <main className='container mx-auto'>
              <div className='flex items-start justify-center min-h-screen'>
                <div className='mt-20'>{children}</div>
              </div>
            </main>
          </body>
        </html>
      </ClerkProvider>
  );
}
