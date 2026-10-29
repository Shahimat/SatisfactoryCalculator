const WIKI = 'https://satisfactory.wiki.gg';

/** wiki.gg rate-limits anonymous clients harder; it asks for an identifying user agent. */
export const USER_AGENT =
  'satisfactory-calculator-icons/0.1 (+https://github.com/Shahimat/SatisfactoryCalculator)';

const BATCH_SIZE = 50;

export type IconSource = { id: string; name: string };

export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

export type Sleep = (ms: number) => Promise<void>;

export const wikiFileName = ({ name }: IconSource): string =>
  `${name.replaceAll(' ', '_')}.png`;

const chunks = <T>(list: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(list.length / size) }, (_, index) =>
    list.slice(index * size, index * size + size),
  );

const normalizeTitle = (file: string): string =>
  `File:${file.replaceAll('_', ' ')}`;

export const politeFetch = async (
  url: string,
  fetchFn: FetchLike,
  sleep: Sleep,
  attempts = 5,
): Promise<Response> => {
  for (let attempt = 1; ; attempt++) {
    const response = await fetchFn(url, {
      headers: { 'User-Agent': USER_AGENT },
    });
    if (response.status !== 429 || attempt === attempts) return response;
    const retryAfter = Number(response.headers.get('retry-after'));
    await sleep(
      (Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 30) * 1000,
    );
  }
};

type ImageInfoResponse = {
  query?: {
    normalized?: { from: string; to: string }[];
    pages?: Record<
      string,
      { title: string; missing?: string; imageinfo?: { thumburl?: string }[] }
    >;
  };
};

/** Resolves wiki thumbnail URLs for icon files; missing files are left out. */
export const resolveThumbUrls = async (
  files: string[],
  width: number,
  fetchFn: FetchLike,
  sleep: Sleep,
): Promise<Map<string, string>> => {
  const urls = new Map<string, string>();
  for (const batch of chunks(files, BATCH_SIZE)) {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      prop: 'imageinfo',
      iiprop: 'url',
      iiurlwidth: String(width),
      titles: batch.map(normalizeTitle).join('|'),
    });
    const response = await politeFetch(
      `${WIKI}/api.php?${params}`,
      fetchFn,
      sleep,
    );
    if (!response.ok) throw new Error(`wiki api: HTTP ${response.status}`);
    const body = (await response.json()) as ImageInfoResponse;
    const byTitle = new Map(
      Object.values(body.query?.pages ?? {}).map((page) => [
        page.title,
        page.imageinfo?.[0]?.thumburl,
      ]),
    );
    for (const file of batch) {
      const url = byTitle.get(normalizeTitle(file));
      if (url) urls.set(file, url);
    }
  }
  return urls;
};
