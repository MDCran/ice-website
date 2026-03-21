import PortalSidebar from "@/components/portal/PortalSidebar";
import PortalHeader from "@/components/portal/PortalHeader";

export const metadata = {
  title: "Client Portal | ICE",
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen admin-shell overflow-hidden">
      <PortalSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <PortalHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
