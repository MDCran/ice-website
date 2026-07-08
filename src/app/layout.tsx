import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/themeProvider";
import { RouteProvider } from "@/components/providers/RouteProvider";

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://icesales.com";
const siteName = "International Computer Exchange";
const defaultTitle =
  "International Computer Exchange — Enterprise Cloud, Security & IBM Managed Services";
const defaultDescription =
  "IBM Business Partner since 1990. ICE delivers managed cloud hosting, disaster recovery, backup, IBM i security, and enterprise managed services from SOC 2 Type II certified data centers.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | International Computer Exchange",
  },
  description: defaultDescription,
  applicationName: siteName,
  keywords: [
    "IBM Business Partner",
    "IBM Power Systems",
    "IBM i hosting",
    "managed cloud hosting",
    "private cloud",
    "hybrid cloud",
    "disaster recovery as a service",
    "backup as a service",
    "ransomware recovery",
    "high availability",
    "IBM i security",
    "managed security services",
    "enterprise IT services",
    "International Computer Exchange",
    "ICE",
  ],
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  category: "technology",
  openGraph: {
    type: "website",
    siteName,
    locale: "en_US",
    url: siteUrl,
    title: defaultTitle,
    description: defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  ...((process.env.GOOGLE_SITE_VERIFICATION || process.env.BING_SITE_VERIFICATION)
    ? {
        verification: {
          ...(process.env.GOOGLE_SITE_VERIFICATION
            ? { google: process.env.GOOGLE_SITE_VERIFICATION }
            : {}),
          ...(process.env.BING_SITE_VERIFICATION
            ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }
            : {}),
        },
      }
    : {}),
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
            __html: `(function(){try{var apply=function(t){document.documentElement.setAttribute("data-theme",t);document.documentElement.classList.toggle("dark-mode",t==="dark")};if(location.pathname.startsWith("/access/")){apply("dark");return}var t=localStorage.getItem("ice-theme");if(t==="light"||t==="dark"){apply(t)}else{var d=window.matchMedia&&window.matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light";apply(d)}}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className={`${geist.variable} ${inter.variable} font-sans antialiased overflow-x-hidden`}
      >
        <RouteProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </RouteProvider>
      </body>
    </html>
  );
}
