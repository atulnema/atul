import { Container } from "./Primitives";
import { PageHero } from "./PageHero";

/** Simple long-form layout for legal pages. */
export function LegalPage({
  title,
  path,
  updated,
  sections,
}: {
  title: string;
  path: string;
  updated: string;
  sections: { heading: string; body: string[] }[];
}) {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        crumbs={[
          { name: "Home", path: "/" },
          { name: title, path },
        ]}
        lines={[title]}
        intro={`Last updated: ${updated}. Placeholder text: have it reviewed by a legal professional before launch.`}
      />
      <section className="border-t border-bone/10 py-16 lg:py-24">
        <Container className="max-w-3xl">
          <div className="space-y-12">
            {sections.map((s) => (
              <div key={s.heading}>
                <h2 className="font-display text-2xl uppercase text-bone sm:text-3xl">{s.heading}</h2>
                {s.body.map((p, i) => (
                  <p key={i} className="mt-4 leading-relaxed text-muted">
                    {p}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
