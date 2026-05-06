"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Zap, Settings, X, Loader2, Copy, Check, AlertCircle, ArrowRight, RotateCcw,
} from "lucide-react";

const spring = { type: "spring", stiffness: 400, damping: 18 };

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileInfo(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext))
    return { emoji: "🖼️", label: "Image" };
  if (ext === "pdf") return { emoji: "📄", label: "PDF" };
  if (ext === "csv") return { emoji: "📊", label: "CSV" };
  if (ext === "docx") return { emoji: "📝", label: "Word Doc" };
  if (["js", "ts", "jsx", "tsx", "py"].includes(ext))
    return { emoji: "💻", label: "Code" };
  return { emoji: "📃", label: "Text" };
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function parseFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();

  if (["txt", "md", "js", "ts", "jsx", "tsx", "py", "java", "go", "rs", "cpp", "c", "html", "css", "json"].includes(ext)) {
    return { type: "text", content: await file.text() };
  }

  if (ext === "csv") {
    const Papa = (await import("papaparse")).default;
    const text = await file.text();
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
    const cols = parsed.meta.fields || [];
    const rows = parsed.data;
    const summary = [
      `CSV — ${rows.length} rows × ${cols.length} columns`,
      `Columns: ${cols.join(", ")}`,
      "",
      "First 15 rows:",
      JSON.stringify(rows.slice(0, 15), null, 2),
    ].join("\n");
    return { type: "text", content: summary };
  }

  if (ext === "docx") {
    const mammoth = (await import("mammoth")).default;
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return { type: "text", content: result.value };
  }

  if (ext === "pdf") {
    const base64 = await fileToBase64(file);
    return { type: "base64", content: base64, mimeType: "application/pdf" };
  }

  if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) {
    const base64 = await fileToBase64(file);
    return { type: "base64", content: base64, mimeType: file.type || "image/jpeg" };
  }

  return { type: "text", content: await file.text() };
}

/* ─── Goal tiles ─────────────────────────────────────────────────────────── */
const GOALS = [
  {
    emoji: "🔍",
    label: "Summarize",
    desc: "Get the key points fast",
    prompt: "Summarize this document concisely. Extract the most important points and present them as clear, numbered key takeaways.",
  },
  {
    emoji: "📊",
    label: "Find Patterns",
    desc: "Surface trends and anomalies",
    prompt: "Analyze this content thoroughly. Identify recurring patterns, trends, and any anomalies or outliers. Be specific.",
  },
  {
    emoji: "✉️",
    label: "Draft Email",
    desc: "Turn this into a professional email",
    prompt: "Transform this content into a well-structured, professional email. Include subject line, greeting, body, and sign-off.",
  },
  {
    emoji: "📋",
    label: "Action Items",
    desc: "Extract tasks and next steps",
    prompt: "Extract all action items, tasks, deadlines, and next steps from this document. Format as a numbered checklist with owners where mentioned.",
  },
  {
    emoji: "🧠",
    label: "Explain Simply",
    desc: "ELI5 this document",
    prompt: "Explain this content in plain, simple language. Assume the reader has no background knowledge. Use analogies where helpful.",
  },
  {
    emoji: "⚠️",
    label: "Red Flags",
    desc: "Find risks, errors, or issues",
    prompt: "Carefully review this content and identify any risks, errors, inconsistencies, gaps, or potential problems. Be specific and direct.",
  },
  {
    emoji: "💡",
    label: "Improve It",
    desc: "Suggestions to make it better",
    prompt: "Provide specific, actionable suggestions to improve this content. Focus on clarity, completeness, and impact.",
  },
  {
    emoji: "🗂️",
    label: "Restructure",
    desc: "Reorganize and reformat",
    prompt: "Reorganize and reformat this content into a clean, logical structure with clear headings, sections, and hierarchy.",
  },
];

/* ─── Goal Tile ──────────────────────────────────────────────────────────── */
function GoalTile({ goal, index, selected, onClick }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: index * 0.05 }}
      whileHover={{ x: -3, y: -3, boxShadow: "6px 6px 0px 0px #0A0A0A" }}
      whileTap={{ x: 2, y: 2, boxShadow: "1px 1px 0px 0px #0A0A0A" }}
      onClick={onClick}
      style={{
        boxShadow: selected ? "4px 4px 0px 0px #0A0A0A" : "4px 4px 0px 0px #0A0A0A",
      }}
      className={`
        w-full text-left p-5 border-4 border-ink transition-colors duration-100
        ${selected ? "bg-yellow" : "bg-cream hover:bg-yellow/30"}
      `}
    >
      <span className="block text-5xl mb-3 leading-none">{goal.emoji}</span>
      <span className="block font-syne font-extrabold text-lg leading-tight mb-1">
        {goal.label}
      </span>
      <span className="block font-dm-mono text-xs text-ink/60 leading-snug">
        {goal.desc}
      </span>
    </motion.button>
  );
}

