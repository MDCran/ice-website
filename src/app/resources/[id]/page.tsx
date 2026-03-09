"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ArrowLeft, Download } from "lucide-react";
import { motion } from "motion/react";

/* Static resource data (fallback when DB is empty) */
const STATIC_RESOURCES: Record<string, { title: string; pdfUrl: string }> = {
  "data-centers": {
    title: "High-Security Data Centers",
    pdfUrl: "/resources/ICE_High-Security_Data_Centers.pdf",
  },
};

export default function ResourceViewerPage() {
  const { id } = useParams<{ id: string }>();
  const resource = STATIC_RESOURCES[id];

  if (!resource) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Resource Not Found</h1>
          <Link href="/resources" className="text-sky-400 hover:text-sky-300 transition-colors">
            &larr; Back to Resources
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <section className="relative pt-24 lg:pt-28 pb-6">
        <div className="absolute inset-0 mesh-gradient opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 text-sm text-slate-400 mb-4"
          >
            <Link href="/" className="hover:text-sky-400 transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/resources" className="hover:text-sky-400 transition-colors">Resources</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-sky-400 truncate max-w-[200px]">{resource.title}</span>
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center justify-between gap-4"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-white">{resource.title}</h1>
            <div className="flex items-center gap-3">
              <a
                href={resource.pdfUrl}
                download
                className="inline-flex items-center gap-2 rounded-xl bg-white/[0.06] border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:border-sky-500/30 transition-all"
              >
                <Download className="h-4 w-4" />
                Download
              </a>
              <Link
                href="/resources"
                className="inline-flex items-center gap-2 rounded-xl bg-white/[0.06] border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:border-sky-500/30 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PDF Viewer */}
      <section className="flex-1 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02]"
            style={{ height: "calc(100vh - 200px)" }}
          >
            <iframe
              src={resource.pdfUrl}
              title={resource.title}
              className="w-full h-full"
              style={{ border: "none" }}
            />
          </motion.div>
        </div>
      </section>
    </main>
  );
}
