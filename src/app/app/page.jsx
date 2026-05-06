"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { callGemini } from "@/lib/gemini";
import {
  X, Copy, Check, AlertCircle, ArrowRight, RotateCcw, RefreshCw,
} from "lucide-react";

const spring = { type: "spring", stiffness: 400, damping: 18 };

/* ─── Witty loading messages ─────────────────────────────────────────────── */
const LOADING_MSGS = [
  "Reading between the lines…",
  "Bribing the neurons…",
  "Consulting the AI oracle…",
  "Translating bytes to brilliance…",
  "Summoning document spirits…",
  "Thinking really hard…",
  "Untangling the alphabet soup…",
  "Making the magic happen…",
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileInfo(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) return { emoji: "🖼️", label: "Image" };
  if (ext === "pdf")  return { emoji: "📄", label: "PDF" };
  if (ext === "csv")  return { emoji: "📊", label: "CSV" };
  if (ext === "docx") return { emoji: "📝", label: "Word Doc" };
  if (["js", "ts", "jsx", "tsx", "py"].includes(ext)) return { emoji: "💻", label: "Code" };
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
  if (["txt","md","js","ts","jsx","tsx","py","java","go","rs","cpp","c","html","css","json"].includes(ext)) {
    return { type: "text", content: await file.text() };
  }
  if (ext === "csv") {
    const Papa = (await import("papaparse")).default;
    const parsed = Papa.parse(await file.text(), { header: true, skipEmptyLines: true });
    const cols = parsed.meta.fields || [];
    const rows = parsed.data;
    return {
      type: "text",
      content: [
        `CSV — ${rows.length} rows × ${cols.length} columns`,
        `Columns: ${cols.join(", ")}`,
        "",
        "First 15 rows:",
        JSON.stringify(rows.slice(0, 15), null, 2),
      ].join("\n"),
    };
  }
  if (ext === "docx") {
    const mammoth = (await import("mammoth")).default;
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return { type: "text", content: result.value };
  }
  if (ext === "pdf") {
    return { type: "base64", content: await fileToBase64(file), mimeType: "application/pdf" };
  }
  if (["png","jpg","jpeg","webp","gif"].includes(ext)) {
    return { type: "base64", content: await fileToBase64(file), mimeType: file.type || "image/jpeg" };
  }
  return { type: "text", content: await file.text() };
}

/* ─── Error classifier ───────────────────────────────────────────────────── */
function classifyGeminiError(msg) {
  const m = msg.toLowerCase();
  if (m.includes("api_key_invalid") || m.includes("api key not valid") || m.includes("invalid api key"))
    return "Your API key is invalid. Go to Settings to update it.";
  if (m.includes("quota") || m.includes("rate limit") || m.includes("resource_exhausted"))
    return "You've hit the Gemini API rate limit. Wait a moment and try again.";
  if (m.includes("model") && m.includes("not found"))
    return "The selected model isn't available. Go to Settings and switch to Gemini 1.5 Flash.";
  return msg;
}

/* ─── Goal tiles ─────────────────────────────────────────────────────────── */
const GOALS = [
  { emoji: "🔍", label: "Summarize",      desc: "Get the key points fast",             prompt: "Summarize this document concisely. Extract the most important points and present them as clear, numbered key takeaways." },
  { emoji: "📊", label: "Find Patterns",  desc: "Surface trends and anomalies",         prompt: "Analyze this content thoroughly. Identify recurring patterns, trends, and any anomalies or outliers. Be specific." },
  { emoji: "✉️", label: "Draft Email",    desc: "Turn this into a professional email",  prompt: "Transform this content into a well-structured, professional email. Include subject line, greeting, body, and sign-off." },
  { emoji: "📋", label: "Action Items",   desc: "Extract tasks and next steps",          prompt: "Extract all action items, tasks, deadlines, and next steps. Format as a numbered checklist with owners where mentioned." },
  { emoji: "🧠", label: "Explain Simply", desc: "ELI5 this document",                   prompt: "Explain this content in plain, simple language. Assume the reader has no background knowledge. Use analogies where helpful." },
  { emoji: "⚠️", label: "Red Flags",     desc: "Find risks, errors, or issues",         prompt: "Carefully review this content and identify any risks, errors, inconsistencies, gaps, or potential problems. Be specific and direct." },
  { emoji: "💡", label: "Improve It",    desc: "Suggestions to make it better",         prompt: "Provide specific, actionable suggestions to improve this content. Focus on clarity, completeness, and impact." },
  { emoji: "🗂️", label: "Restructure",  desc: "Reorganize and reformat",               prompt: "Reorganize and reformat this content into a clean, logical structure with clear headings, sections, and hierarchy." },
];

