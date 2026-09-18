import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#090807",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Together • Alvaro & Jeniffer",
  description: "Mesmo longe, nós temos um lugar.",
  applicationName: "Together",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Together",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Together • Alvaro & Jeniffer",
    description: "Mesmo longe, nós temos um lugar.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark h-full">
      <head>
        <link rel="apple-touch-icon" href="/icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
      </head>
      <body className="min-h-full flex flex-col bg-[#090807] text-[#ede7df] antialiased select-none">
        {children}
        {/* Service worker registration for PWA installability */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').catch(function(err) {
                  console.warn('Service worker registration failed:', err);
                });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
