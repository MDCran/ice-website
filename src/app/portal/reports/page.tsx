"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BarChart01, Calendar, Download01, Eye, File02, Folder } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import type { ClientResource } from "@/lib/types/database";

const REPORT_CATEGORIES = new Set([
  "qbr",
  "qbrs",
  "reports",
  "report",
  "quarterly",
  "security posture",
  "utilization",
]);

function isReportResource(resource: ClientResource) {
  const cat = (resource.category || "").trim().toLowerCase();
  if (REPORT_CATEGORIES.has(cat)) return true;
  const title = (resource.title || "").toLowerCase();
  return /\bqbr\b|quarterly business|security posture|utilization report/.test(title);
}

/**
 * QBR / reports library (#50) — surfaces published portal resources tagged as
 * QBR, reports, utilization, or security posture summaries.
 */
export default function PortalReportsPage() {
  const [resources, setResources] = useState<ClientResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setResources([]);
          return;
        }

        const { data: clientUser } = await supabase
          .from("client_users")
          .select("client_account_id")
          .eq("id", user.id)
          .single();
        if (!clientUser) {
          setResources([]);
          return;
        }

        const { data } = await supabase
          .from("client_resources")
          .select("*")
          .eq("client_account_id", clientUser.client_account_id)
          .eq("visibility", "published")
          .order("created_at", { ascending: false });

        setResources((data ?? []).filter(isReportResource));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, ClientResource[]>();
    for (const r of resources) {
      const key = r.category?.trim() || "Reports";
      const list = map.get(key) ?? [];
      list.push(r);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [resources]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingIndicator type="line-spinner" size="md" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-display-xs font-semibold text-primary">QBR &amp; reports</h1>
        <p className="mt-1 text-md text-tertiary">
          Quarterly business reviews, utilization summaries, and security posture reports
          published for your account.
        </p>
      </div>

      {resources.length === 0 ? (
        <div className="rounded-xl bg-primary py-12 shadow-xs ring-1 ring-secondary">
          <EmptyState size="sm">
            <EmptyState.Header>
              <EmptyState.FeaturedIcon color="gray" icon={BarChart01} />
            </EmptyState.Header>
            <EmptyState.Content>
              <EmptyState.Title>No reports yet</EmptyState.Title>
              <EmptyState.Description>
                When your ICE team publishes a QBR or operational report, it will appear here.
                Documents can also live under Resources with category &quot;QBR&quot; or
                &quot;Reports&quot;.
              </EmptyState.Description>
            </EmptyState.Content>
            <EmptyState.Footer>
              <Button href="/portal/resources" size="md" color="secondary" iconLeading={Folder}>
                Browse all documents
              </Button>
            </EmptyState.Footer>
          </EmptyState>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([category, items]) => (
            <section key={category}>
              <h2 className="mb-3 text-sm font-semibold text-secondary">{category}</h2>
              <ul className="space-y-3">
                {items.map((report) => (
                  <li
                    key={report.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-primary p-4 shadow-xs ring-1 ring-secondary"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <FeaturedIcon color="brand" theme="light" size="md" icon={File02} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-primary">{report.title}</p>
                        {report.description && (
                          <p className="mt-0.5 line-clamp-2 text-sm text-tertiary">
                            {report.description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-quaternary">
                          {report.version_label && (
                            <Badge size="sm" color="brand">
                              {report.version_label}
                            </Badge>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="size-3" aria-hidden />
                            {new Date(report.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {report.file_url && (
                        <Button
                          size="sm"
                          color="secondary"
                          iconLeading={Eye}
                          href={report.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </Button>
                      )}
                      {report.allow_download && report.file_url && (
                        <Button
                          size="sm"
                          color="primary"
                          iconLeading={Download01}
                          href={report.file_url}
                          download
                        >
                          Download
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
