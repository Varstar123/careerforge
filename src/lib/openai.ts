import OpenAI from "openai";

/**
 * LLM provider wrapper. The whole app talks to the LLM through this file, so
 * swapping providers only touches here. We support any OpenAI-compatible API:
 *
 * - Groq (free, no card): set GROQ_API_KEY  -> https://api.groq.com/openai/v1
 * - OpenAI: set OPENAI_API_KEY
 *
 * Groq takes priority if both are set. Models default sensibly per provider and
 * can be overridden via LLM_FAST_MODEL / LLM_SMART_MODEL.
 */
const groqKey = process.env.GROQ_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

const usingGroq = !!groqKey;
const apiKey = groqKey || openaiKey;
const baseURL = usingGroq
  ? "https://api.groq.com/openai/v1"
  : process.env.OPENAI_BASE_URL || undefined;

/** True when an LLM API key is configured (either provider). */
export const llmConfigured = !!apiKey;

export const MODELS = {
  /** Faster/cheaper tier — resume parsing, question generation. */
  fast:
    process.env.LLM_FAST_MODEL ??
    (usingGroq ? "llama-3.3-70b-versatile" : "gpt-4o-mini"),
  /** Higher-quality tier — answer evaluation & coaching. */
  smart:
    process.env.LLM_SMART_MODEL ??
    (usingGroq ? "llama-3.3-70b-versatile" : "gpt-4o"),
} as const;

let _client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  assertLLMConfigured();
  if (!_client) {
    _client = new OpenAI({ apiKey, baseURL });
  }
  return _client;
}

export function assertLLMConfigured() {
  if (!apiKey) {
    throw new Error(
      "No LLM API key set. Add GROQ_API_KEY (free) or OPENAI_API_KEY to .env.local to enable AI features.",
    );
  }
}
