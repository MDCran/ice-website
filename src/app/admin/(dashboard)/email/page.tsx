import MarketingCenter from "../marketing/MarketingCenter";

export const metadata = { title: "Email Management | ICE Admin" };

export default function EmailManagementPage() {
  return <MarketingCenter initialTab="settings" />;
}
