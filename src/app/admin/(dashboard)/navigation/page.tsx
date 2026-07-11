import { createClient } from "@/lib/supabase/server";
import { LayoutGrid01 } from "@untitledui/icons";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
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
      <div className="mb-8 flex items-center gap-3">
        <FeaturedIcon icon={LayoutGrid01} color="brand" theme="modern" size="lg" />
        <div>
          <h1 className="text-xl font-semibold text-primary">Navigation</h1>
          <p className="mt-1 text-sm text-tertiary">
            Manage navbar links, dropdown mega menus, and footer links. Changes apply to the public site after save.
          </p>
        </div>
      </div>

      <NavigationManager initialItems={items ?? []} />
    </div>
  );
}
