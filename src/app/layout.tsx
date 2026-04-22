import type { Metadata } from 'next';
import { IBM_Plex_Sans_Thai } from 'next/font/google';
import './globals.css';

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  weight: ['400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  variable: '--font-ibm-plex-sans-thai',
});

export const metadata: Metadata = {
  title: 'ไปรษณีย์ไทย — PMO Dashboard',
  description: 'Project Management Office — Thailand Post',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={ibmPlexSansThai.variable}>
      <body className={`min-h-full flex flex-col ${ibmPlexSansThai.className}`}>{children}</body>
    </html>
  );
}