/* ─── Inline markdown renderer ───────────────────────────────────────────── */
function renderInline(text, key) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*)/g).map((part, i) => {
    const k = `${key}-${i}`;
    if (/^\*\*[^*]+\*\*$/.test(part))
      return <strong key={k} className="font-bold text-ink">{part.slice(2,-2)}</strong>;
    if (/^`[^`]+`$/.test(part))
      return <code key={k} className="font-dm-mono text-[0.8em] bg-yellow/40 border border-ink/20 px-1 py-0.5">{part.slice(1,-1)}</code>;
    if (/^\*[^*\n]+\*$/.test(part))
      return <em key={k} className="italic">{part.slice(1,-1)}</em>;
    return part;
  });
}

function MarkdownRenderer({ content }) {
  const lines = content.split("\n");
  const elements = [];
  let i = 0;
  let listBuffer = [];
  let listType = null;

  function flushList() {
    if (!listBuffer.length) return;
    const Tag = listType === "ol" ? "ol" : "ul";
    const cls = listType === "ol" ? "list-decimal list-outside ml-5 space-y-1" : "list-disc list-outside ml-5 space-y-1";
    elements.push(
      <Tag key={`list-${i}`} className={cls}>
        {listBuffer.map((item, li) => (
          <li key={li} className="font-dm-mono text-sm text-ink/85 leading-relaxed pl-1">
            {renderInline(item, `li-${i}-${li}`)}
          </li>
        ))}
      </Tag>
    );
    listBuffer = [];
    listType = null;
  }

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      flushList();
      const lang = line.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) { codeLines.push(lines[i]); i++; }
      elements.push(
        <div key={`code-${i}`} className="relative my-3">
          {lang && <span className="absolute top-0 right-0 font-dm-mono text-[10px] uppercase tracking-widest bg-ink text-yellow px-2 py-0.5">{lang}</span>}
          <pre className="font-dm-mono text-xs bg-ink text-lime p-4 border-4 border-ink overflow-x-auto leading-relaxed">{codeLines.join("\n")}</pre>
        </div>
      );
      i++; continue;
    }

    if (/^[-*]{3,}$/.test(line.trim())) {
      flushList();
      elements.push(<hr key={`hr-${i}`} className="border-t-3 border-ink my-4" />);
      i++; continue;
    }

    const h1 = line.match(/^#\s+(.*)/); const h2 = line.match(/^##\s+(.*)/); const h3 = line.match(/^###\s+(.*)/);
    if (h1 || h2 || h3) {
      flushList();
      const text = (h3 || h2 || h1)[1];
      const cls = h3 ? "font-syne font-bold text-base text-ink mt-3 mb-1"
                 : h2 ? "font-syne font-extrabold text-xl text-ink mt-4 mb-1.5"
                 : "font-syne font-extrabold text-2xl text-ink mt-5 mb-2";
      elements.push(<p key={`h-${i}`} className={cls}>{renderInline(text, `h-${i}`)}</p>);
      i++; continue;
    }

    const bullet = line.match(/^[-*]\s+(.*)/);
    if (bullet) {
      if (listType && listType !== "ul") flushList();
      listType = "ul"; listBuffer.push(bullet[1]); i++; continue;
    }

    const numbered = line.match(/^\d+\.\s+(.*)/);
    if (numbered) {
      if (listType && listType !== "ol") flushList();
      listType = "ol"; listBuffer.push(numbered[1]); i++; continue;
    }

    if (line.trim() === "") { flushList(); i++; continue; }

    if (/^\*\*[^*]+\*\*:?$/.test(line.trim())) {
      flushList();
      elements.push(<p key={`b-${i}`} className="font-syne font-bold text-base text-ink mt-3 mb-0.5">{renderInline(line.trim(), `b-${i}`)}</p>);
      i++; continue;
    }

    flushList();
    elements.push(<p key={`p-${i}`} className="font-dm-mono text-sm text-ink/85 leading-relaxed">{renderInline(line, `p-${i}`)}</p>);
    i++;
  }

  flushList();
  return <div className="space-y-1.5">{elements}</div>;
}

/* ─── Skeleton loader ────────────────────────────────────────────────────── */
function LoadingSkeleton({ goal }) {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setMsgIdx((n) => (n + 1) % LOADING_MSGS.length), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={spring}
      className="border-4 border-ink bg-cream shadow-brut-xl"
    >
      <div className="border-b-4 border-ink bg-yellow px-5 py-3 flex items-center gap-3">
        <span className="text-2xl">{goal.emoji}</span>
        <span className="font-syne font-extrabold text-lg">{goal.label}</span>
        <div className="ml-auto flex gap-1">
          {[0,1,2].map((i) => (
            <motion.span key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }} className="w-2 h-2 rounded-full bg-ink block" />
          ))}
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-center py-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={msgIdx}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}
              className="font-dm-mono text-sm text-ink/60 uppercase tracking-widest text-center"
            >
              {LOADING_MSGS[msgIdx]}
            </motion.p>
          </AnimatePresence>
        </div>
        {[85, 70, 92, 55, 78, 40, 88, 60].map((w, i) => (
          <motion.div key={i} animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.1 }}
            style={{ width: `${w}%` }} className={`bg-ink/10 border border-ink/10 ${i === 0 ? "h-5" : "h-3"}`}
          />
        ))}
        <div className="pt-2 space-y-2">
          {[60, 80, 45].map((w, i) => (
            <motion.div key={i} animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1.6, repeat: Infinity, delay: 0.5 + i * 0.15 }}
              style={{ width: `${w}%` }} className="h-3 bg-ink/8 border border-ink/8"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── No API key banner ───────────────────────────────────────────────────── */
function NoKeyBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={spring}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-4 border-ink bg-coral text-white px-4 py-3.5 shadow-brut font-dm-mono text-sm"
    >
      <div className="flex items-start gap-2.5">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <span>No API key set — ZeroPrompt needs a Gemini key to work.</span>
      </div>
      <Link href="/settings" className="shrink-0 self-start sm:self-auto">
        <motion.span
          whileHover={{ x: -2, y: -2 }} whileTap={{ x: 1, y: 1 }} transition={spring}
          className="flex items-center gap-1 bg-white text-ink border-2 border-ink px-3 py-1 text-xs uppercase tracking-wider font-bold hover:bg-yellow transition-colors cursor-pointer"
          style={{ boxShadow: "2px 2px 0px 0px #0A0A0A" }}
        >
          Go to Settings <ArrowRight className="h-3 w-3" />
        </motion.span>
      </Link>
    </motion.div>
  );
}

/* ─── Error card ─────────────────────────────────────────────────────────── */
function ErrorCard({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={spring}
      className="flex items-start gap-3 bg-coral text-white border-4 border-ink shadow-brut p-4 font-dm-mono text-sm"
    >
      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
      <p>{message}</p>
    </motion.div>
  );
}

/* ─── Goal Tile ──────────────────────────────────────────────────────────── */
function GoalTile({ goal, index, selected, onClick }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: index * 0.05 }}
      whileHover={{ x: -3, y: -3, boxShadow: "6px 6px 0px 0px #0A0A0A" }}
      whileTap={{ x: 2, y: 2, boxShadow: "1px 1px 0px 0px #0A0A0A" }}
      onClick={onClick}
      style={{ boxShadow: "4px 4px 0px 0px #0A0A0A" }}
      className={`w-full text-left p-4 sm:p-5 border-4 border-ink transition-colors duration-100 ${selected ? "bg-yellow" : "bg-cream hover:bg-yellow/30"}`}
    >
      <span className="block text-4xl sm:text-5xl mb-2 sm:mb-3 leading-none">{goal.emoji}</span>
      <span className="block font-syne font-extrabold text-base sm:text-lg leading-tight mb-1">{goal.label}</span>
      <span className="block font-dm-mono text-xs text-ink/60 leading-snug">{goal.desc}</span>
    </motion.button>
  );
}

/* ─── Drop Zone ──────────────────────────────────────────────────────────── */
const ACCEPTED_EXTENSIONS = ["PDF", "CSV", "TXT", "DOCX", "JS/TS/PY", "PNG/JPG/WEBP"];

function DropZone({ onFileParsed, onDropError }) {
  const [parsing, setParsing] = useState(false);

  const onDrop = useCallback(async (accepted) => {
    if (!accepted.length) return;
    setParsing(true);
    try {
      const file = accepted[0];
      const parsed = await parseFile(file);
      onFileParsed(file, parsed);
    } finally {
      setParsing(false);
    }
  }, [onFileParsed]);

  const onDropRejected = useCallback((rejections) => {
    const first = rejections[0];
    if (!first) return;
    const code = first.errors[0]?.code;
    if (code === "file-too-large")
      onDropError(`File is too large (max 10 MB). Please compress it or split into smaller parts.`);
    else if (code === "file-invalid-type")
      onDropError(`Unsupported file type. Supported: ${ACCEPTED_EXTENSIONS.join(", ")}.`);
    else
      onDropError(first.errors[0]?.message || "File rejected.");
  }, [onDropError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    multiple: false,
    maxSize: 10 * 1024 * 1024,
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
      animate={isDragActive ? { scale: 1.02, y: -4 } : { scale: 1, y: 0 }}
      transition={spring}
      style={{ boxShadow: isDragActive ? "8px 8px 0px 0px #FFE500, 8px 8px 0px 4px #0A0A0A" : "6px 6px 0px 0px #0A0A0A" }}
      className={`relative w-full min-h-[280px] sm:min-h-[340px] flex flex-col items-center justify-center cursor-pointer select-none border-[4px] border-dashed border-ink transition-colors duration-100 ${isDragActive ? "bg-yellow" : "bg-cream hover:bg-yellow/20"}`}
    >
      <input {...getInputProps()} />
      <AnimatePresence mode="wait">
        {parsing ? (
          <motion.div key="parsing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={spring} className="flex flex-col items-center gap-4">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-4 border-ink border-t-yellow" />
            <p className="font-dm-mono text-sm uppercase tracking-widest text-ink/60">Parsing file…</p>
          </motion.div>
        ) : isDragActive ? (
          <motion.div key="active" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={spring} className="flex flex-col items-center gap-3">
            <span className="text-6xl leading-none">⬇️</span>
            <p className="font-syne font-extrabold text-3xl">Drop it!</p>
          </motion.div>
        ) : (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={spring} className="flex flex-col items-center gap-4 sm:gap-5 text-center px-6 sm:px-8">
            <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} className="text-6xl sm:text-7xl leading-none">
              📂
            </motion.div>
            <div>
              <p className="font-syne font-extrabold text-xl sm:text-2xl mb-2">Drop your file here</p>
              <p className="font-dm-mono text-sm text-ink/50 uppercase tracking-widest">or click to browse</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              {ACCEPTED_EXTENSIONS.map((tag) => (
                <span key={tag} className="font-dm-mono text-[11px] uppercase tracking-wider px-2.5 py-1 border-2 border-ink bg-cream shadow-brut-sm">{tag}</span>
              ))}
            </div>
            <p className="font-dm-mono text-xs text-ink/30 uppercase tracking-wider">Max 10 MB</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── File chip ──────────────────────────────────────────────────────────── */
function FileChip({ file, onRemove }) {
  const info = getFileInfo(file);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={spring}
      className="flex items-center gap-3 border-4 border-ink bg-lime px-4 py-3 shadow-brut"
    >
      <span className="text-2xl leading-none">{info.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-syne font-bold text-sm leading-tight truncate">{file.name}</p>
        <p className="font-dm-mono text-xs text-ink/60 uppercase tracking-wider">{info.label} · {formatBytes(file.size)}</p>
      </div>
      {onRemove && (
        <button onClick={onRemove} className="shrink-0 p-1 hover:text-coral transition-colors" aria-label="Remove file">
          <X className="h-4 w-4" strokeWidth={2.5} />
        </button>
      )}
    </motion.div>
  );
}

/* ─── Result panel ───────────────────────────────────────────────────────── */
function ResultPanel({ file, goal, result, onTryAnotherGoal, onTryAnotherFile }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="border-4 border-ink shadow-brut-xl"
    >
      {/* Sticky header */}
      <div className="sticky top-[57px] z-40 border-b-4 border-ink bg-yellow px-4 py-3">
        {/* Row 1: file + goal info */}
        <div className="flex items-center gap-2 mb-2 min-w-0">
          <span className="text-lg leading-none shrink-0">{getFileInfo(file).emoji}</span>
          <span className="font-dm-mono text-xs text-ink/60 truncate hidden xs:block max-w-[100px] sm:max-w-[180px]">{file.name}</span>
          <span className="font-dm-mono text-ink/30 hidden xs:block">·</span>
          <span className="text-lg leading-none shrink-0">{goal.emoji}</span>
          <span className="font-syne font-extrabold text-base">{goal.label}</span>
        </div>
        {/* Row 2: action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <ActionBtn onClick={copy} icon={copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} label={copied ? "Copied" : "Copy"} hoverClass="hover:bg-ink hover:text-yellow" />
          <ActionBtn onClick={onTryAnotherGoal} icon={<RefreshCw className="h-3 w-3" />} label="Another Goal" hoverClass="hover:bg-cobalt hover:text-white" />
          <ActionBtn onClick={onTryAnotherFile} icon={<RotateCcw className="h-3 w-3" />} label="New File" hoverClass="hover:bg-coral hover:text-white" />
        </div>
      </div>

      {/* Markdown output */}
      <div className="bg-cream p-5 sm:p-8">
        <MarkdownRenderer content={result} />
      </div>
    </motion.div>
  );
}

function ActionBtn({ onClick, icon, label, hoverClass }) {
  return (
    <motion.button
      whileHover={{ x: -1, y: -1 }} whileTap={{ x: 1, y: 1 }} transition={spring}
      onClick={onClick}
      className={`flex items-center gap-1.5 border-3 border-ink bg-cream px-3 py-1.5 font-dm-mono text-xs uppercase tracking-wider transition-colors ${hoverClass}`}
      style={{ boxShadow: "2px 2px 0px 0px #0A0A0A" }}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
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
  const [hasKey, setHasKey] = useState(true);

  useEffect(() => {
    setHasKey(!!localStorage.getItem("zeroprompt_gemini_key"));
  }, []);

  const handleFileParsed = useCallback((f, parsed) => {
    setFile(f); setFileData(parsed); setSelectedGoal(null); setResult(""); setError("");
  }, []);

  const handleDropError = useCallback((msg) => {
    setError(msg);
  }, []);

  const handleRemoveFile = () => { setFile(null); setFileData(null); setSelectedGoal(null); setResult(""); setError(""); };
  const handleTryAnotherGoal = () => { setResult(""); setSelectedGoal(null); setError(""); };
  const handleTryAnotherFile = () => { setFile(null); setFileData(null); setSelectedGoal(null); setResult(""); setError(""); };

  const generate = async () => {
    const apiKey = localStorage.getItem("zeroprompt_gemini_key");
    if (!apiKey) { setHasKey(false); return; }
    if (!fileData || selectedGoal === null) return;

    const model = localStorage.getItem("zeroprompt_model") || "gemini-2.5-flash";
    const goal = GOALS[selectedGoal];

    setLoading(true); setError(""); setResult("");
    try {
      const text = await callGemini(fileData, goal.label, goal.prompt, apiKey, model);
      setResult(text);
    } catch (err) {
      setError(classifyGeminiError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const phase = !file ? "upload" : loading ? "loading" : result ? "result" : "goals";

  return (
    <div className="min-h-screen bg-dot-grid bg-cream text-ink">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-5 sm:space-y-6">

        {/* No API key banner */}
        <AnimatePresence>
          {!hasKey && <NoKeyBanner key="nokey" />}
        </AnimatePresence>

        <AnimatePresence mode="wait">

          {/* ── Upload ── */}
          {phase === "upload" && (
            <motion.div key="upload" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={spring} className="space-y-5">
              <div>
                <h1 className="font-syne font-extrabold text-4xl sm:text-5xl mb-2">Upload a File</h1>
                <p className="font-dm-mono text-sm text-ink/50 uppercase tracking-widest">
                  Step 1 of 2 — Drop anything. We&apos;ll handle the rest.
                </p>
              </div>
              <AnimatePresence>
                {error && <ErrorCard key="err" message={error} />}
              </AnimatePresence>
              <DropZone onFileParsed={handleFileParsed} onDropError={handleDropError} />
            </motion.div>
          )}

          {/* ── Goals ── */}
          {phase === "goals" && (
            <motion.div key="goals" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={spring} className="space-y-6 sm:space-y-8">
              <FileChip file={file} onRemove={handleRemoveFile} />
              <div>
                <h1 className="font-syne font-extrabold text-4xl sm:text-5xl mb-2">Pick a Goal</h1>
                <p className="font-dm-mono text-sm text-ink/50 uppercase tracking-widest">Step 2 of 2 — What do you want to do with this file?</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {GOALS.map((goal, i) => (
                  <GoalTile key={goal.label} goal={goal} index={i} selected={selectedGoal === i} onClick={() => setSelectedGoal(selectedGoal === i ? null : i)} />
                ))}
              </div>

              <AnimatePresence>
                {error && <ErrorCard key="err" message={error} />}
              </AnimatePresence>

              <AnimatePresence>
                {selectedGoal !== null && (
                  <motion.div initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.97 }} transition={spring}>
                    <motion.button
                      whileHover={{ x: -3, y: -3, boxShadow: "8px 8px 0px 0px #0A0A0A" }}
                      whileTap={{ x: 2, y: 2, boxShadow: "1px 1px 0px 0px #0A0A0A" }}
                      transition={spring}
                      onClick={generate}
                      style={{ boxShadow: "5px 5px 0px 0px #0A0A0A" }}
                      className="w-full flex items-center justify-center gap-2 sm:gap-3 border-4 border-ink bg-ink text-yellow font-syne font-extrabold text-xl sm:text-2xl py-5 sm:py-6 px-6 sm:px-10"
                    >
                      <span className="text-2xl sm:text-3xl leading-none">{GOALS[selectedGoal].emoji}</span>
                      <span>{GOALS[selectedGoal].label}</span>
                      <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" strokeWidth={3} />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── Loading ── */}
          {phase === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring} className="space-y-5">
              <FileChip file={file} onRemove={null} />
              <LoadingSkeleton goal={GOALS[selectedGoal]} />
            </motion.div>
          )}

          {/* ── Result ── */}
          {phase === "result" && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={spring}>
              <ResultPanel
                file={file}
                goal={GOALS[selectedGoal]}
                result={result}
                onTryAnotherGoal={handleTryAnotherGoal}
                onTryAnotherFile={handleTryAnotherFile}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
