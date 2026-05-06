"use client";

import Link from "next/link";
import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Play, ArrowRight, Upload, Target, Brain } from "lucide-react";

/* ─── Spring preset ──────────────────────────────────────────────────────── */
const spring     = { type: "spring", stiffness: 380, damping: 16 };
const springFast = { type: "spring", stiffness: 500, damping: 20 };

/* ─── Infinite ticker ────────────────────────────────────────────────────── */
const TICKER_ITEMS = [
  "📄 PDFs", "📊 CSVs", "🖼️ Images", "💻 Code Files",
  "📝 Docs", "🔍 No Prompts Needed", "⚡ Instant Output",
  "📦 Any Format", "🧠 AI Powered",
];

function Ticker() {
  const x = useMotionValue(0);
  const ref = useRef(null);

  useAnimationFrame((_, delta) => {
    const el = ref.current;
    if (!el) return;
    const w = el.scrollWidth / 2;
    const next = ((x.get() - delta * 0.06) % w);
    x.set(next < -w ? 0 : next);
  });

  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="overflow-hidden border-y-4 border-ink bg-ink py-3 select-none">
      <motion.div ref={ref} style={{ x }} className="flex gap-0 whitespace-nowrap will-change-transform">
        {items.map((item, i) => (
          <span
            key={i}
            className="font-dm-mono text-sm font-medium uppercase tracking-widest text-yellow px-6 border-r border-yellow/20"
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Abstract art panel — Memphis/brutalist CSS composition ─────────────── */
function HeroArt() {
  return (
    <div className="relative w-full h-[480px] md:h-full select-none" aria-hidden="true">
      {/* Base card — the "screen" */}
      <motion.div
        initial={{ opacity: 0, rotate: -3, y: 20 }}
        animate={{ opacity: 1, rotate: -2, y: 0 }}
        transition={{ ...spring, delay: 0.15 }}
        className="absolute inset-8 bg-white border-4 border-ink shadow-brut-xl"
      />

      {/* Coral rectangle — background accent */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...spring, delay: 0.2 }}
        className="absolute top-10 right-6 w-32 h-32 bg-coral border-4 border-ink shadow-brut"
      />

      {/* Cobalt circle */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ...spring, delay: 0.25 }}
        className="absolute bottom-14 left-4 w-24 h-24 rounded-full bg-cobalt border-4 border-ink shadow-brut"
      />

      {/* Lime zigzag strip */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ ...spring, delay: 0.3 }}
        style={{ transformOrigin: "left" }}
        className="absolute top-1/2 left-0 right-0 h-5 bg-lime border-y-4 border-ink -rotate-2"
      />

      {/* Yellow circle — floating dot */}
      <motion.div
        animate={{ y: [-6, 6, -6] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-8 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-yellow border-4 border-ink shadow-brut"
      />

      {/* Inner "document" mockup on the white card */}
      <div className="absolute inset-8 -rotate-2 p-6 flex flex-col gap-2 pointer-events-none">
        {/* Fake toolbar */}
        <div className="flex gap-1.5 mb-1">
          <div className="w-3 h-3 rounded-full bg-coral border-2 border-ink" />
          <div className="w-3 h-3 rounded-full bg-yellow border-2 border-ink" />
          <div className="w-3 h-3 rounded-full bg-lime border-2 border-ink" />
        </div>
        {/* Fake content lines */}
        {[100, 80, 90, 60, 85, 70].map((w, i) => (
          <motion.div
            key={i}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ ...springFast, delay: 0.35 + i * 0.05 }}
            style={{ width: `${w}%`, transformOrigin: "left" }}
            className={`h-2.5 border-2 border-ink ${
              i === 0 ? "bg-ink h-4" : i % 3 === 0 ? "bg-yellow" : "bg-ink/15"
            }`}
          />
        ))}
        {/* Fake output badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.7 }}
          className="mt-3 self-start bg-lime border-3 border-ink px-3 py-1 shadow-brut-sm font-dm-mono text-xs font-bold uppercase"
        >
          ✓ 5 Prompts Ready
        </motion.div>
      </div>

      {/* Decorative corner cross */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...spring, delay: 0.45 }}
        className="absolute bottom-6 right-6 w-10 h-10"
      >
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 bg-ink" />
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1.5 bg-ink" />
      </motion.div>

      {/* Small floating tag */}
      <motion.div
        animate={{ rotate: [3, -2, 3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[44%] right-4 bg-yellow border-3 border-ink px-2.5 py-1 shadow-brut-sm font-dm-mono text-xs font-bold uppercase rotate-3"
      >
        No Prompts!
      </motion.div>
    </div>
  );
}

/* ─── Feature cards data ─────────────────────────────────────────────────── */
const FEATURES = [
  {
    num: "01",
    icon: <Upload className="h-8 w-8" strokeWidth={2} />,
    title: "Upload Anything",
    stripe: "yellow",
    bg: "bg-cream",
    desc: "PDFs, Word docs, CSVs, images, code files — drag it in. ZeroPrompt handles the extraction, parsing, and chunking so you never touch raw text.",
    tags: ["PDF", "DOCX", "CSV", "PNG", "JS/PY"],
  },
  {
    num: "02",
    icon: <Target className="h-8 w-8" strokeWidth={2} />,
    title: "Pick Your Goal",
    stripe: "cobalt",
    bg: "bg-cobalt",
    textColor: "text-white",
    descColor: "text-white/70",
    tagBg: "bg-white/20 border-white/40 text-white",
    desc: "No blank prompt box. Tap a tile — Summarise, Explain, Extract Data, Write Tests, Translate. ZeroPrompt routes your file to the right workflow.",
    tags: ["Summarise", "Explain", "Extract", "Test", "Translate"],
  },
  {
    num: "03",
    icon: <Brain className="h-8 w-8" strokeWidth={2} />,
    title: "Instant Intelligence",
    stripe: "lime",
    bg: "bg-cream",
    desc: "Gemini reads the document, applies your goal, and returns structured output in seconds. No prompt engineering. No copy-paste. No fluff.",
    tags: ["Gemini 1.5", "< 5s", "Structured"],
  },
];

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream text-ink overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="border-b-4 border-ink bg-yellow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={spring}
            className="flex items-center gap-2"
          >
            <Zap className="h-6 w-6" strokeWidth={3} />
            <span className="font-syne font-extrabold text-xl tracking-tight">ZeroPrompt</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={spring}
            className="flex items-center gap-3"
          >
            <Link href="/settings">
              <Button variant="ghost" size="sm">Settings</Button>
            </Link>
            <Link href="/app">
              <Button variant="invert" size="sm">Launch App</Button>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-6 grid md:grid-cols-2 gap-12 items-center min-h-[calc(100vh-60px)]">

        {/* Left — copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.05 }}
            className="inline-block bg-lime border-3 border-ink px-3 py-1 shadow-brut-sm font-dm-mono text-xs uppercase tracking-widest mb-7"
          >
            Now in beta &mdash; free to use
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.1 }}
            className="font-syne font-extrabold leading-[0.92] tracking-tight mb-7"
            style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}
          >
            AI That Reads<br />
            <span className="relative inline-block">
              Your Mind.
              {/* slab underline */}
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ ...springFast, delay: 0.4 }}
                style={{ transformOrigin: "left" }}
                aria-hidden="true"
                className="absolute bottom-1 left-0 w-full h-4 bg-yellow -z-10"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.18 }}
            className="font-dm-mono text-xl text-ink/70 max-w-md mb-10 leading-relaxed"
          >
            Upload a file. Pick a goal. Done.<br />
            <span className="text-ink font-medium">No prompts. No fluff.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.24 }}
            className="flex flex-wrap gap-4"
          >
            <Link href="/app">
              <motion.div whileHover={{ x: -2, y: -2 }} whileTap={{ x: 2, y: 2 }} transition={spring}>
                <Button variant="yellow" size="lg" className="text-base px-8 gap-2">
                  Try It Free <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
            <motion.div whileHover={{ x: -2, y: -2 }} whileTap={{ x: 2, y: 2 }} transition={spring}>
              <Button variant="outline" size="lg" className="text-base px-8 gap-2">
                <Play className="h-4 w-4 fill-ink" /> Watch Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Social proof strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex items-center gap-4 font-dm-mono text-xs text-ink/50 uppercase tracking-wider"
          >
            <span className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow text-base leading-none">★</span>
              ))}
            </span>
            <span>Zero prompt engineering required</span>
          </motion.div>
        </div>

        {/* Right — abstract art */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...spring, delay: 0.12 }}
          className="hidden md:block"
        >
          <HeroArt />
        </motion.div>
      </section>

      {/* ── Ticker ── */}
      <Ticker />

      {/* ── Feature cards ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={spring}
          className="font-syne font-extrabold text-4xl mb-2"
        >
          How it works.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ ...spring, delay: 0.08 }}
          className="font-dm-mono text-ink/50 text-sm uppercase tracking-widest mb-12"
        >
          Three steps. No guessing.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-0 border-4 border-ink shadow-brut-xl">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ ...spring, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <Card
                stripe={f.stripe}
                className={`
                  ${f.bg ?? "bg-cream"} rounded-none shadow-none
                  border-0 border-r-4 last:border-r-0 border-ink
                  h-full
                `}
              >
                <CardContent className="p-7 flex flex-col h-full">
                  <span className={`font-dm-mono text-xs uppercase tracking-widest mb-5 block ${f.descColor ?? "text-ink/40"}`}>
                    {f.num}
                  </span>

                  <div className={`mb-5 ${f.textColor ?? "text-ink"}`}>{f.icon}</div>

                  <h3 className={`font-syne font-extrabold text-2xl mb-3 ${f.textColor ?? "text-ink"}`}>
                    {f.title}
                  </h3>

                  <p className={`font-dm-mono text-sm leading-relaxed mb-6 flex-1 ${f.descColor ?? "text-ink/60"}`}>
                    {f.desc}
                  </p>

                  {/* Tag chips */}
                  <div className="flex flex-wrap gap-2">
                    {f.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`font-dm-mono text-[11px] uppercase tracking-wider px-2 py-0.5 border-2 ${
                          f.tagBg ?? "border-ink bg-cream shadow-brut-sm"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA banner ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={spring}
        className="mx-6 mb-20 border-4 border-ink shadow-brut-xl bg-coral"
      >
        <div className="max-w-7xl mx-auto px-10 py-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div>
            <p className="font-syne font-extrabold text-4xl text-white leading-tight mb-2">
              Ready to ditch<br />prompt writing?
            </p>
            <p className="font-dm-mono text-white/70 text-sm uppercase tracking-widest">
              Free. No signup required.
            </p>
          </div>
          <Link href="/app" className="shrink-0">
            <motion.div whileHover={{ x: -3, y: -3 }} whileTap={{ x: 2, y: 2 }} transition={spring}>
              <Button variant="yellow" size="lg" className="text-lg px-10 py-7">
                Open ZeroPrompt <ArrowRight className="h-5 w-5" />
              </Button>
            </motion.div>
          </Link>
        </div>
      </motion.section>

      {/* ── Footer ── */}
      <footer className="border-t-4 border-ink bg-ink px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow" strokeWidth={3} />
            <span className="font-syne font-bold text-yellow text-sm">ZeroPrompt</span>
          </div>
          <span className="font-dm-mono text-xs text-white/30 uppercase tracking-widest">
            &copy; 2026 ZeroPrompt
          </span>
        </div>
      </footer>

    </div>
  );
}
