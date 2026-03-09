import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CursorGlow from "@/components/effects/CursorGlow";
import NoiseOverlay from "@/components/effects/NoiseOverlay";
import PageTransition from "@/components/effects/PageTransition";
import SearchModal from "@/components/ui/SearchModal";
import ContactWidget from "@/components/ui/ContactWidget";
import { ThemeProvider } from "@/lib/themeProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

const geist = Geist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "International Computer Exchange",
  description:
    "IBM Business Partner since 1990 — delivering enterprise technology solutions including cloud hosting, data protection, security, and managed services.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("ice-theme");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t)}else{var d=window.matchMedia&&window.matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light";document.documentElement.setAttribute("data-theme",d)}}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className={`${geist.variable} ${inter.variable} font-sans antialiased scan-line overflow-x-hidden`}
      >
        <ThemeProvider>
          <CursorGlow />
          <NoiseOverlay />
          <SearchModal />
          <Navbar />
          <PageTransition>{children}</PageTransition>
          <Footer />
          <ContactWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
