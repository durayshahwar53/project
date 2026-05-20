import { initials } from "@/lib/utils";

export function Avatar({
  name,
  src,
  size = 36,
}: {
  name?: string;
  src?: string;
  size?: number;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name || "Avatar"}
        width={size}
        height={size}
        className="rounded-full object-cover border border-[color:var(--color-line)]"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-cream-200)] text-[color:var(--color-ink-700)] font-semibold border border-[color:var(--color-line)]"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials(name)}
    </span>
  );
}
