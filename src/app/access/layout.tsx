/**
 * Legacy password-gated proposal pages (e.g. /access/carico-iaas-2026).
 * Client account documents belong in the portal: admin uploads via
 * /admin/clients/[id]/resources → clients view them at /portal/resources when logged in.
 */
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
