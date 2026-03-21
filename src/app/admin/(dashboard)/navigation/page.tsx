import { createClient } from "@/lib/supabase/server";
import NavigationManager from "./NavigationManager";

export default async function NavigationPage() {
  const supabase = await createClient();
  const { data: items, error } = await supabase
    .from("navigation_items")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return (
      <div className="text-red-400">
        Failed to load navigation items: {error.message}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold admin-text">Navigation</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage navbar links, mega menus, and footer links
        </p>
      </div>

      <NavigationManager initialItems={items ?? []} />
    </div>
  );
}
