"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Zap, Eye, EyeOff, Check, ExternalLink, Key,
  Trash2, Loader2, Wifi, WifiOff,
} from "lucide-react";

const spring     = { type: "spring", stiffness: 400, damping: 18 };
const springBig  = { type: "spring", stiffness: 320, damping: 12 };

const MODELS = [
  {
    id: "gemini-1.5-flash",
    label: "Gemini 1.5 Flash",
    badge: "FREE",
    badgeColor: "bg-lime border-ink text-ink",
    desc: "Fast, efficient — perfect for most tasks. Free tier available.",
  },
  {
    id: "gemini-1.5-pro",
    label: "Gemini 1.5 Pro",
    badge: "PRO",
    badgeColor: "bg-cobalt border-ink text-white",
    desc: "Highest accuracy for complex documents. Billed per token.",
  },
];

/* ── Test connection ─────────────────────────────────────────────────────── */
async function pingGemini(apiKey, model) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Reply with exactly the word "OK".' }] }],
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }
  return true;
}

/* ── Save button with bounce ─────────────────────────────────────────────── */
function SaveButton({ onSave, disabled, saved }) {
  return (
    <motion.button
      onClick={onSave}
      disabled={disabled}
      whileHover={disabled ? {} : { x: -2, y: -2, boxShadow: "6px 6px 0px 0px #0A0A0A" }}
      whileTap={disabled ? {} : { x: 2, y: 2, boxShadow: "1px 1px 0px 0px #0A0A0A" }}
      animate={saved ? { scale: [1, 1.12, 0.95, 1.06, 1] } : { scale: 1 }}
      transition={saved ? { ...springBig, duration: 0.45 } : spring}
      style={{ boxShadow: "4px 4px 0px 0px #0A0A0A" }}
      className={`
        relative w-full h-12 flex items-center justify-center gap-2
        font-dm-mono font-medium text-sm uppercase tracking-wider
        border-3 border-ink
        transition-colors duration-100
        disabled:opacity-40 disabled:cursor-not-allowed
        ${saved ? "bg-lime text-ink" : "bg-yellow text-ink"}
      `}
    >
      <AnimatePresence mode="wait">
        {saved ? (
          <motion.span
            key="saved"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={springBig}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" strokeWidth={3} />
            Saved!
          </motion.span>
        ) : (
          <motion.span
            key="save"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={spring}
          >
            Save Settings
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ── Model selector tile ─────────────────────────────────────────────────── */
function ModelTile({ model, selected, onSelect }) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(model.id)}
      whileHover={{ x: -2, y: -2, boxShadow: "6px 6px 0px 0px #0A0A0A" }}
      whileTap={{ x: 2, y: 2, boxShadow: "1px 1px 0px 0px #0A0A0A" }}
      transition={spring}
      style={{
        boxShadow: selected
          ? "4px 4px 0px 0px #0A0A0A"
          : "2px 2px 0px 0px #0A0A0A",
      }}
      className={`
        relative w-full text-left p-4 border-3 border-ink
        transition-colors duration-100
        ${selected ? "bg-yellow" : "bg-cream hover:bg-yellow/20"}
      `}
    >
      {/* Selected indicator */}
      <div
        className={`
          absolute top-3 right-3 w-5 h-5 border-3 border-ink flex items-center justify-center
          ${selected ? "bg-ink" : "bg-cream"}
        `}
      >
        {selected && <Check className="h-3 w-3 text-yellow" strokeWidth={3} />}
      </div>

      <div className="flex items-center gap-2 mb-1.5 pr-8">
        <span className="font-syne font-bold text-base">{model.label}</span>
        <span
          className={`font-dm-mono text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 border-2 ${model.badgeColor}`}
        >
          {model.badge}
        </span>
      </div>
      <p className="font-dm-mono text-xs text-ink/60 leading-relaxed">{model.desc}</p>
    </motion.button>
  );
}

/* ── Connection status badge ─────────────────────────────────────────────── */
function ConnectionStatus({ status, message }) {
  if (!status) return null;

  const styles = {
    testing: "bg-yellow/40 border-ink text-ink",
    ok:      "bg-lime border-ink text-ink",
    fail:    "bg-coral border-ink text-white",
  };
  const icons = {
    testing: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    ok:      <Wifi className="h-3.5 w-3.5" />,
    fail:    <WifiOff className="h-3.5 w-3.5" />,
  };

  return (
    <motion.div
      key={status}
      initial={{ opacity: 0, y: -6, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={springBig}
      className={`flex items-start gap-2.5 border-3 p-3.5 ${styles[status]}`}
    >
      <span className="mt-0.5 shrink-0">{icons[status]}</span>
      <p className="font-dm-mono text-xs leading-relaxed">
        {status === "testing" && "Pinging Gemini API…"}
        {status === "ok"      && <><strong>Connection OK.</strong> Your key is valid and the model responded.</>}
        {status === "fail"    && <><strong>Failed.</strong> {message}</>}
      </p>
    </motion.div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const [apiKey,    setApiKey]    = useState("");
  const [model,     setModel]     = useState("gemini-1.5-flash");
  const [show,      setShow]      = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [testStatus, setTestStatus] = useState(null); // null | "testing" | "ok" | "fail"
  const [testMsg,   setTestMsg]   = useState("");
  const [hasKey,    setHasKey]    = useState(false);

  useEffect(() => {
    const k = localStorage.getItem("zeroprompt_gemini_key");
    const m = localStorage.getItem("zeroprompt_model");
    if (k) { setApiKey(k); setHasKey(true); }
    if (m) setModel(m);
  }, []);

  const handleSave = () => {
    localStorage.setItem("zeroprompt_gemini_key", apiKey.trim());
    localStorage.setItem("zeroprompt_model", model);
    setHasKey(true);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleTest = async () => {
    if (!apiKey.trim()) return;
    setTestStatus("testing");
    setTestMsg("");
    try {
      await pingGemini(apiKey.trim(), model);
      setTestStatus("ok");
    } catch (err) {
      setTestStatus("fail");
      setTestMsg(err.message);
    }
  };

  const handleClear = () => {
    localStorage.removeItem("zeroprompt_gemini_key");
    localStorage.removeItem("zeroprompt_model");
    setApiKey("");
    setModel("gemini-1.5-flash");
    setHasKey(false);
    setTestStatus(null);
  };

  return (
    <div className="min-h-screen bg-cream text-ink">

      {/* ── Nav ── */}
      <nav className="border-b-4 border-ink bg-yellow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-6 w-6" strokeWidth={3} />
            <span className="font-syne font-extrabold text-xl tracking-tight">ZeroPrompt</span>
          </Link>
          <Link href="/app">
            <Button variant="invert" size="sm">Launch App</Button>
          </Link>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="max-w-2xl mx-auto px-6 py-14 space-y-8">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
        >
          <span className="font-dm-mono text-xs uppercase tracking-widest text-ink/40 block mb-2">
            Configuration
          </span>
          <h1 className="font-syne font-extrabold text-5xl md:text-6xl leading-tight tracking-tight">
            Connect<br />Your AI.
          </h1>
        </motion.div>

        {/* ── API Key card ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.08 }}
        >
          <Card stripe="yellow" className="shadow-brut-xl">
            <CardContent className="p-6 space-y-5">

              {/* Label row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5" strokeWidth={2} />
                  <span className="font-syne font-bold text-xl">Gemini API Key</span>
                </div>
                {hasKey && (
                  <span className="font-dm-mono text-[10px] uppercase tracking-wider bg-lime border-2 border-ink px-2 py-0.5 shadow-brut-sm flex items-center gap-1">
                    <Check className="h-3 w-3" strokeWidth={3} /> Active
                  </span>
                )}
              </div>

              {/* Key input */}
              <div className="relative">
                <input
                  id="apikey"
                  type={show ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => { setApiKey(e.target.value); setTestStatus(null); }}
                  placeholder="AIza…"
                  spellCheck={false}
                  autoComplete="off"
                  className="
                    w-full h-14 bg-cream text-ink px-4 pr-12
                    font-dm-mono text-base tracking-wide placeholder:text-ink/30
                    border-4 border-ink shadow-brut
                    focus:outline-none focus:shadow-brut-lg focus:-translate-x-px focus:-translate-y-px
                    transition-[transform,box-shadow] duration-100 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  "
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink transition-colors"
                  aria-label={show ? "Hide key" : "Show key"}
                >
                  {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Privacy info */}
              <div className="border-l-4 border-ink pl-4 bg-yellow/25 py-3 pr-4">
                <p className="font-dm-mono text-xs text-ink/70 leading-relaxed">
                  Your key is stored only in{" "}
                  <code className="bg-yellow px-1 border border-ink font-bold">localStorage</code>.
                  {" "}It is <strong>never sent to any ZeroPrompt server</strong> — requests go
                  directly from your browser to Google&rsquo;s Generative Language API.
                </p>
              </div>

              {/* Docs link */}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-dm-mono text-xs uppercase tracking-widest text-cobalt border-b-2 border-cobalt hover:bg-cobalt hover:text-white transition-colors px-1 pb-0.5"
              >
                <ExternalLink className="h-3 w-3" />
                Get a free key at Google AI Studio
              </a>

              {/* Test status */}
              <AnimatePresence mode="wait">
                {testStatus && (
                  <ConnectionStatus status={testStatus} message={testMsg} />
                )}
              </AnimatePresence>

              {/* Action row */}
              <div className="flex gap-3 pt-1">
                <motion.button
                  type="button"
                  onClick={handleTest}
                  disabled={!apiKey.trim() || testStatus === "testing"}
                  whileHover={{ x: -2, y: -2, boxShadow: "6px 6px 0px 0px #0A0A0A" }}
                  whileTap={{ x: 2, y: 2, boxShadow: "1px 1px 0px 0px #0A0A0A" }}
                  transition={spring}
                  style={{ boxShadow: "4px 4px 0px 0px #0A0A0A" }}
                  className="
                    h-12 px-5 flex items-center gap-2 shrink-0
                    font-dm-mono text-sm uppercase tracking-wider font-medium
                    bg-cream border-3 border-ink text-ink
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-colors duration-100
                  "
                >
                  {testStatus === "testing"
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Wifi className="h-4 w-4" />
                  }
                  Test Connection
                </motion.button>

                {hasKey && (
                  <motion.button
                    type="button"
                    onClick={handleClear}
                    whileHover={{ x: -2, y: -2, boxShadow: "6px 6px 0px 0px #FF4136" }}
                    whileTap={{ x: 2, y: 2, boxShadow: "1px 1px 0px 0px #FF4136" }}
                    transition={spring}
                    style={{ boxShadow: "4px 4px 0px 0px #0A0A0A" }}
                    className="
                      h-12 w-12 flex items-center justify-center shrink-0
                      font-dm-mono border-3 border-ink bg-cream text-coral
                      hover:bg-coral hover:text-white hover:border-coral
                      transition-colors duration-100
                    "
                    aria-label="Clear saved key"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                )}
              </div>

            </CardContent>
          </Card>
        </motion.div>

        {/* ── Model selector ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.14 }}
          className="space-y-4"
        >
          <div>
            <span className="font-dm-mono text-xs uppercase tracking-widest text-ink/40 block mb-1">
              Step 2
            </span>
            <h2 className="font-syne font-extrabold text-2xl">Choose Model</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border-3 border-ink shadow-brut">
            {MODELS.map((m, i) => (
              <div key={m.id} className={i < MODELS.length - 1 ? "border-b-3 sm:border-b-0 sm:border-r-3 border-ink" : ""}>
                <ModelTile
                  model={m}
                  selected={model === m.id}
                  onSelect={setModel}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Save ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.2 }}
        >
          <SaveButton
            onSave={handleSave}
            disabled={!apiKey.trim()}
            saved={saved}
          />
        </motion.div>

        {/* ── Status summary ── */}
        <AnimatePresence>
          {hasKey && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={spring}
              className="overflow-hidden"
            >
              <div className="border-3 border-ink bg-ink text-cream p-5 shadow-brut flex items-start gap-4">
                <Zap className="h-5 w-5 text-yellow shrink-0 mt-0.5" strokeWidth={3} />
                <div>
                  <p className="font-syne font-bold text-sm mb-1">ZeroPrompt is ready.</p>
                  <p className="font-dm-mono text-xs text-white/50 leading-relaxed">
                    Using <strong className="text-yellow">{model}</strong> · Key ending in{" "}
                    <strong className="text-yellow">…{apiKey.slice(-4)}</strong>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t-4 border-ink bg-ink px-6 py-5 mt-10">
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
