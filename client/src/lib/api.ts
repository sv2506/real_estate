type LoginResponse = {
  ok: boolean;
  user?: {
    id: string;
    username: string;
  };
};

export type PropertySummary = {
  id: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  address: string;
  city: string;
  state: string;
  zip: string;
  image_url?: string | null;
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

export async function fetchProperties(): Promise<PropertySummary[]> {
  const res = await fetch(`${getApiBaseUrl()}/properties`);
  if (!res.ok) {
    throw new Error("Failed to fetch properties");
  }

  return (await res.json()) as PropertySummary[];
}

export async function fetchProperty(
  propertyId: string
): Promise<PropertySummary> {
  const res = await fetch(`${getApiBaseUrl()}/properties/${propertyId}`);
  if (!res.ok) {
    throw new Error("Failed to fetch property");
  }

  return (await res.json()) as PropertySummary;
}
