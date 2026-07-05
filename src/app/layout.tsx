import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/context";
import AppShell from "@/components/AppShell";
import Footer from "@/components/Footer";
import Script from "next/script";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Rec'd Club — Stamped by Taste",
  description: "Good taste travels person to person. From your crew. For your watchlist. Pass it on.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased bg-ink text-bone`}
    >
      <body className="min-h-full flex flex-col" style={{ fontFamily: "var(--font-sans)" }}>
        <Script id="clarity-script" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "x47n18qbsw");
          `}
        </Script>
        <AppProvider>
          <AppShell>{children}</AppShell>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
