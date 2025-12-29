export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiEnvelope<T> =
  | { data: T; error: null }
  | { data: null; error: ApiError };

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

export function kycUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const prefix = "/kyc";

  if (baseUrl) {
    return `${normalizeBaseUrl(baseUrl)}${prefix}${normalizedPath}`;
  }

  return `${prefix}${normalizedPath}`;
}

export async function kycRequest<T>(
  path: string,
  init: RequestInit,
  fallbackMessage: string
): Promise<T> {
  const response = await fetch(kycUrl(path), init);

  const envelope: ApiEnvelope<T> | null = await response
    .json()
    .catch(() => null);

  if (!response.ok || envelope?.error) {
    throw new Error(envelope?.error?.message || fallbackMessage);
  }

  if (!envelope || envelope.data === null) {
    throw new Error(fallbackMessage);
  }

  return envelope.data;
}

