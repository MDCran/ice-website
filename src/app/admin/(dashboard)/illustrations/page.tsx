import { ILLUSTRATIONS, ILLUSTRATION_CATEGORIES } from "@/lib/illustrations";
import IllustrationsClient from "./IllustrationsClient";

export default function IllustrationsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-display-xs font-semibold text-primary">Illustration Library</h1>
        <p className="mt-1 text-sm text-tertiary">
          {ILLUSTRATIONS.length} built-in SVG graphics available for use in page sections.
          Select any illustration when editing a section field to embed it in your content.
        </p>
      </div>
      <IllustrationsClient illustrations={ILLUSTRATIONS} categories={ILLUSTRATION_CATEGORIES} />
    </div>
  );
}
