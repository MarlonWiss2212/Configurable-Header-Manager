import type { Rule } from '../types';

const VALID_OPS = new Set<string>(['set', 'remove', 'append']);
const VALID_TYPES = new Set<string>(['request', 'response']);

interface RulesFile {
  rules?: unknown[];
}

function parseRulesFile(data: RulesFile): Rule[] {
  if (!Array.isArray(data?.rules)) {
    throw new Error('Expected a JSON object with a "rules" array.');
  }

  return (data.rules as Record<string, unknown>[])
    .filter((r) => r && typeof r.headerName === 'string' && (r.headerName as string).trim())
    .map((r, i) => ({
      id: i + 1,
      enabled: r.enabled !== false,
      urlPattern: String(r.urlPattern ?? '*'),
      type: VALID_TYPES.has(r.type as string) ? (r.type as Rule['type']) : 'request',
      operation: VALID_OPS.has(r.operation as string) ? (r.operation as Rule['operation']) : 'set',
      headerName: (r.headerName as string).trim(),
      headerValue: String(r.headerValue ?? ''),
    }));
}

export function setTextareaContent(textarea: HTMLTextAreaElement, rules: Rule[]): void {
  textarea.value = JSON.stringify({ rules }, null, 2);
}

/** Parse and validate the JSON textarea content. Throws a user-friendly Error on failure. */
export function parseTextarea(textarea: HTMLTextAreaElement): Rule[] {
  let parsed: RulesFile;
  try {
    parsed = JSON.parse(textarea.value.trim()) as RulesFile;
  } catch {
    throw new Error('Invalid JSON — check the format and try again.');
  }
  return parseRulesFile(parsed);
}

/**
 * Fetch a rules JSON file from a URL.
 * The server must respond with CORS headers (Access-Control-Allow-Origin: *).
 */
export async function fetchFromUrl(url: string): Promise<Rule[]> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Invalid URL — use the full address including https://');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only http:// and https:// URLs are supported.');
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Server returned ${res.status} ${res.statusText}`);

  const data = (await res.json()) as RulesFile;
  return parseRulesFile(data);
}

export function downloadJson(rules: Rule[]): void {
  const text = JSON.stringify({ rules }, null, 2);
  const blob = new Blob([text], { type: 'application/json' });
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = 'header-manager-rules.json';
  a.click();
  URL.revokeObjectURL(blobUrl);
}
