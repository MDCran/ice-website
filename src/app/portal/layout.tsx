import PortalSidebar from "@/components/portal/PortalSidebar";
import PortalHeader from "@/components/portal/PortalHeader";
import { PortalCopyProvider } from "@/components/portal/PortalCopyProvider";
import { getSiteSettings } from "@/lib/cms";

export const metadata = {
  title: "Client Portal | ICE",
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalLayoutContent>{children}</PortalLayoutContent>;
}

async function PortalLayoutContent({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <PortalCopyProvider value={settings.portal_copy}>
      <div className="flex h-dvh overflow-hidden bg-primary">
        <PortalSidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <PortalHeader />
          <main className="flex-1 overflow-y-auto bg-secondary px-4 py-6 md:px-8 md:py-8">
            {children}
          </main>
        </div>
      </div>
    </PortalCopyProvider>
  );
}
