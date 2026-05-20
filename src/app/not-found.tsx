import Link from "next/link";
import { Brand } from "@/components/Brand";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-8">
          <Brand />
        </div>
        <div className="font-serif text-[120px] leading-none font-semibold text-[color:var(--color-coral)] mb-2">
          404
        </div>
        <h1 className="font-serif text-3xl font-semibold text-[color:var(--color-ink)] mb-2">
          We couldn&apos;t find that page.
        </h1>
        <p className="text-[color:var(--color-ink-400)] mb-6">
          The link may be broken or the page may have moved. Try the dashboard.
        </p>
        <Link href="/dashboard" className="btn btn-primary">
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
