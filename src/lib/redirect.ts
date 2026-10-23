/** Only allow app-local redirects. Avoid protocol-relative URLs and backslashes. */
export function safeNext(value: string | null | undefined, fallback = '/app') {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\') || /[\r\n]/.test(value)) return fallback;
  return value;
}
