export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function normalizeURL(url: string): string {
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
}

export function extractDomain(url: string): string {
  try {
    const normalized = normalizeURL(url);
    const urlObj = new URL(normalized);
    return urlObj.hostname;
  } catch {
    return url;
  }
}
