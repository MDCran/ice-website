import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "International Computer Exchange — Enterprise Cloud, Security & IBM Managed Services Since 1990";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
          height: "100%",
          padding: "96px",
          backgroundColor: "#040B19",
          backgroundImage:
            "radial-gradient(circle at 18% 22%, rgba(4,155,251,0.35), rgba(4,155,251,0) 42%), radial-gradient(circle at 88% 82%, rgba(4,155,251,0.22), rgba(4,155,251,0) 46%)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#049BFB",
          }}
        >
          IBM Business Partner Since 1990
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 84,
            lineHeight: 1.04,
            fontWeight: 800,
            color: "#FFFFFF",
            maxWidth: 940,
          }}
        >
          International Computer Exchange
        </div>

        <div
          aria-hidden="true"
          style={{
            display: "flex",
            marginTop: 40,
            marginBottom: 32,
            width: 220,
            height: 4,
            borderRadius: 9999,
            backgroundImage:
              "linear-gradient(90deg, #049BFB 0%, rgba(4,155,251,0) 100%)",
          }}
        />

        <div
          style={{
            display: "flex",
            fontSize: 34,
            fontWeight: 500,
            color: "#B8C4D6",
            maxWidth: 900,
          }}
        >
          Enterprise Cloud, Security & IBM Managed Services — Since 1990
        </div>
      </div>
    ),
    { ...size },
  );
}
