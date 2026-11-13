const PRACTICE_ID_PATTERN = /^[1-9]\d*$/;
const PRACTICE_ORIGIN = "https://live.freewithtech.com";
const PRACTICE_UTM = "utm_source=fwt.wtf&utm_medium=shortlink";

export function isPracticeId(value: string): boolean {
  return PRACTICE_ID_PATTERN.test(value);
}

export function getPracticeDestination(
  id: string,
  locale?: "sk"
): string | null {
  if (!isPracticeId(id)) {
    return null;
  }

  const localePrefix = locale === "sk" ? "/sk" : "";
  return `${PRACTICE_ORIGIN}${localePrefix}/practices/${id}?${PRACTICE_UTM}`;
}

export function resolveSlugRedirect(
  slug: string,
  redirects: Record<string, string>
): { destination: string; permanent: boolean } | null {
  if (Object.prototype.hasOwnProperty.call(redirects, slug)) {
    return { destination: redirects[slug], permanent: false };
  }

  const destination = getPracticeDestination(slug);
  if (!destination) {
    return null;
  }

  return { destination, permanent: true };
}
