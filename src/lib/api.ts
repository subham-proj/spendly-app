// Central API base URL — update for production deployment
export const API_BASE = 'https://ebaf-49-205-200-47.ngrok-free.app';

export interface ApiError {
  status: number;
  message: string;
}

export async function apiFetch<T>(
  path: string,
  token: string,
  options?: RequestInit,
): Promise<T> {
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
