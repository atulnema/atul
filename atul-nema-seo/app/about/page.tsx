import type { Metadata } from "next";
import { aboutSections, bio, expertise, industries, tools, values, whyClients, workingProcess } from "@/content/about";
import { createMetadata } from "@/lib/seo";
import { Portrait } from "@/components/about/Portrait";
import { Entrance } from "@/components/motion/Entrance";
import { Marquee } from "@/components/motion/Marquee";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FinalCta } from "@/components/ui/FinalCta";
import { Container, Eyebrow, Index } from "@/components/ui/Primitives";
import { SectionIntro } from "@/components/ui/SectionIntro";

export const metadata: Metadata = createMetadata({
  title: "About Atul Nema | SEO Consultant",
  description:
    "Meet Atul Nema, an India-based SEO consultant who combines technical precision, useful content and commercial thinking to build sustainable organic growth.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section aria-labelledby="page-title" className="relative overflow-hidden pb-20 pt-28 sm:pt-32 lg:pb-28 lg:pt-40">
        <div aria-hidden className="grid-lines grid-fade pointer-events-none absolute inset-0" />
        <span aria-hidden className="pointer-events-none absolute -left-[20%] top-0 h-[50rem] w-[50rem] rounded-full bg-[radial-gradient(closest-side,rgba(212,245,60,0.09),transparent)]" />
        <span aria-hidden className="pointer-events-none absolute -left-[30%] top-[40%] aspect-square w-[90vw] rotate-[14deg] rounded-full border-t border-lime/20" />
        <Container className="relative grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <Breadcrumbs
              items={[
                { name: "Home", path: "/" },
                { name: "About", path: "/about" },
              ]}
            />
            <Entrance className="mt-8">
              <Eyebrow>About Atul</Eyebrow>
            </Entrance>
            <SplitHeading
              as="h1"
              id="page-title"
              trigger="mount"
              delay={0.1}
              lines={["Strategy, Clarity,", "and Sustainable", { text: "Growth.", highlight: "Growth." }]}
              className="mt-6 font-display text-[clamp(3rem,6.4vw,7rem)] uppercase leading-[0.9] text-bone"
            />
            <div className="mt-12 max-w-2xl space-y-6">
              {bio.map((p, i) => (
                <Entrance key={i} as="p" delay={0.35 + i * 0.1} className={i === 0 ? "text-xl leading-relaxed text-bone/90 sm:text-2xl" : "text-lg leading-relaxed text-muted"}>
                  {p}
                </Entrance>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 lg:pt-24">
            <Portrait />
          </div>
        </Container>
      </section>

      {/* Story + approach */}
      {aboutSections.map((section, i) => (
        <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="border-t border-bone/10 py-20 lg:py-28">
          <Container className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Index>{String(i + 1).padStart(2, "0")}</Index>
              <SplitHeading
                id={`${section.id}-title`}
                lines={[section.title]}
                className="mt-4 font-display text-d3 uppercase text-bone"
              />
            </div>
            <div className="space-y-6 lg:col-span-7">
              {section.body.map((p, j) => (
                <Reveal key={j} delay={j * 0.1}>
                  <p className="text-lg leading-relaxed text-muted sm:text-xl">{p}</p>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      ))}

      {/* Tools and expertise */}
      <section id="expertise" aria-labelledby="expertise-title" className="border-t border-bone/10 pt-20 lg:pt-28">
        <Container>
          <SectionIntro
            eyebrow="03"
            id="expertise-title"
            size="d3"
            lines={["Tools and Expertise"]}
            intro="The right tools matter, but judgment matters more. These are the ones I rely on every week."
          />
          <Stagger className="mt-12 grid gap-px border border-bone/10 bg-bone/10 md:grid-cols-3">
            {expertise.map((group) => (
              <StaggerItem key={group.group} className="bg-ink p-6 sm:p-8">
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-lime">{group.group}</h3>
                <ul className="mt-5 space-y-2.5">
                  {group.items.map((item) => (
                    <li key={item} className="text-bone/90">
                      {item}
                    </li>
                  ))}
                </ul>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
        <div className="mt-16 border-y border-bone/10 py-6">
          <Marquee
            label="Tools I use"
            items={tools}
            speed={1.6}
            itemClassName="text-outline font-display text-[clamp(2.25rem,5vw,4.5rem)] uppercase leading-none"
          />
        </div>
      </section>

      {/* Industries + why clients choose me */}
      <section aria-labelledby="industries-title" className="py-20 lg:py-28">
        <Container className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Index>04</Index>
            <SplitHeading id="industries-title" lines={["Industries I Work With"]} className="mt-4 font-display text-d3 uppercase text-bone" />
            <Stagger as="ul" className="mt-8 flex flex-wrap gap-2" stagger={0.04}>
              {industries.map((item) => (
                <StaggerItem as="li" key={item} className="rounded-full border border-bone/15 px-4 py-2.5 text-sm text-bone/90">
                  {item}
                </StaggerItem>
              ))}
            </Stagger>
          </div>
          <div id="why-clients" className="lg:col-span-7">
            <Index>05</Index>
            <SplitHeading lines={["Why Clients Choose Me"]} className="mt-4 font-display text-d3 uppercase text-bone" />
            <Stagger as="ol" className="mt-8 border-t border-bone/10" stagger={0.1}>
              {whyClients.map((item, i) => (
                <StaggerItem as="li" key={item.title} className="grid gap-2 border-b border-bone/10 py-6 sm:grid-cols-[3rem_1fr]">
                  <span aria-hidden className="font-mono text-xs text-lime">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-xl text-bone">{item.title}</h3>
                    <p className="mt-2 leading-relaxed text-muted">{item.body}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Container>
      </section>

      {/* Values */}
      <section aria-labelledby="values-title" className="border-t border-bone/10 py-20 lg:py-28">
        <Container>
          <SectionIntro eyebrow="Core values" id="values-title" lines={["What I", { text: "Stand For.", highlight: "Stand For." }]} />
          <Stagger as="ul" className="mt-14 grid border-l border-t border-bone/10 sm:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
            {values.map((v, i) => (
              <StaggerItem
                as="li"
                key={v.title}
                className="group relative overflow-hidden border-b border-r border-bone/10 p-6 sm:p-8 lg:min-h-[15rem]"
              >
                <span aria-hidden className="absolute inset-0 origin-bottom scale-y-0 bg-lime transition-transform duration-700 ease-expo group-hover:scale-y-100" />
                <div className="relative">
                  <span aria-hidden className="font-mono text-xs text-faint transition-colors duration-500 group-hover:text-ink/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-10 font-display text-2xl uppercase text-bone transition-colors duration-500 group-hover:text-ink sm:text-3xl">
                    {v.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-muted transition-colors duration-500 group-hover:text-ink/80">{v.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* Working process */}
      <section aria-labelledby="working-title" className="border-t border-bone/10 py-20 lg:py-28">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal y={12}>
              <Eyebrow>Working together</Eyebrow>
            </Reveal>
            <SplitHeading
              id="working-title"
              lines={["What Working", "With Me", { text: "Looks Like.", highlight: "Looks Like." }]}
              className="mt-6 font-display text-d3 uppercase text-bone"
            />
          </div>
          <Stagger as="ol" className="border-t border-bone/10 lg:col-span-7" stagger={0.08}>
            {workingProcess.map((item, i) => (
              <StaggerItem as="li" key={item.title} className="group flex gap-6 border-b border-bone/10 py-6">
                <span aria-hidden className="mt-1 font-mono text-xs text-lime">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-xl text-bone transition-transform duration-500 ease-expo group-hover:translate-x-1.5">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 leading-relaxed text-muted">{item.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      <FinalCta
        eyebrow="Let’s talk"
        lines={["Let’s Build Your", { text: "Organic Growth Engine.", highlight: "Growth Engine." }]}
        copy="Tell me where you are today and where you want to be. I’ll show you the most practical way to get there."
        primary={{ label: "Work With Atul", href: "/contact" }}
        secondary={{ label: "View SEO Results", href: "/results" }}
      />
    </>
  );
}
