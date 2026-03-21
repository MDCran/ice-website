import { getPageContent } from "@/lib/cms";
import { notFound } from "next/navigation";
import DynamicSolutionPage from "./DynamicSolutionPage";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SolutionPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPageContent(slug);

  if (!page) {
    notFound();
  }

  return <DynamicSolutionPage slug={slug} sections={page.sections} />;
}
