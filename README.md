# ZeroPrompt

Turn any document into high-quality AI prompts instantly, powered by Gemini.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Add your Gemini API key**

   Option A — via the app UI (recommended):
   - Run the dev server and navigate to `/settings`
   - Paste your Gemini API key (stored locally in your browser)

   Option B — via environment variable:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local and replace `your_key_here` with your actual key
   ```

   Get a free key at: https://aistudio.google.com/app/apikey

3. **Start the dev server**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/app` | Main tool — upload docs & generate prompts |
| `/settings` | API key configuration |

## Supported File Types

- `.txt` / `.md` — Plain text and Markdown
- `.csv` — Comma-separated values
- `.docx` — Microsoft Word documents

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Lucide React
- react-dropzone
- mammoth (DOCX parsing)
- papaparse (CSV parsing)
- Google Gemini 1.5 Flash
