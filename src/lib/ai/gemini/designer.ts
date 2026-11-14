import { postJson } from "../provider/http";
import { modelDesigner, type ModelRequest } from "../provider/model-designer";
import type { TaskDesigner } from "../task-designer";

const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const MAX_OUTPUT_TOKENS = 4000;

interface GenerateContentReply {
  promptFeedback?: { blockReason?: string };
  candidates?: { finishReason?: string; content?: { parts?: { text?: string; thought?: boolean }[] } }[];
}

/** The answer text of a generateContent reply, without thought parts. A blocked or cut-off reply is an error. */
function replyText(body: unknown): string {
  const reply = body as GenerateContentReply;
  const blocked = reply.promptFeedback?.blockReason;
  if (blocked) throw new Error(`Gemini blocked the request (${blocked})`);
  const candidate = reply.candidates?.[0];
  if (candidate?.finishReason && candidate.finishReason !== "STOP") throw new Error(`Gemini stopped early (${candidate.finishReason})`);
  const text = (candidate?.content?.parts ?? [])
    .filter((part) => !part.thought)
    .map((part) => part.text ?? "")
    .join("");
  if (!text) throw new Error("Gemini reply had no text");
  return text;
}

/** Gemini through generateContent, with a JSON response schema. The key goes in a header, never in the URL. */
export function geminiDesigner(apiKey: string, model: string): TaskDesigner {
  return modelDesigner("gemini", async ({ system, prompt, schema }: ModelRequest) => {
    const body = {
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseJsonSchema: schema,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        thinkingConfig: { thinkingLevel: "LOW" },
      },
    };
    const url = `${API_BASE}/${encodeURIComponent(model)}:generateContent`;
    return replyText(await postJson(url, { "x-goog-api-key": apiKey }, body, "Gemini"));
  });
}
