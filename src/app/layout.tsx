import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Geist } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { ThemeProvider } from "@/lib/themeProvider";
import { RouteProvider } from "@/components/providers/RouteProvider";
import { getSeoConfig } from "@/lib/seo/config";

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

export async function generateMetadata(): Promise<Metadata> {
 const { siteUrl, siteName, defaultTitle, defaultDescription, titleTemplate } = await getSeoConfig();
 return {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: titleTemplate,
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" className="dark-mode" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var apply=function(t){document.documentElement.setAttribute("data-theme",t);document.documentElement.classList.toggle("dark-mode",t==="dark")};if(location.pathname.startsWith("/access/")){apply("dark");return}var t=localStorage.getItem("ice-theme");if(t==="light"||t==="dark"){apply(t)}else{apply("dark")}}catch(e){apply("dark")}})()`,
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
