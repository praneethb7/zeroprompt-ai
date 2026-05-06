# ZeroPrompt

Upload a file. Pick a goal. Get instant AI analysis — no prompt engineering required.
**No prompts required. Ever.**

---

## Screenshots

> _Add screenshots here — `/app` upload state, goal grid, and result panel._

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + custom neo-brutalist design system |
| Animation | Framer Motion |
| AI | Google Gemini 1.5 Flash / Pro (via REST API) |
| File parsing | mammoth (DOCX), papaparse (CSV), native FileReader (PDF, images) |
| Icons | Lucide React |
| UI primitives | shadcn/ui |
| File drop | react-dropzone |

---

## Setup

```bash
# 1. Clone the repo
git clone https://github.com/your-username/zero-prompt.git
cd zero-prompt

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000), navigate to **Settings**, and paste your Gemini API key. Your key is stored only in `localStorage` — it never leaves your browser.

Get a free key at: https://aistudio.google.com/app/apikey

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/app` | Main tool — upload a file, pick a goal, get AI output |
| `/settings` | API key + model configuration |

## Supported File Types

PDF · DOCX · CSV · TXT · MD · JS · TS · JSX · TSX · PY · PNG · JPG · WEBP

## Goals

Summarize · Find Patterns · Draft Email · Action Items · Explain Simply · Red Flags · Improve It · Restructure
