import { createClient } from "@/lib/supabase/server";
import { Mail } from "lucide-react";
import ContactsFilter from "./ContactsFilter";
import ContactReadToggle from "./ContactReadToggle";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; from?: string; to?: string; sort?: string }>;
}) {
  const { q, from, to, sort } = await searchParams;
  const supabase = await createClient();
  const ascending = sort === "oldest";

  let query = supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending });

  if (q && q.trim()) {
    const searchTerm = `%${q.trim()}%`;
    query = query.or(`name.ilike.${searchTerm},email.ilike.${searchTerm}`);
  }

  if (from) {
    query = query.gte("created_at", `${from}T00:00:00`);
  }
  if (to) {
    query = query.lte("created_at", `${to}T23:59:59`);
  }

  const { data: contacts, error } = await query;

  if (error) {
    return (
      <div className="text-red-400">
        Failed to load contacts: {error.message}
      </div>
    );
  }

  const unreadCount = contacts?.filter((c) => !c.is_read).length ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold admin-text">
            Form Submissions
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {contacts?.length ?? 0} total{unreadCount > 0 && ` · ${unreadCount} unread`}
          </p>
        </div>
      </div>

      <ContactsFilter
        initialQuery={q ?? ""}
        initialFrom={from ?? ""}
        initialTo={to ?? ""}
        initialSort={sort ?? "newest"}
      />

      {!contacts || contacts.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center">
          <Mail size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 text-lg mb-2">
            {q || from || to ? "No contacts match your filters" : "No submissions yet"}
          </p>
          <p className="text-slate-500 text-sm">
            {q || from || to
              ? "Try different search terms or date range."
              : "Contact form submissions will appear here."}
          </p>
        </div>
      ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[1000px]">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-4 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider w-10">
                </th>
                <th className="px-4 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-4 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-4 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-4 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider max-w-[200px]">
                  Message
                </th>
                <th className="px-4 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {contacts.map((contact) => (
                <tr
                  key={contact.id}
                  className={`hover:bg-white/[0.03] transition-colors ${
                    !contact.is_read ? "bg-sky-500/[0.03]" : ""
                  }`}
                >
                  <td className="px-4 py-4">
                    <ContactReadToggle
                      id={contact.id}
                      isRead={contact.is_read ?? false}
                    />
                  </td>
                  <td className="px-4 py-4 admin-text font-medium whitespace-nowrap">
                    {!contact.is_read && (
                      <span className="inline-block w-2 h-2 rounded-full bg-sky-400 mr-2" />
                    )}
                    {contact.name ?? "—"}
                  </td>
                  <td className="px-4 py-4 text-slate-300 whitespace-nowrap">
                    {contact.email ? (
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-sky-400 hover:text-sky-300 transition-colors"
                      >
                        {contact.email}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-4 text-slate-400 whitespace-nowrap">
                    {contact.company ?? "—"}
                  </td>
                  <td className="px-4 py-4 text-slate-400 whitespace-nowrap">
                    {contact.phone ?? "—"}
                  </td>
                  <td className="px-4 py-4 text-slate-400 whitespace-nowrap">
                    {contact.service ? (
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-sky-500/20 text-sky-300">
                        {contact.service}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-4 text-slate-400 max-w-[200px]">
                    <span className="block truncate" title={contact.message ?? ""}>
                      {contact.message
                        ? contact.message.length > 80
                          ? `${contact.message.slice(0, 80)}...`
                          : contact.message
                        : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-400 text-xs whitespace-nowrap">
                    {contact.created_at
                      ? new Date(contact.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
