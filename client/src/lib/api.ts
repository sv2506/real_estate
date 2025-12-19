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

export type BriefConfidence = "high" | "medium" | "low";

export type BriefKV = {
  label: string;
  value: string;
  confidence: BriefConfidence;
};

export type BriefMoneyLine = {
  label: string;
  monthly: number;
};

export type BriefAssumptions = {
  down_payment_percent: number;
  interest_rate_percent: number;
  loan_term_years: number;
};

export type BriefConflict = {
  field: string;
  values: string[];
  note: string;
};

export type BriefSource = {
  name: string;
  last_updated: string;
  reliability: BriefConfidence;
};

export type PropertyBrief = {
  property_id: string;
  title: string;
  summary: string;
  quick_facts: BriefKV[];
  estimated_monthly_costs: BriefMoneyLine[];
  assumptions: BriefAssumptions;
  highlights: string[];
  watchouts: string[];
  conflicts: BriefConflict[];
  sources: BriefSource[];
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

export async function fetchPropertyBrief(
  propertyId: string
): Promise<PropertyBrief> {
  const res = await fetch(`${getApiBaseUrl()}/properties/${propertyId}/brief`);
  if (!res.ok) {
    throw new Error("Failed to fetch property brief");
  }

  return (await res.json()) as PropertyBrief;
}
