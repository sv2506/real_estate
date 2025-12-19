import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchProperty, type PropertySummary } from "../lib/api";
import { addViewedPropertyId } from "../lib/session";

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

export default function PropertyDetailPage() {
  const { propertyId } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [property, setProperty] = useState<PropertySummary | null>(null);

  useEffect(() => {
    if (!propertyId) return;

    const id = propertyId;
    addViewedPropertyId(id);

    let isCancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchProperty(id);
        if (!isCancelled) setProperty(data);
      } catch {
        if (!isCancelled) setError("Failed to load property");
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      isCancelled = true;
    };
  }, [propertyId]);

  if (!propertyId) {
    return (
      <div className="page">
        <p role="alert">Missing property id</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="pageHeader">
        <Link to="/properties" className="textLink">
          ← Back to Properties
        </Link>
      </div>

      {isLoading ? <p>Loading…</p> : null}
      {error ? <p role="alert">{error}</p> : null}

      {property ? (
        <div className="propertyDetail">
          <div className="propertyDetailHero" aria-hidden="true" />
          <div className="propertyDetailBody">
            <div className="propertyPrice">{formatPrice(property.price)}</div>
            <div className="propertyMeta">
              <span>
                <strong>{property.beds}</strong> bd
              </span>
              <span className="dot">•</span>
              <span>
                <strong>{property.baths}</strong> ba
              </span>
              <span className="dot">•</span>
              <span>
                <strong>{formatNumber(property.sqft)}</strong> sqft
              </span>
            </div>

            <div className="propertyAddress">{property.address}</div>
            <div className="propertyCity">
              {property.city}, {property.state} {property.zip}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
