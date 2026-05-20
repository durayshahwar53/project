import Link from "next/link";
import {
  CloudUpload,
  ShieldCheck,
  Clock,
  Users,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  FileText,
  Mail,
} from "lucide-react";
import { Brand } from "@/components/Brand";
import { FadeUp, RevealOnView, StaggerGroup, StaggerItem } from "@/components/Motion";
import { MotionLink } from "@/components/MotionLink";

export default function Home() {
  return (
    <div className="min-h-screen bg-[color:var(--color-cream)]">
      <header className="border-b border-[color:var(--color-line)]">
        <div className="mx-auto max-w-[1180px] px-6 h-16 flex items-center justify-between">
          <Brand subtitle="The University of Faisalabad" />
          <nav className="hidden sm:flex items-center gap-6 text-sm text-[color:var(--color-ink-500)]">
            <a href="#features" className="hover:text-[color:var(--color-ink)]">
              Features
            </a>
            <a href="#how" className="hover:text-[color:var(--color-ink)]">
              How it works
            </a>
            <a href="#roles" className="hover:text-[color:var(--color-ink)]">
              For you
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn btn-ghost btn-sm">
              Sign in
            </Link>
            <MotionLink href="/register" className="btn btn-primary btn-sm">
              Create account
            </MotionLink>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grain pointer-events-none opacity-60" />
        <div className="relative mx-auto max-w-[1180px] px-6 py-20 sm:py-28 text-center">
          <FadeUp delay={0}>
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[color:var(--color-line)] px-3 py-1 text-xs text-[color:var(--color-ink-500)] mb-6">
              <Sparkles size={12} className="text-[color:var(--color-coral)]" />
              Built for The University of Faisalabad · Department of Computer Science
            </div>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h1 className="font-serif font-semibold text-5xl sm:text-6xl lg:text-7xl text-[color:var(--color-ink)] tracking-tight leading-[1.05] max-w-4xl mx-auto">
              A calm, cloud-based home for{" "}
              <span className="italic text-[color:var(--color-coral-dark)]">
                every assignment.
              </span>
            </h1>
          </FadeUp>
          <FadeUp delay={0.16}>
            <p className="mt-6 text-lg text-[color:var(--color-ink-400)] max-w-2xl mx-auto leading-relaxed">
              Replace scattered emails, printed papers, and lost deadlines with one secure place
              where teachers create work and students submit it — beautifully organized, end to end.
            </p>
          </FadeUp>
          <FadeUp delay={0.24}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <MotionLink href="/register" className="btn btn-primary btn-lg">
                Get started — it&apos;s free
                <ArrowRight size={16} />
              </MotionLink>
              <MotionLink href="/login" className="btn btn-ghost btn-lg">
                I already have an account
              </MotionLink>
            </div>
          </FadeUp>

          <FadeUp delay={0.32}>
            <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-[color:var(--color-ink-400)]">
              {[
                "Cloud-secured uploads",
                "Email password reset",
                "Late-submission control",
                "Grading & feedback",
              ].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[color:var(--color-sage)]" />
                  {t}
                </span>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      <section
        id="features"
        className="mx-auto max-w-[1180px] px-6 py-20 border-t border-[color:var(--color-line)]"
      >
        <RevealOnView>
          <div className="text-center mb-14">
            <div className="text-xs uppercase tracking-wider text-[color:var(--color-coral-dark)] font-medium mb-2">
              What it does
            </div>
            <h2 className="font-serif text-4xl font-semibold text-[color:var(--color-ink)]">
              Everything an assignment workflow needs.
            </h2>
          </div>
        </RevealOnView>
        <StaggerGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <StaggerItem key={f.title} className="card">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--color-coral-soft)] text-[color:var(--color-coral-dark)] mb-4">
                <f.icon size={20} />
              </div>
              <h3 className="font-serif text-lg font-semibold text-[color:var(--color-ink)] mb-1.5">
                {f.title}
              </h3>
              <p className="text-sm text-[color:var(--color-ink-400)] leading-relaxed">
                {f.description}
              </p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <section
        id="how"
        className="mx-auto max-w-[1180px] px-6 py-20 border-t border-[color:var(--color-line)]"
      >
        <RevealOnView>
          <div className="text-center mb-14">
            <div className="text-xs uppercase tracking-wider text-[color:var(--color-coral-dark)] font-medium mb-2">
              How it works
            </div>
            <h2 className="font-serif text-4xl font-semibold text-[color:var(--color-ink)]">
              Three quiet steps. No more chaos.
            </h2>
          </div>
        </RevealOnView>
        <StaggerGroup className="grid md:grid-cols-3 gap-5">
          {STEPS.map((s, i) => (
            <StaggerItem key={s.title} className="card-flat relative">
              <div className="font-serif text-3xl text-[color:var(--color-coral-dark)] font-semibold mb-2">
                0{i + 1}
              </div>
              <h3 className="font-serif text-lg font-semibold text-[color:var(--color-ink)] mb-1.5">
                {s.title}
              </h3>
              <p className="text-sm text-[color:var(--color-ink-400)] leading-relaxed">
                {s.description}
              </p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <section
        id="roles"
        className="mx-auto max-w-[1180px] px-6 py-20 border-t border-[color:var(--color-line)]"
      >
        <StaggerGroup className="grid md:grid-cols-2 gap-5">
          <StaggerItem className="card">
            <GraduationCap className="text-[color:var(--color-coral-dark)] mb-3" />
            <h3 className="font-serif text-2xl font-semibold text-[color:var(--color-ink)] mb-2">
              For students
            </h3>
            <ul className="space-y-2 text-sm text-[color:var(--color-ink-500)]">
              {[
                "See every assignment in one feed",
                "Submit before the deadline with file previews",
                "Get a confirmation email instantly",
                "Track grades, feedback and submission history",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <CheckCircle2 size={16} className="text-[color:var(--color-sage)] mt-0.5 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </StaggerItem>
          <StaggerItem className="card">
            <Briefcase className="text-[color:var(--color-coral-dark)] mb-3" />
            <h3 className="font-serif text-2xl font-semibold text-[color:var(--color-ink)] mb-2">
              For teachers
            </h3>
            <ul className="space-y-2 text-sm text-[color:var(--color-ink-500)]">
              {[
                "Create assignments with rich descriptions and attachments",
                "Set deadlines and late-submission policies",
                "Review submissions and download files",
                "Grade with personalized feedback",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <CheckCircle2 size={16} className="text-[color:var(--color-sage)] mt-0.5 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </StaggerItem>
        </StaggerGroup>
      </section>

      <section className="mx-auto max-w-[1180px] px-6 py-20 border-t border-[color:var(--color-line)]">
        <RevealOnView>
          <div className="card-flat text-center py-14">
            <h2 className="font-serif text-4xl font-semibold text-[color:var(--color-ink)] mb-3">
              Ready when you are.
            </h2>
            <p className="text-[color:var(--color-ink-400)] max-w-xl mx-auto mb-6">
              Create your free account and bring your classroom workflow online in minutes.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <MotionLink href="/register" className="btn btn-coral btn-lg">
                Create your account <ArrowRight size={16} />
              </MotionLink>
              <MotionLink href="/login" className="btn btn-ghost btn-lg">
                Sign in instead
              </MotionLink>
            </div>
          </div>
        </RevealOnView>
      </section>

      <footer className="border-t border-[color:var(--color-line)] py-10">
        <div className="mx-auto max-w-[1180px] px-6 flex flex-wrap items-center justify-between gap-4 text-sm text-[color:var(--color-ink-400)]">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 bg-[color:var(--color-coral)] rounded-sm" />
            <span>
              TUF Assignment Portal · © {new Date().getFullYear()} ·{" "}
              <span className="text-[color:var(--color-ink-500)]">
                A final-year project by{" "}
                <strong className="text-[color:var(--color-ink)]">
                  Dury Shahwar
                </strong>{" "}
                (BSSE-2022-078)
              </span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="mailto:zohaibkhalid.pk@gmail.com"
              className="inline-flex items-center gap-1.5 hover:text-[color:var(--color-ink)]"
            >
              <Mail size={14} /> Contact admin
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    icon: CloudUpload,
    title: "Cloud uploads via Cloudinary",
    description:
      "Every file lives on secure cloud infrastructure with automatic backups — never lost, always accessible.",
  },
  {
    icon: ShieldCheck,
    title: "Bank-grade authentication",
    description:
      "Hashed passwords, JWT sessions, and one-time tokenized password reset links protect every account.",
  },
  {
    icon: Clock,
    title: "Smart deadline tracking",
    description:
      "Visual badges, late-submission flags, and configurable lockouts keep everyone honest with the clock.",
  },
  {
    icon: Users,
    title: "Three roles, clearly separated",
    description:
      "Students, teachers, and administrators each get the screens and powers they actually need.",
  },
  {
    icon: FileText,
    title: "Rich assignment workflows",
    description:
      "Attach reference material, set marks, gather submissions, grade, and leave feedback — all in one place.",
  },
  {
    icon: Mail,
    title: "Beautifully designed emails",
    description:
      "Welcome notes, submission receipts, and password reset links arrive looking like they were crafted by hand.",
  },
];

const STEPS = [
  {
    title: "Teacher creates",
    description:
      "Publish a new assignment with description, deadline, marks, and optional reference files.",
  },
  {
    title: "Student submits",
    description:
      "Students browse open work, upload their file, and get an instant email confirmation.",
  },
  {
    title: "Teacher reviews & grades",
    description:
      "Download submissions, grade with feedback, and keep an organized record forever.",
  },
];
