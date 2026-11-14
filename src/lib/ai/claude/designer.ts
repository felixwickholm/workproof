import { postJson } from "../provider/http";
import { modelDesigner, type ModelRequest } from "../provider/model-designer";
import type { TaskDesigner } from "../task-designer";

const API_URL = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";
const MAX_TOKENS = 2000;

interface MessagesReply {
  content?: { type: string; text?: string }[];
  stop_reason?: string;
}

/** The text of a Messages API reply. A cut-off or refused reply is an error, so the scripted designer answers. */
function replyText(body: unknown): string {
  const reply = body as MessagesReply;
  if (reply.stop_reason === "max_tokens") throw new Error("Claude reply was cut off at the token limit");
  if (reply.stop_reason === "refusal") throw new Error("Claude declined the request");
  const text = reply.content?.find((block) => block.type === "text")?.text;
  if (!text) throw new Error("Claude reply had no text");
  return text;
}

/** Claude through the Messages API, with structured output so the reply is JSON in the task's shape. */
export function claudeDesigner(apiKey: string, model: string): TaskDesigner {
  return modelDesigner("claude", async ({ system, prompt, schema }: ModelRequest) => {
    const body = {
      model,
      max_tokens: MAX_TOKENS,
      system,
      messages: [{ role: "user", content: prompt }],
      output_config: { format: { type: "json_schema", schema } },
    };
    return replyText(await postJson(API_URL, { "x-api-key": apiKey, "anthropic-version": API_VERSION }, body, "Claude"));
  });
}
