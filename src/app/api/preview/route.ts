import { z } from "zod";
import { LIMITS } from "@/lib/http/limits";
import { handle, readBody } from "@/lib/http/respond";
import { previewWork } from "@/lib/service/preview";

/** The same fields and limits a submission takes for its text. Nothing here is stored. */
const previewRequest = z.object({
  answer: z.string().max(LIMITS.answer),
  explain: z
    .array(z.object({ question: z.string().max(600), answer: z.string().max(LIMITS.explain) }))
    .max(4)
    .default([]),
  name: z.string().max(LIMITS.name).default(""),
  contact: z.string().max(LIMITS.contact).default(""),
});

/** What the company would read: the blind text and how many details were hidden, before the person sends. */
export async function POST(request: Request) {
  return handle(async () => previewWork(await readBody(request, previewRequest)));
}
