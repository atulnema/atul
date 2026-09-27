import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { breadcrumbSchema, type Crumb } from "@/lib/seo";
import { JsonLd } from "./JsonLd";

/** Visible breadcrumb trail plus matching BreadcrumbList schema. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-faint">
          {items.map((item, i) => {
            const last = i === items.length - 1;
            return (
              <li key={item.path} className="flex items-center gap-1">
                {last ? (
                  <span aria-current="page" className="text-muted">
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link href={item.path} className="inline-flex min-h-[44px] items-center hover:text-lime">
                      {item.name}
                    </Link>
                    <ChevronRight aria-hidden className="h-3 w-3" />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbSchema(items)} />
    </>
  );
}
