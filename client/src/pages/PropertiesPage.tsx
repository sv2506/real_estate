import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProperties, type PropertySummary } from "../lib/api";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export default function PropertiesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [properties, setProperties] = useState<PropertySummary[]>([]);

  useEffect(() => {
    let isCancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchProperties();
        if (!isCancelled) setProperties(data);
      } catch {
        if (!isCancelled) setError("Failed to load properties");
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      isCancelled = true;
    };
  }, []);

  const content = useMemo(() => {
    if (isLoading) return <p>Loading…</p>;
    if (error) return <p role="alert">{error}</p>;
    if (properties.length === 0) return <p>No properties found.</p>;

    return (
      <div className="propertyList">
        {properties.map((p) => (
          <Link
            key={p.id}
            to={`/properties/${p.id}`}
            className="propertyCardLink"
          >
            <div className="propertyCard">
              <div className="propertyImage" aria-hidden="true" />
              <div className="propertyBody">
                <div className="propertyPrice">{formatPrice(p.price)}</div>
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
                    <strong>{formatNumber(p.sqft)}</strong> sqft
                  </span>
                </div>
                <div className="propertyAddress">{p.address}</div>
                <div className="propertyCity">
                  {p.city}, {p.state} {p.zip}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }, [error, isLoading, properties]);

  return (
    <div className="page">
      <h1 className="pageTitle">Properties</h1>
      {content}
    </div>
  );
}
