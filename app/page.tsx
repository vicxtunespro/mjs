"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, Users, BookOpen, MessageSquare, CreditCard, ClipboardList, Calendar, CheckCircle2, GraduationCap, School, BarChart3 } from "lucide-react";
import { motion, useInView, useAnimation, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────
   Design Tokens
   Style: Soft UI Evolution
   Product: Education SaaS (Uganda Primary)
   Typography: Bricolage Grotesque + Plus Jakarta Sans
───────────────────────────────────────────── */

// Scroll reveal wrapper
function ScrollReveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const initial = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
  }[direction];

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...initial }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...initial }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Navigation ─── */
function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-stone-200/80 bg-white/95 shadow-sm shadow-stone-100/60 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-red-700 shadow-md shadow-red-200 transition-all duration-200 group-hover:shadow-red-300 group-hover:scale-105">
            <GraduationCap className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span
            className="text-[1.1rem] font-bold tracking-tight text-stone-900"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            SchoolOS
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 lg:flex">
          {["Features", "For Schools", "Contact"].map((item, i) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase().replace(" ", "-")}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className="rounded-md px-3.5 py-2 text-sm font-medium text-stone-600 transition-colors duration-150 hover:bg-stone-100 hover:text-stone-900 cursor-pointer"
            >
              {item}
            </motion.a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Link
              href="/auth"
              className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm transition-all duration-150 hover:border-stone-300 hover:shadow cursor-pointer"
            >
              Sign in
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
          >
            <Link
              href="/auth"
              className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-red-200 transition-all duration-150 hover:bg-red-800 hover:shadow-red-300 cursor-pointer"
            >
              Get started
            </Link>
          </motion.div>
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-md p-1.5 text-stone-700 hover:bg-stone-100 lg:hidden cursor-pointer"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-b border-stone-200 bg-white px-6 pb-5 lg:hidden"
          >
            <div className="flex flex-col gap-1 pt-2">
              {["Features", "For Schools", "Contact"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  onClick={() => setIsOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  {item}
                </a>
              ))}
              <div className="mt-3 flex flex-col gap-2">
                <Link
                  href="/auth"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-stone-200 px-4 py-2.5 text-center text-sm font-semibold text-stone-700"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg bg-red-700 px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Get started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* ─── Hero ─── */
function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#FAFAF8] pt-28 pb-20 lg:pt-36 lg:pb-28">
      {/* Subtle grid bg */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `linear-gradient(#6b1a1a 1px, transparent 1px), linear-gradient(90deg, #6b1a1a 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
      {/* Warm glow */}
      <div className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-red-100/30 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-amber-100/20 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Left */}
          <div className="flex flex-col">
            <ScrollReveal direction="right">
              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-red-800">
                  Built for Ugandan Primary Schools
                </span>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.06}>
              <h1
                className="text-5xl font-extrabold leading-[1.1] tracking-tight text-stone-900 lg:text-6xl xl:text-7xl"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                One Platform,
                <br />
                <span className="bg-gradient-to-r from-red-700 to-red-500 bg-clip-text text-transparent">
                  Entire School.
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.12}>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-stone-500">
                SchoolOS is the all-in-one management platform designed for Uganda's primary schools — seamless administration, real-time communication, and smarter learning outcomes.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.18}>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/auth"
                  className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-200 transition-all duration-200 hover:bg-red-800 hover:shadow-red-300 hover:-translate-y-0.5 cursor-pointer"
                >
                  Get started free
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-stone-700 shadow-sm transition-all duration-200 hover:border-stone-300 hover:shadow cursor-pointer"
                >
                  See features
                </a>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.24}>
              <div className="mt-10 flex flex-wrap items-center gap-5 text-sm text-stone-500">
                {["No setup fees", "URA compliant", "Local support"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-red-600" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          {/* Right — image */}
          <ScrollReveal direction="left" delay={0.1}>
            <div className="relative">
              {/* Image frame */}
              <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-stone-300/40 ring-1 ring-stone-200">
                <img
                  src="https://res.cloudinary.com/dzidperyt/image/upload/v1779813585/featured_otexox.png"
                  alt="Students in a Ugandan classroom"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-red-900/15 to-transparent" />
              </div>

              {/* Floating stat card */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.45 }}
                className="absolute -bottom-5 -left-5 flex items-center gap-3 rounded-xl border border-stone-100 bg-white px-4 py-3 shadow-xl shadow-stone-200/60"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                  <School className="h-5 w-5 text-red-700" />
                </div>
                <div>
                  <div className="text-lg font-extrabold leading-none text-stone-900" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>150+</div>
                  <div className="mt-0.5 text-xs text-stone-500">Schools enrolled</div>
                </div>
              </motion.div>

              {/* Floating grade card */}
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.75, duration: 0.45 }}
                className="absolute -right-5 -top-5 flex items-center gap-3 rounded-xl border border-stone-100 bg-white px-4 py-3 shadow-xl shadow-stone-200/60"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                  <BarChart3 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-lg font-extrabold leading-none text-stone-900" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>25k+</div>
                  <div className="mt-0.5 text-xs text-stone-500">Active students</div>
                </div>
              </motion.div>

              {/* Decorative ring */}
              <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full border-[1.5px] border-dashed border-red-200 opacity-60" />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

/* ─── Features ─── */
const FEATURES = [
  {
    icon: Users,
    title: "Student Management",
    description: "Centralised records for every learner — attendance, grades, health info, and more in one place.",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: BookOpen,
    title: "Teacher Portal",
    description: "Manage classes, submit marks, track attendance, and communicate with parents effortlessly.",
    color: "text-violet-600 bg-violet-50",
  },
  {
    icon: MessageSquare,
    title: "Parent Communication",
    description: "Real-time updates on student progress, fees, and school announcements — anytime, anywhere.",
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    icon: CreditCard,
    title: "Fee Management",
    description: "Track payments, generate receipts, and manage school finances with a clear audit trail.",
    color: "text-amber-600 bg-amber-50",
  },
  {
    icon: ClipboardList,
    title: "Examination System",
    description: "Create exams, record results, and auto-generate comprehensive report cards for every term.",
    color: "text-red-600 bg-red-50",
  },
  {
    icon: Calendar,
    title: "School Calendar",
    description: "Plan terms, holidays, events, and extracurricular activities — shared across every stakeholder.",
    color: "text-cyan-600 bg-cyan-50",
  },
];

function Features() {
  return (
    <section id="features" className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-stone-100 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-stone-500">
              Platform features
            </div>
            <h2
              className="text-3xl font-extrabold tracking-tight text-stone-900 lg:text-4xl"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Everything your school needs
            </h2>
            <p className="mt-4 text-stone-500">
              Designed with the Ugandan primary education system in mind — every feature maps to how your school actually works.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <ScrollReveal key={i} delay={i * 0.07} direction="up">
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative rounded-2xl border border-stone-100 bg-[#FAFAF8] p-7 shadow-sm transition-shadow duration-200 hover:shadow-md hover:border-stone-200"
              >
                <div className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.color}`}>
                  <f.icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <h3
                  className="text-base font-bold text-stone-900"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-500">{f.description}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── For Schools ─── */
const SCHOOLS = [
  {
    name: "Kampala Parents School",
    location: "Kampala, Uganda",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format",
    tag: "1,200 students",
  },
  {
    name: "Greenhill Academy",
    location: "Kampala, Uganda",
    image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800&auto=format",
    tag: "980 students",
  },
  {
    name: "Heritage International",
    location: "Kampala, Uganda",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format",
    tag: "760 students",
  },
];

function ForSchools() {
  return (
    <section id="for-schools" className="bg-[#FAFAF8] py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-stone-100 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-stone-500">
              Trusted schools
            </div>
            <h2
              className="text-3xl font-extrabold tracking-tight text-stone-900 lg:text-4xl"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Loved by leading schools
            </h2>
            <p className="mt-4 text-stone-500">
              Join hundreds of Ugandan primary schools already using SchoolOS to transform their day-to-day operations.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SCHOOLS.map((s, i) => (
            <ScrollReveal key={i} delay={i * 0.1} direction="up">
              <motion.div
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative h-52 overflow-hidden">
                  <motion.img
                    src={s.image}
                    alt={s.name}
                    className="h-full w-full object-cover"
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 0.4 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-stone-700 backdrop-blur-sm">
                    {s.tag}
                  </span>
                </div>
                <div className="p-5">
                  <h3
                    className="font-bold text-stone-900"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    {s.name}
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-400">
                    <School className="h-3.5 w-3.5" />
                    {s.location}
                  </p>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Stats ─── */
const STATS = [
  { value: "150+", label: "Schools", sub: "Across Uganda" },
  { value: "25k+", label: "Students", sub: "Active learners" },
  { value: "800+", label: "Teachers", sub: "Using the platform" },
  { value: "50k+", label: "Parents", sub: "Connected" },
];

function Stats() {
  return (
    <section className="relative overflow-hidden bg-red-800 py-20">
      <div className="pointer-events-none absolute inset-0 opacity-10"
        style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }}
      />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-10 text-center sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <ScrollReveal key={i} delay={i * 0.1} direction="up">
              <div>
                <div
                  className="text-5xl font-extrabold text-white lg:text-6xl"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  {s.value}
                </div>
                <div className="mt-2 text-base font-semibold text-red-100">{s.label}</div>
                <div className="mt-0.5 text-sm text-red-300">{s.sub}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ─── */
function CTA() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl bg-[#1a0a0a] px-10 py-16 text-center lg:px-20 lg:py-20">
            {/* Glow */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(185,28,28,0.35)_0%,_transparent_70%)]" />
            <div
              className="relative inline-flex mb-4 rounded-full bg-red-900/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-red-300"
            >
              Ready when you are
            </div>
            <h2
              className="relative text-3xl font-extrabold tracking-tight text-white lg:text-5xl"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Transform your school today.
            </h2>
            <p className="relative mx-auto mt-5 max-w-xl text-stone-400">
              Join the growing community of Ugandan schools using SchoolOS to streamline administration and improve learning outcomes.
            </p>
            <div className="relative mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-900/40 transition-all duration-200 hover:bg-red-500 hover:-translate-y-0.5 cursor-pointer"
              >
                Register your school
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-xl border border-stone-700 bg-transparent px-7 py-3.5 text-sm font-semibold text-stone-300 transition-all duration-200 hover:border-stone-500 hover:text-white cursor-pointer"
              >
                See how it works
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer id="contact" className="border-t border-stone-200 bg-[#FAFAF8] py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <ScrollReveal direction="up">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-700">
                  <GraduationCap className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
                <span
                  className="text-base font-bold text-stone-900"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  SchoolOS
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-stone-500">
                Modern school management for Ugandan primary education.
              </p>
              <p className="mt-4 text-xs text-stone-400">© 2026 SchoolOS by Dementa.</p>
            </div>
          </ScrollReveal>

          {[
            {
              title: "Product",
              links: [
                { label: "Features", href: "#features" },
                { label: "For Schools", href: "#for-schools" },
                { label: "Sign in", href: "/auth" },
              ],
            },
            {
              title: "Support",
              links: [
                { label: "Help Center", href: "#" },
                { label: "Contact Us", href: "#" },
                { label: "Privacy Policy", href: "#" },
              ],
            },
            {
              title: "Contact",
              links: [
                { label: "Kampala, Uganda", href: "#" },
                { label: "info@schoolos.ug", href: "mailto:info@schoolos.ug" },
                { label: "+256 XXX XXX XXX", href: "tel:+256000000000" },
              ],
            },
          ].map((col, i) => (
            <ScrollReveal key={col.title} delay={i * 0.08} direction="up">
              <div>
                <h4
                  className="text-sm font-bold text-stone-900"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  {col.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-sm text-stone-500 transition-colors hover:text-stone-900 cursor-pointer"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ─── */
export default function LandingPage() {
  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>
      <Navigation />
      <main>
        <Hero />
        <Features />
        <ForSchools />
        <Stats />
        <CTA />
        <Footer />
      </main>
    </>
  );
}