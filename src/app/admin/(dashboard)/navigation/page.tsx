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
      <div className="text-sm text-error-primary">
        Failed to load navigation items: {error.message}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-display-xs font-semibold text-primary">Navigation</h1>
        <p className="mt-1 text-sm text-tertiary">
          Manage navbar links, mega menus, and footer links
        </p>
      </div>

      <NavigationManager initialItems={items ?? []} />
    </div>
  );
}
