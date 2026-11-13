const PRACTICE_ID_PATTERN = /^[1-9]\d*$/;
const PRACTICE_MARKDOWN_PATTERN = /^([1-9]\d*)\.md$/;
const PRACTICE_ORIGIN = "https://live.freewithtech.com";
const PRACTICE_UTM = "utm_source=fwt.wtf&utm_medium=shortlink";

export function parsePracticePath(
  value: string
): { id: string; filename: string } | null {
  const markdownMatch = value.match(PRACTICE_MARKDOWN_PATTERN);
  if (markdownMatch) {
    const id = markdownMatch[1];
    return { id, filename: `${id}.md` };
  }

  if (PRACTICE_ID_PATTERN.test(value)) {
    return { id: value, filename: value };
  }

  return null;
}

export function getPracticeDestination(
  pathSegment: string,
  locale?: "sk"
): string | null {
  const parsed = parsePracticePath(pathSegment);
  if (!parsed) {
    return null;
  }

  const localePrefix = locale === "sk" ? "/sk" : "";
  return `${PRACTICE_ORIGIN}${localePrefix}/practices/${parsed.filename}?${PRACTICE_UTM}`;
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
