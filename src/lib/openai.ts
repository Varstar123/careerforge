import OpenAI from "openai";

/**
 * LLM provider wrapper. The whole app talks to the LLM through this file, so
 * swapping providers only touches here. We support any OpenAI-compatible API:
 *
 * - Groq: set GROQ_API_KEY -> https://api.groq.com/openai/v1
 * - OpenAI: set OPENAI_API_KEY
 *
 * Groq takes priority by default. An explicit custom endpoint takes precedence.
 * Models can be overridden via LLM_FAST_MODEL / LLM_SMART_MODEL.
 */
const groqKey = process.env.GROQ_API_KEY?.trim();
const openaiKey = process.env.OPENAI_API_KEY?.trim();
const explicitBaseURL = process.env.OPENAI_BASE_URL?.trim();

// Honor an explicit OpenAI-compatible endpoint so its key and URL stay paired.
const usingGroq = !!groqKey && !explicitBaseURL;
const apiKey = explicitBaseURL ? openaiKey || groqKey : groqKey || openaiKey;
const baseURL = usingGroq
  ? "https://api.groq.com/openai/v1"
  : explicitBaseURL || undefined;

/** True when an LLM API key is configured (either provider). */
export const llmConfigured = !!apiKey;

export const MODELS = {
  /** Faster/cheaper tier — resume parsing, question generation. */
  fast:
    process.env.LLM_FAST_MODEL ??
    (usingGroq ? "qwen/qwen3.8-27b" : "gpt-4o-mini"),
  /** Higher-quality tier — answer evaluation & coaching. */
  smart:
    process.env.LLM_SMART_MODEL ??
    (usingGroq ? "qwen/qwen3.8-27b" : "gpt-4o"),
} as const;

let _client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  assertLLMConfigured();
  if (!_client) {
    _client = new OpenAI({
      apiKey,
      baseURL,
      // Auto-retry transient failures (429 rate limits, 5xx) before surfacing.
      maxRetries: 3,
      // Fail before the serverless function times out so we return a clean error.
      timeout: 45_000,
    });
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

export function getLLMProvider() {
  if (usingGroq) return "Groq";
  if (explicitBaseURL) return "custom OpenAI-compatible";
  return "OpenAI";
}
