import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Simple Contact Book | Code Cleanup 🧹',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen bg-gray-900 p-8 pb-20 sm:p-20">{children}</div>
      </body>
    </html>
  );
}
