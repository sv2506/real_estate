type LoginResponse = {
  ok: boolean;
  user?: {
    id: string;
    username: string;
  };
};

function getApiBaseUrl(): string {
  return (import.meta as any).env?.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
}

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    return { ok: false };
  }

  return (await res.json()) as LoginResponse;
}
