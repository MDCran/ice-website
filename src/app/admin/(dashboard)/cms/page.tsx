import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FileText, Plus, Globe, Layers, Scale, type LucideIcon } from "lucide-react";
import CMSPageActions from "./CMSPageActions";

const typeConfig: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  static: { label: "Generic", color: "bg-sky-500/20 text-sky-300", icon: Globe },
  solution: { label: "Solution", color: "bg-emerald-500/20 text-emerald-300", icon: Layers },
  legal: { label: "Legal", color: "bg-amber-500/20 text-amber-300", icon: Scale },
};

export default async function CMSPagesPage() {
  const supabase = await createClient();
  const { data: pages, error } = await supabase
    .from("pages")
    .select("*")
    .neq("slug", "site-settings")
    .order("sort_order", { ascending: true });

  if (error) {
    return (
      <div className="text-red-400">
        Failed to load pages: {error.message}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold admin-text">CMS Pages</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage website pages and their content sections
          </p>
        </div>
        <CMSPageActions mode="create" />
      </div>

      {!pages || pages.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center">
          <FileText size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 text-lg mb-2">No pages yet</p>
          <p className="text-slate-500 text-sm">
            Create your first page to get started.
          </p>
        </div>
      ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Published
                </th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pages.map((page) => {
                const config = typeConfig[page.page_type] ?? typeConfig.static;
                const TypeIcon = config.icon;
                return (
                  <tr
                    key={page.id}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/cms/${page.slug}`}
                        className="admin-text font-medium group-hover:text-sky-400 transition-colors"
                      >
                        {page.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                      /{page.slug}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
                      >
                        <TypeIcon size={12} />
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {page.is_published ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {page.updated_at
                        ? new Date(page.updated_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <CMSPageActions
                        mode="row"
                        page={{
                          id: page.id,
                          title: page.title,
                          slug: page.slug,
                          page_type: page.page_type,
                          meta_title: page.meta_title,
                          meta_description: page.meta_description,
                          is_published: page.is_published,
                          sort_order: page.sort_order,
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
