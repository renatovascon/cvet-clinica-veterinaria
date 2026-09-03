import type { Metadata } from 'next';
import { Manrope, Space_Grotesk } from 'next/font/google';
import { BackendWakeUp } from '@/components/backend-wakeup';
import { AppShell } from '@/components/app-shell';
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
        <BackendWakeUp>
          <AppShell>{children}</AppShell>
        </BackendWakeUp>
      </body>
    </html>
  );
}
