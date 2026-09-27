import { stats } from "@/content/home";
import { CountUp } from "@/components/motion/CountUp";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Primitives";

/** Animated performance statistics. Edit the values in content/home.ts. */
export function StatsBand() {
  return (
    <section aria-labelledby="stats-title" className="relative py-20 lg:py-28">
      <Container>
        <h2 id="stats-title" className="sr-only">
          Performance at a glance
        </h2>
        <Stagger as="ul" className="grid grid-cols-2 border-l border-t border-bone/10 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <StaggerItem
              as="li"
              key={stat.label}
              className="group relative flex flex-col justify-between gap-10 border-b border-r border-bone/10 p-5 sm:p-8 lg:min-h-[19rem]"
            >
              <span aria-hidden className="font-mono text-[0.68rem] tracking-[0.18em] text-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col-reverse">
                <p className="mt-3 text-sm text-bone sm:text-base">
                  {stat.label}
                  <span className="mt-1 block font-mono text-[0.66rem] uppercase tracking-[0.14em] text-faint">
                    {stat.note}
                  </span>
                </p>
                <p className="font-display text-[clamp(3rem,7vw,6.5rem)] leading-[0.85] text-bone">
                  <CountUp value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </p>
              </div>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-lime transition-transform duration-700 ease-expo group-hover:scale-x-100"
              />
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
