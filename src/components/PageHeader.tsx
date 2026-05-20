export function PageHeader({
  title,
  description,
  eyebrow,
  action,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <div className="text-xs uppercase tracking-wider text-[color:var(--color-coral-dark)] font-medium mb-2">
            {eyebrow}
          </div>
        )}
        <h1 className="text-3xl sm:text-[34px] font-serif font-semibold text-[color:var(--color-ink)] tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-[15px] text-[color:var(--color-ink-400)] leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
