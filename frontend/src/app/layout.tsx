import type { Metadata } from 'next';
import { Manrope, Space_Grotesk } from 'next/font/google';
import { Sidebar } from '@/components/sidebar';
import './globals.css';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'CVET | Gestão Veterinária',
  description: 'Plataforma web para gestão de internação e monitoramento clínico veterinário.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${spaceGrotesk.variable} ${manrope.variable} font-sans`}>
        <div className="flex h-screen overflow-hidden bg-slate-50">
          <Sidebar />
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
