export default function AccessLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var h=document.documentElement;h.setAttribute("data-theme","dark");h.style.colorScheme="dark";h.classList.add("access-dark-lock")})()`,
        }}
      />
      {children}
    </>
  );
}
