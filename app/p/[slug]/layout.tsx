import { Inter, Noto_Sans_JP } from 'next/font/google';
import '../../globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-inter',
});

const notoSansJP = Noto_Sans_JP({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-sans-jp',
});

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div 
      className={`${inter.variable} ${notoSansJP.variable} text-gray-800 antialiased profile-page-wrapper`}
    >
      {children}
    </div>
  );
}

