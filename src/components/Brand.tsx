import Link from "next/link";

export function Brand({ href = "/", subtitle }: { href?: string; subtitle?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2.5 group"
      aria-label="TUF Assignment Portal home"
    >
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[color:var(--color-ink)] text-[color:var(--color-cream)] font-serif font-semibold text-lg">
        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[color:var(--color-coral)]" />
        T
      </span>
      <span className="flex flex-col leading-tight">
        <span className="font-serif font-semibold text-[15px] tracking-tight text-[color:var(--color-ink)]">
          TUF Assignment Portal
        </span>
        {subtitle && (
          <span className="text-[11px] text-[color:var(--color-ink-400)]">
            {subtitle}
          </span>
        )}
      </span>
    </Link>
  );
}
