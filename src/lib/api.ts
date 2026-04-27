// Set EXPO_PUBLIC_API_URL in .env (dev) or eas.json production profile env (prod release).
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
if (!apiUrl && process.env.EXPO_PUBLIC_USE_MOCK !== 'true') {
  throw new Error(
    '[Spendly] EXPO_PUBLIC_API_URL is not set. ' +
    'Create a .env file at the project root: EXPO_PUBLIC_API_URL=https://your-ngrok-url.ngrok-free.app'
  );
}
export const API_BASE = apiUrl ?? '';

export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

export interface ApiError {
  status: number;
  message: string;
}

export async function apiFetch<T>(
  path: string,
  token: string,
  options?: RequestInit,
): Promise<T> {
  if (USE_MOCK) {
    const { getMockResponse } = await import('./mockApi');
    return getMockResponse<T>(path, options);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw { status: res.status, message: body.error ?? res.statusText } as ApiError;
  }

  return res.json();
}
