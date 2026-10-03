import { ImageResponse } from "next/og";

export const runtime = "edge";

function encodeBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const title = (url.searchParams.get("title") || "Enterprise IT, built around your business")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90);
  const description = (url.searchParams.get("description") || "AS400 and IBM i hosting, cloud hosting, and disaster recovery from International Computer Exchange.")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 175);

  let logo: string | undefined;
  try {
    const response = await fetch(new URL("/images/logo/ice-logo.jpg", url.origin));
    if (response.ok) {
      logo = `data:image/jpeg;base64,${encodeBase64(new Uint8Array(await response.arrayBuffer()))}`;
    }
  } catch {
    // Keep sharing cards available if the logo asset is temporarily unreachable.
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "58px 70px",
          color: "#ffffff",
          background: "linear-gradient(135deg, #07172b 0%, #092b49 58%, #061323 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {logo ? (
            <div style={{ display: "flex", width: 226, height: 64, padding: 5, borderRadius: 8, background: "#ffffff" }}>
              <img src={logo} width="216" height="54" />
            </div>
          ) : (
            <div style={{ display: "flex", color: "#35afff", fontSize: 29, fontWeight: 800 }}>ICE</div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", fontSize: 20, fontWeight: 700, letterSpacing: "0.02em" }}>
              International Computer Exchange
            </div>
            <div style={{ display: "flex", color: "#91a7bf", fontSize: 16 }}>
              IBM Business Partner since 1990
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 1030 }}>
          <div style={{ display: "flex", fontSize: 58, lineHeight: 1.08, fontWeight: 750, letterSpacing: "-0.035em" }}>
            {title}
          </div>
          <div style={{ display: "flex", marginTop: 20, maxWidth: 940, color: "#c0cedd", fontSize: 24, lineHeight: 1.35 }}>
            {description}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(163,191,220,0.24)", paddingTop: 20, color: "#8ccfff", fontSize: 17, fontWeight: 600 }}>
          <div style={{ display: "flex" }}>AS400 &amp; IBM i hosting · Cloud hosting · Disaster recovery</div>
          <div style={{ display: "flex" }}>icesales.com</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
