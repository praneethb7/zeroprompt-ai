"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";

export default function Navbar({ actions }) {
  const [hasKey, setHasKey] = useState(null); // null = unknown (SSR safe)

  useEffect(() => {
    setHasKey(!!localStorage.getItem("zeroprompt_gemini_key"));

    // Refresh dot when localStorage changes (e.g. user saves from settings)
    const handler = () => setHasKey(!!localStorage.getItem("zeroprompt_gemini_key"));
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return (
    <nav className="border-b-4 border-ink bg-cream sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <motion.span
            whileHover={{ rotate: [0, -15, 15, 0] }}
            transition={{ duration: 0.4 }}
            className="text-xl leading-none select-none"
          >
            ⚡
          </motion.span>
          <span className="font-syne font-extrabold text-lg sm:text-xl tracking-tight">
            ZeroPrompt
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {actions}

          <Link
            href="/settings"
            className="flex items-center gap-2 font-dm-mono text-xs uppercase tracking-wider border-3 border-ink bg-cream px-3 py-2 shadow-brut-sm hover:bg-ink hover:text-yellow transition-colors group"
            style={{ boxShadow: "2px 2px 0px 0px #0A0A0A" }}
          >
            <Settings className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
            <span className="hidden sm:inline">Settings</span>

            {/* API key status dot */}
            <span
              className={`
                w-2 h-2 rounded-full border border-ink/30 shrink-0 transition-colors duration-300
                ${hasKey === null ? "bg-ink/20" : hasKey ? "bg-lime shadow-[0_0_4px_#39FF14]" : "bg-coral shadow-[0_0_4px_#FF4136]"}
              `}
              title={hasKey ? "API key connected" : "No API key set"}
            />
          </Link>
        </div>

      </div>
    </nav>
  );
}
