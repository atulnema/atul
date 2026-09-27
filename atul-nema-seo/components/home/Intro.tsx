import { Reveal } from "@/components/motion/Reveal";
import { TextLink } from "@/components/ui/Button";
import { Container, Eyebrow } from "@/components/ui/Primitives";
import { SplitHeading } from "@/components/motion/SplitHeading";

const focus = ["Your market", "Your customers", "Your competition", "Your revenue goals"];

export function Intro() {
  return (
    <section aria-labelledby="intro-title" className="relative py-20 lg:py-32">
      <Container className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal y={12}>
            <Eyebrow>The approach</Eyebrow>
          </Reveal>
          <SplitHeading
            id="intro-title"
            lines={["SEO Built Around", { text: "Business Results.", highlight: "Results." }]}
            className="mt-6 font-display text-d2 uppercase text-bone"
          />
        </div>
        <div className="lg:col-span-5 lg:pt-16">
          <Reveal>
            <p className="text-xl leading-relaxed text-bone/90 sm:text-2xl">
              Ranking is only valuable when it creates real business growth. Every strategy is built around your
              market, customers, competition, and revenue goals—not vanity metrics.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="mt-10 grid grid-cols-2 border-t border-bone/10">
              {focus.map((item, i) => (
                <li key={item} className="flex items-baseline gap-3 border-b border-bone/10 py-4 text-sm text-muted">
                  <span aria-hidden className="font-mono text-[0.66rem] text-lime">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.2} className="mt-8">
            <TextLink href="/about">Meet Atul</TextLink>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
