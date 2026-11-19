const TRACKING_PARAMS = [/^utm_/i, /^epik$/i, /^fbclid$/i, /^gclid$/i, /^igsh$/i, /^mc_(cid|eid)$/i];

/** Removes tracking query params (utm_*, epik, fbclid...) so we store a clean source URL. */
export function cleanUrl(raw: string): string {
  const url = new URL(raw.trim());
  // Copy the keys first: deleting while iterating the live iterator skips entries.
  // oxlint-disable-next-line unicorn/no-useless-spread
  for (const key of [...url.searchParams.keys()]) {
    if (TRACKING_PARAMS.some((re) => re.test(key))) url.searchParams.delete(key);
  }
  url.hash = '';
  return url.toString();
}

/** Hosts we can't fetch without a login — the user must paste the caption or upload a screenshot. */
const LOGIN_WALLED_HOSTS = ['instagram.com', 'facebook.com', 'tiktok.com'];

export function isLoginWalled(url: string): boolean {
  const host = new URL(url).hostname.replace(/^www\./, '');
  return LOGIN_WALLED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
}
