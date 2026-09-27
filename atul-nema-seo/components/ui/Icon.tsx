import {
  Compass,
  FileSearch,
  Gauge,
  MapPin,
  PenLine,
  ShoppingBag,
  type LucideProps,
} from "lucide-react";

const icons = {
  audit: FileSearch,
  technical: Gauge,
  local: MapPin,
  content: PenLine,
  ecommerce: ShoppingBag,
  consulting: Compass,
};

export type IconName = keyof typeof icons;

/** Service icons referenced by name from the content files. */
export function Icon({ name, ...props }: { name: IconName } & LucideProps) {
  const Component = icons[name];
  return <Component aria-hidden strokeWidth={1.5} {...props} />;
}
