import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { featuredServices } from "@/content/services";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Container } from "@/components/ui/Primitives";
import { SectionIntro } from "@/components/ui/SectionIntro";

export function ServicesPreview() {
  return (
    <section aria-labelledby="services-title" className="relative py-20 lg:py-32">
      <Container>
        <SectionIntro
          eyebrow="Services"
          id="services-title"
          lines={["What I Can Do", "For Your Website."]}
          intro="Focused services that fix what is holding you back and build what moves you forward."
        />

        <Stagger as="ul" className="mt-16 border-t border-bone/10" stagger={0.07}>
          {featuredServices.map((service, i) => (
            <StaggerItem as="li" key={service.slug} className="border-b border-bone/10">
              <Link
                href={`/services#${service.slug}`}
                className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-x-5 gap-y-3 overflow-hidden px-1 py-7 outline-none sm:gap-x-8 lg:grid-cols-12 lg:py-9"
              >
                <span
                  aria-hidden
                  className="absolute inset-0 origin-bottom scale-y-0 bg-lime transition-transform duration-700 ease-expo group-hover:scale-y-100 group-focus-visible:scale-y-100"
                />
                <span className="relative font-mono text-xs text-faint transition-colors duration-500 group-hover:text-ink/70 group-focus-visible:text-ink/70 lg:col-span-1 lg:pl-4">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="relative flex items-center gap-4 lg:col-span-4">
                  <Icon
                    name={service.icon}
                    className="hidden h-7 w-7 shrink-0 text-lime transition-colors duration-500 group-hover:text-ink group-focus-visible:text-ink sm:block"
                  />
                  <span className="font-display text-d4 uppercase text-bone transition-[color,transform] duration-500 ease-expo group-hover:translate-x-2 group-hover:text-ink group-focus-visible:text-ink">
                    {service.name}
                  </span>
                </span>
                <span className="relative col-span-3 col-start-1 row-start-2 max-w-xl text-[0.95rem] leading-relaxed text-muted transition-colors duration-500 group-hover:text-ink/80 group-focus-visible:text-ink/80 lg:col-span-6 lg:col-start-auto lg:row-start-auto">
                  {service.summary}
                </span>
                <span className="relative col-start-3 row-start-1 justify-self-end lg:col-span-1 lg:col-start-12 lg:row-start-auto lg:pr-4">
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-bone/20 text-bone transition-all duration-500 ease-expo group-hover:rotate-45 group-hover:border-ink group-hover:bg-ink group-hover:text-lime group-focus-visible:bg-ink group-focus-visible:text-lime">
                    <ArrowUpRight aria-hidden className="h-4 w-4" />
                  </span>
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-12 flex justify-end">
          <Button href="/services" variant="outline">
            View All Services
          </Button>
        </div>
      </Container>
    </section>
  );
}
