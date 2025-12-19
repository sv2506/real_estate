export type Session =
  | {
      type: "guest";
      createdAt: string;
      viewedPropertyIds: string[];
    }
  | {
      type: "user";
      createdAt: string;
      user: {
        id: string;
        username: string;
      };
      viewedPropertyIds: string[];
    };

const STORAGE_KEY = "real_estate.session";

export function getSession(): Session | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Session;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function setSession(session: Session): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function addViewedPropertyId(propertyId: string): void {
  const session = getSession();
  if (!session) return;

  if (session.viewedPropertyIds.includes(propertyId)) return;

  const next: Session = {
    ...session,
    viewedPropertyIds: [...session.viewedPropertyIds, propertyId],
  };
  setSession(next);
}
