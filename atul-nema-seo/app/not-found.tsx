import { Button } from "@/components/ui/Button";
import { Container, Eyebrow } from "@/components/ui/Primitives";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80svh] items-center overflow-hidden pt-28">
      <div aria-hidden className="grid-lines grid-fade pointer-events-none absolute inset-0" />
      <Container className="relative">
        <Eyebrow>Error 404</Eyebrow>
        <h1 className="mt-6 font-display text-d1 uppercase text-bone">
          This page <span className="text-lime">doesn’t rank.</span>
        </h1>
        <p className="mt-6 max-w-lg text-lg text-muted">
          It may have moved or never existed. Let’s get you somewhere useful.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href="/">Back to Home</Button>
          <Button href="/contact" variant="outline">
            Book a Free SEO Audit
          </Button>
        </div>
      </Container>
    </section>
  );
}
