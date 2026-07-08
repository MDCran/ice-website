import Script from "next/script";

/**
 * Analytics loader for Google Tag Manager or GA4 (gtag.js).
 *
 * Preference order:
 *   1. `gtmId` present  → load the GTM container (+ `<noscript>` fallback iframe).
 *   2. else `ga4Id`     → load gtag.js directly and configure GA4.
 *   3. else             → render nothing (analytics disabled).
 *
 * IDs come from the resolved SEO config (env vars / CMS site-settings). When both
 * are unset — the default in dev — no third-party script is emitted at all.
 */
export default function Analytics({
  gtmId,
  ga4Id,
}: {
  gtmId?: string | null;
  ga4Id?: string | null;
}) {
  if (gtmId) {
    return (
      <>
        <Script id="gtm-loader" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
      </>
    );
  }

  if (ga4Id) {
    return (
      <>
        <Script
          id="ga4-loader"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
        />
        <Script id="ga4-config" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${ga4Id}');`}
        </Script>
      </>
    );
  }

  return null;
}
