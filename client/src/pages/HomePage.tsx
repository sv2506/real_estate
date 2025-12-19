import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchProperties, type PropertySummary } from "../lib/api";
import { getSession } from "../lib/session";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function HomePage() {
  const navigate = useNavigate();
  const session = useMemo(() => getSession(), []);

  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  const [recentError, setRecentError] = useState<string | null>(null);
  const [propertyById, setPropertyById] = useState<
    Record<string, PropertySummary>
  >({});

  useEffect(() => {
    if (!session) {
      navigate("/", { replace: true });
    }
  }, [navigate, session]);

  useEffect(() => {
    if (!session) return;
    if (session.viewedPropertyIds.length === 0) return;

    let isCancelled = false;

    async function loadRecent() {
      setIsLoadingRecent(true);
      setRecentError(null);
      try {
        const list = await fetchProperties();
        if (isCancelled) return;

        const next: Record<string, PropertySummary> = {};
        for (const p of list) next[p.id] = p;
        setPropertyById(next);
      } catch {
        if (!isCancelled) setRecentError("Failed to load recently viewed");
      } finally {
        if (!isCancelled) setIsLoadingRecent(false);
      }
    }

    loadRecent();
    return () => {
      isCancelled = true;
    };
  }, [session]);

  const welcomeText =
    session?.type === "user"
      ? `Welcome ${session.user.username}`
      : session?.type === "guest"
      ? "Welcome guest"
      : "";

  const viewedIds = session?.viewedPropertyIds ?? [];
  const recentIds = [...viewedIds].reverse();

  return (
    <div className="page">
      <h1 className="pageTitle">Home</h1>
      <p>{welcomeText}</p>

      <h2>Recently viewed</h2>

      {viewedIds.length === 0 ? <p>No properties viewed yet.</p> : null}
      {isLoadingRecent ? <p>Loading…</p> : null}
      {recentError ? <p role="alert">{recentError}</p> : null}

      {viewedIds.length > 0 ? (
        <div className="propertyList">
          {recentIds.map((id) => {
            const p = propertyById[id];
            return (
              <Link
                key={id}
                to={`/properties/${id}`}
                className="propertyCardLink"
              >
                <div className="propertyCard">
                  <div className="propertyImage" aria-hidden="true" />
                  <div className="propertyBody">
                    <div className="propertyPrice">
                      {p ? formatPrice(p.price) : id}
                    </div>
                    {p ? (
                      <>
                        <div className="propertyMeta">
                          <span>
                            <strong>{p.beds}</strong> bd
                          </span>
                          <span className="dot">•</span>
                          <span>
                            <strong>{p.baths}</strong> ba
                          </span>
                          <span className="dot">•</span>
                          <span>
                            <strong>
                              {new Intl.NumberFormat("en-US").format(p.sqft)}
                            </strong>{" "}
                            sqft
                          </span>
                        </div>
                        <div className="propertyAddress">{p.address}</div>
                        <div className="propertyCity">
                          {p.city}, {p.state} {p.zip}
                        </div>
                      </>
                    ) : (
                      <div className="propertyCity">Unknown property</div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
