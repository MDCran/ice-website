import { createClient } from "@/lib/supabase/server";

export interface PageViewInsight {
  path: string;
  views: number;
  avgLcpMs: number | null;
}

export interface AnalyticsInsights {
  available: boolean;
  totalViews: number;
  viewsLast7Days: number;
  viewsLast30Days: number;
  avgLcpMs: number | null;
  dailyViews: { day: string; count: number }[];
  popularPages: PageViewInsight[];
  setupHint: string | null;
}

const SETUP_HINT =
  "No pageview data yet. Apply the SQL migration (page_views table), then browse the public site — first-party tracking logs each visit automatically.";

function dayLabel(d: Date): string {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
}

function dateKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

/**
 * Aggregate first-party page_views for the admin dashboard.
 * Returns available:false with an empty-state hint when the table is missing or empty.
 */
export async function getAnalyticsInsights(): Promise<AnalyticsInsights> {
  const empty: AnalyticsInsights = {
    available: false,
    totalViews: 0,
    viewsLast7Days: 0,
    viewsLast30Days: 0,
    avgLcpMs: null,
    dailyViews: [],
    popularPages: [],
    setupHint: SETUP_HINT,
  };

  try {
    const supabase = await createClient();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalRes, last30Res, last7Res] = await Promise.all([
      supabase.from("page_views").select("id", { count: "exact", head: true }),
      supabase
        .from("page_views")
        .select("id", { count: "exact", head: true })
        .gte("created_at", thirtyDaysAgo.toISOString()),
      supabase
        .from("page_views")
        .select("id", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo.toISOString()),
    ]);

    // Missing relation / permission → treat as not set up yet
    if (totalRes.error) {
      return empty;
    }

    const totalViews = totalRes.count ?? 0;
    if (totalViews === 0) {
      return {
        ...empty,
        dailyViews: buildEmptyDaily(),
      };
    }

    const { data: recentRows, error: recentError } = await supabase
      .from("page_views")
      .select("path, lcp_ms, created_at")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(5000);

    if (recentError || !recentRows) {
      return empty;
    }

    const dailyMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dailyMap.set(dateKey(d), 0);
    }

    const pathStats = new Map<string, { views: number; lcpSum: number; lcpCount: number }>();
    let lcpSum = 0;
    let lcpCount = 0;

    for (const row of recentRows) {
      const created = row.created_at as string;
      const key = created?.slice(0, 10);
      if (key && dailyMap.has(key)) {
        dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
      }

      const path = (row.path as string) || "/";
      const stat = pathStats.get(path) ?? { views: 0, lcpSum: 0, lcpCount: 0 };
      stat.views += 1;
      if (typeof row.lcp_ms === "number" && row.lcp_ms > 0) {
        stat.lcpSum += row.lcp_ms;
        stat.lcpCount += 1;
        lcpSum += row.lcp_ms;
        lcpCount += 1;
      }
      pathStats.set(path, stat);
    }

    const dailyViews = Array.from(dailyMap.entries()).map(([iso, count]) => ({
      day: dayLabel(new Date(iso + "T12:00:00")),
      count,
    }));

    const popularPages: PageViewInsight[] = Array.from(pathStats.entries())
      .map(([path, s]) => ({
        path,
        views: s.views,
        avgLcpMs: s.lcpCount > 0 ? Math.round((s.lcpSum / s.lcpCount) * 10) / 10 : null,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8);

    return {
      available: true,
      totalViews,
      viewsLast7Days: last7Res.count ?? 0,
      viewsLast30Days: last30Res.count ?? 0,
      avgLcpMs: lcpCount > 0 ? Math.round((lcpSum / lcpCount) * 10) / 10 : null,
      dailyViews,
      popularPages,
      setupHint: null,
    };
  } catch {
    return empty;
  }
}

function buildEmptyDaily(): { day: string; count: number }[] {
  const out: { day: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({ day: dayLabel(d), count: 0 });
  }
  return out;
}
