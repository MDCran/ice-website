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
      <div className="mb-6 grid gap-3 rounded-xl bg-secondary p-4 ring-1 ring-secondary sm:grid-cols-3">
        {[
          ["Browse", "Find a visual by category in the library below."],
          ["Preview", "Check the artwork at the size and color treatment you need."],
          ["Use", "Select an illustration from a CMS section to add it to a page."],
        ].map(([title, description]) => (
          <div key={title}>
            <p className="text-sm font-semibold text-primary">{title}</p>
            <p className="mt-1 text-xs leading-5 text-tertiary">{description}</p>
          </div>
        ))}
      </div>
      <IllustrationsClient illustrations={ILLUSTRATIONS} categories={ILLUSTRATION_CATEGORIES} />
    </div>
  );
}
