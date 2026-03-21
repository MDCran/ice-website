import { createClient } from "@/lib/supabase/server";
import { UserPlus } from "lucide-react";

export default async function SubscribersPage() {
  const supabase = await createClient();
  const { data: subscribers, error } = await supabase
    .from("subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="text-red-400">
        Failed to load subscribers: {error.message}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold admin-text">
            Newsletter Subscribers
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            View newsletter subscriber information
          </p>
        </div>
        <span className="text-sm text-slate-400">
          {subscribers?.length ?? 0} subscribers
        </span>
      </div>

      {!subscribers || subscribers.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center">
          <UserPlus size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 text-lg mb-2">No subscribers yet</p>
          <p className="text-slate-500 text-sm">
            Newsletter subscribers will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  SMS Consent
                </th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {subscribers.map((sub, i) => (
                <tr
                  key={sub.id}
                  className={`hover:bg-white/[0.03] transition-colors ${
                    i % 2 === 0 ? "" : "bg-white/[0.01]"
                  }`}
                >
                  <td className="px-6 py-4 admin-text font-medium whitespace-nowrap">
                    {sub.name ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                    {sub.company ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                    {sub.phone ?? "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {sub.sms_consent ? (
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs whitespace-nowrap">
                    {sub.created_at
                      ? new Date(sub.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
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
