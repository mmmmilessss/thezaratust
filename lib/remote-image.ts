const MAX_REMOTE_IMAGE_BYTES = 20 * 1024 * 1024;
const REMOTE_FETCH_TIMEOUT_MS = 10_000;

type FetchRemoteImageOptions = {
  allowedHost: (hostname: string) => boolean;
  revalidate?: number;
};

export async function fetchRemoteImage(
  urlString: string,
  { allowedHost, revalidate }: FetchRemoteImageOptions,
) {
  const url = new URL(urlString);

  if (url.protocol !== "https:" || !allowedHost(url.hostname)) {
    throw new Error("Remote image host is not allowed");
  }

  const response = await fetch(url, {
    signal: AbortSignal.timeout(REMOTE_FETCH_TIMEOUT_MS),
    ...(revalidate ? { next: { revalidate } } : { cache: "no-store" as const }),
  });

  if (!response.ok) {
    throw new Error("Remote image request failed");
  }

  const contentType = response.headers.get("content-type")?.split(";", 1)[0] ?? "";
  if (!contentType.startsWith("image/") || contentType === "image/svg+xml") {
    throw new Error("Remote response is not a supported raster image");
  }

  const declaredLength = Number(response.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_REMOTE_IMAGE_BYTES) {
    throw new Error("Remote image is too large");
  }

  if (!response.body) {
    throw new Error("Remote image body is missing");
  }

  const reader = response.body.getReader();
  const chunks: Buffer[] = [];
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    receivedBytes += value.byteLength;
    if (receivedBytes > MAX_REMOTE_IMAGE_BYTES) {
      await reader.cancel();
      throw new Error("Remote image is too large");
    }
    chunks.push(Buffer.from(value));
  }

  const buffer = Buffer.concat(chunks, receivedBytes);

  return { buffer, contentType };
}
