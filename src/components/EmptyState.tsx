import { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card text-center py-16">
      <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[color:var(--color-cream-100)] text-[color:var(--color-ink-400)] mb-4">
        <Icon size={26} />
      </div>
      <h3 className="font-serif text-xl font-semibold text-[color:var(--color-ink)]">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 text-sm text-[color:var(--color-ink-400)] max-w-md mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
