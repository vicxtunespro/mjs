import Link from "next/link";
import { cn } from "@/lib/utils";

export type FooterLink = {
  label: string;
  href: string;
};

export type FooterProps = {
  brand?: string;
  year?: number;
  links?: FooterLink[];
  className?: string;
};

export function Footer({
  brand = "MyApp",
  year = new Date().getFullYear(),
  links = [],
  className,
}: FooterProps) {
  return (
    <footer
      className={cn(
        "flex flex-col gap-3 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      <p className="leading-6">
        © {year} {brand}. All rights reserved.
      </p>

      {links.length > 0 ? (
        <nav
          aria-label="Footer links"
          className="flex flex-wrap items-center gap-x-4 gap-y-2"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-zinc-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </footer>
  );
}