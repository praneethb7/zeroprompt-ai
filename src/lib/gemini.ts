const SYSTEM_INSTRUCTION = (goal: string) =>
  `You are a precise, intelligent document analyst.
The user has NOT written a prompt. They selected a goal: ${goal}.
Analyze the provided content and deliver a thorough, structured,
genuinely useful response for that goal. Use markdown formatting.`;

interface TextFile {
  type: "text";
  content: string;
}

interface BinaryFile {
  type: "base64";
  content: string;
  mimeType: string;
}

export type ParsedFile = TextFile | BinaryFile;

export async function callGemini(
  fileData: ParsedFile,
  goalLabel: string,
  goalPrompt: string,
  apiKey: string,
  model = "gemini-2.5-flash"
): Promise<string> {
  let parts: object[];

  if (fileData.type === "base64") {
    parts = [
      { inline_data: { mime_type: fileData.mimeType, data: fileData.content } },
      { text: goalPrompt },
    ];
  } else {
    parts = [{ text: `${goalPrompt}\n\n---\nDocument content:\n${fileData.content.slice(0, 30000)}` }];
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION(goalLabel) }] },
        contents: [{ parts }],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}