/* ─── Drop Zone ──────────────────────────────────────────────────────────── */
function DropZone({ onFileParsed }) {
  const [parsing, setParsing] = useState(false);

  const onDrop = useCallback(
    async (accepted) => {
      if (!accepted.length) return;
      const file = accepted[0];
      setParsing(true);
      try {
        const parsed = await parseFile(file);
        onFileParsed(file, parsed);
      } finally {
        setParsing(false);
      }
    },
    [onFileParsed]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 20 * 1024 * 1024,
    accept: {
      "text/plain": [".txt"],
      "text/markdown": [".md"],
      "text/csv": [".csv"],
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
      "text/javascript": [".js", ".jsx"],
      "application/typescript": [".ts", ".tsx"],
      "text/x-python": [".py"],
    },
  });

  return (
    <motion.div
      {...getRootProps()}
      animate={
        isDragActive
          ? { scale: 1.02, y: -4 }
          : { scale: 1, y: 0 }
      }
      transition={spring}
      style={{
        boxShadow: isDragActive
          ? "8px 8px 0px 0px #FFE500, 8px 8px 0px 4px #0A0A0A"
          : "6px 6px 0px 0px #0A0A0A",
      }}
      className={`
        relative w-full min-h-[340px] flex flex-col items-center justify-center
        cursor-pointer select-none
        border-[4px] border-dashed border-ink
        transition-colors duration-100
        ${isDragActive ? "bg-yellow" : "bg-cream hover:bg-yellow/20"}
      `}
    >
      <input {...getInputProps()} />

      <AnimatePresence mode="wait">
        {parsing ? (
          <motion.div
            key="parsing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={spring}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="h-14 w-14 animate-spin" strokeWidth={1.5} />
            <p className="font-dm-mono text-sm uppercase tracking-widest text-ink/60">
              Parsing file…
            </p>
          </motion.div>
        ) : isDragActive ? (
          <motion.div
            key="active"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={spring}
            className="flex flex-col items-center gap-3"
          >
            <span className="text-7xl leading-none">⬇️</span>
            <p className="font-syne font-extrabold text-3xl">Drop it!</p>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={spring}
            className="flex flex-col items-center gap-5 text-center px-8"
          >
            <div className="relative">
              <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="text-7xl leading-none"
              >
                📂
              </motion.div>
            </div>
            <div>
              <p className="font-syne font-extrabold text-2xl mb-2">
                Drop your file here
              </p>
              <p className="font-dm-mono text-sm text-ink/50 uppercase tracking-widest">
                or click to browse
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              {["PDF", "CSV", "TXT", "DOCX", "JS/TS/PY", "PNG/JPG"].map((tag) => (
                <span
                  key={tag}
                  className="font-dm-mono text-[11px] uppercase tracking-wider px-2.5 py-1 border-2 border-ink bg-cream shadow-brut-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="font-dm-mono text-xs text-ink/30 uppercase tracking-wider">
              Max 20 MB
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── File Preview Chip ───────────────────────────────────────────────────── */
function FileChip({ file, onRemove }) {
  const info = getFileInfo(file);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={spring}
      className="flex items-center gap-3 border-4 border-ink bg-lime px-4 py-3 shadow-brut"
    >
      <span className="text-2xl leading-none">{info.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-syne font-bold text-sm leading-tight truncate">{file.name}</p>
        <p className="font-dm-mono text-xs text-ink/60 uppercase tracking-wider">
          {info.label} &nbsp;·&nbsp; {formatBytes(file.size)}
        </p>
      </div>
      <button
        onClick={onRemove}
        className="shrink-0 p-1 hover:text-coral transition-colors"
        aria-label="Remove file"
      >
        <X className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </motion.div>
  );
}

/* ─── Result Panel ────────────────────────────────────────────────────────── */
function ResultPanel({ goal, result, onReset }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="space-y-4"
    >
      {/* Header bar */}
      <div className="border-4 border-ink bg-yellow shadow-brut flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{goal.emoji}</span>
          <span className="font-syne font-extrabold text-lg">{goal.label}</span>
          <span className="font-dm-mono text-xs text-ink/50 uppercase tracking-wider hidden sm:block">
            — Result
          </span>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ x: -1, y: -1 }}
            whileTap={{ x: 1, y: 1 }}
            transition={spring}
            onClick={copy}
            className="flex items-center gap-1.5 border-3 border-ink bg-cream px-3 py-1.5 shadow-brut-sm font-dm-mono text-xs uppercase tracking-wider hover:bg-ink hover:text-yellow transition-colors"
          >
            {copied ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
          </motion.button>
          <motion.button
            whileHover={{ x: -1, y: -1 }}
            whileTap={{ x: 1, y: 1 }}
            transition={spring}
            onClick={onReset}
            className="flex items-center gap-1.5 border-3 border-ink bg-cream px-3 py-1.5 shadow-brut-sm font-dm-mono text-xs uppercase tracking-wider hover:bg-coral hover:text-white transition-colors"
          >
            <RotateCcw className="h-3 w-3" /> Start Over
          </motion.button>
        </div>
      </div>

      {/* Result body */}
      <div className="border-4 border-ink bg-cream shadow-brut p-6">
        <pre className="font-dm-mono text-sm whitespace-pre-wrap leading-relaxed text-ink/90">
          {result}
        </pre>
      </div>
    </motion.div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function AppPage() {
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileParsed = useCallback((f, parsed) => {
    setFile(f);
    setFileData(parsed);
    setSelectedGoal(null);
    setResult("");
    setError("");
  }, []);

  const handleRemoveFile = () => {
    setFile(null);
    setFileData(null);
    setSelectedGoal(null);
    setResult("");
    setError("");
  };

  const handleReset = () => {
    setFile(null);
    setFileData(null);
    setSelectedGoal(null);
    setResult("");
    setError("");
  };

  const generate = async () => {
    const apiKey = localStorage.getItem("gemini_api_key");
    if (!apiKey) {
      setError("No Gemini API key found. Go to Settings and add your key.");
      return;
    }
    if (!fileData || selectedGoal === null) return;

    setLoading(true);
    setError("");
    setResult("");

    const goal = GOALS[selectedGoal];

    try {
      let parts;

      if (fileData.type === "base64") {
        parts = [
          {
            inline_data: {
              mime_type: fileData.mimeType,
              data: fileData.content,
            },
          },
          { text: goal.prompt },
        ];
      } else {
        const textContent = fileData.content.slice(0, 30000);
        parts = [
          {
            text: `${goal.prompt}\n\n---\nDocument content:\n${textContent}`,
          },
        ];
      }

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts }],
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "Gemini API request failed");
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      setResult(text);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const phase = !file ? "upload" : result ? "result" : "goals";

  return (
    <div className="min-h-screen bg-cream text-ink">
      {/* Nav */}
      <nav className="border-b-4 border-ink px-6 py-3.5 bg-yellow sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-6 w-6" strokeWidth={3} />
            <span className="font-syne font-extrabold text-xl tracking-tight">ZeroPrompt</span>
          </Link>
          <Link href="/settings">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-1.5" />
              Settings
            </Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">

        {/* ── Phase: Upload ── */}
        <AnimatePresence mode="wait">
          {phase === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={spring}
              className="space-y-6"
            >
              {/* Heading */}
              <div>
                <h1 className="font-syne font-extrabold text-5xl mb-2">Upload a File</h1>
                <p className="font-dm-mono text-sm text-ink/50 uppercase tracking-widest">
                  Step 1 of 2 — Drop anything. We&apos;ll handle the rest.
                </p>
              </div>

              <DropZone onFileParsed={handleFileParsed} />
            </motion.div>
          )}

          {/* ── Phase: Goals ── */}
          {phase === "goals" && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={spring}
              className="space-y-8"
            >
              {/* File chip */}
              <FileChip file={file} onRemove={handleRemoveFile} />

              {/* Heading */}
              <div>
                <h1 className="font-syne font-extrabold text-5xl mb-2">Pick a Goal</h1>
                <p className="font-dm-mono text-sm text-ink/50 uppercase tracking-widest">
                  Step 2 of 2 — What do you want to do with this file?
                </p>
              </div>

              {/* Goal grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {GOALS.map((goal, i) => (
                  <GoalTile
                    key={goal.label}
                    goal={goal}
                    index={i}
                    selected={selectedGoal === i}
                    onClick={() => setSelectedGoal(selectedGoal === i ? null : i)}
                  />
                ))}
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={spring}
                    className="flex items-start gap-3 bg-coral text-white border-4 border-ink shadow-brut p-4 font-dm-mono text-sm"
                  >
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <p>{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generate button */}
              <AnimatePresence>
                {selectedGoal !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={spring}
                  >
                    <motion.button
                      whileHover={{ x: -3, y: -3, boxShadow: "8px 8px 0px 0px #0A0A0A" }}
                      whileTap={{ x: 2, y: 2, boxShadow: "1px 1px 0px 0px #0A0A0A" }}
                      transition={spring}
                      onClick={generate}
                      disabled={loading}
                      style={{ boxShadow: "5px 5px 0px 0px #0A0A0A" }}
                      className="
                        w-full flex items-center justify-center gap-3
                        border-4 border-ink bg-ink text-yellow
                        font-syne font-extrabold text-2xl
                        py-6 px-10
                        disabled:opacity-60 disabled:cursor-not-allowed
                        transition-colors
                      "
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-6 w-6 animate-spin" />
                          Generating…
                        </>
                      ) : (
                        <>
                          {GOALS[selectedGoal].emoji}&nbsp; {GOALS[selectedGoal].label}
                          <ArrowRight className="h-6 w-6" strokeWidth={3} />
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── Phase: Result ── */}
          {phase === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={spring}
            >
              <ResultPanel
                goal={GOALS[selectedGoal]}
                result={result}
                onReset={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
