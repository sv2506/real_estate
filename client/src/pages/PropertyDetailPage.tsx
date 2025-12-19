import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  fetchProperty,
  fetchPropertyBrief,
  type PropertyBrief,
  type PropertySummary,
} from "../lib/api";
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

function formatDollars(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PropertyDetailPage() {
  const { propertyId } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [property, setProperty] = useState<PropertySummary | null>(null);

  const [brief, setBrief] = useState<PropertyBrief | null>(null);
  const [briefError, setBriefError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) return;

    const id = propertyId;
    addViewedPropertyId(id);

    let isCancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      setBriefError(null);
      try {
        const [propertyData, briefData] = await Promise.all([
          fetchProperty(id),
          fetchPropertyBrief(id),
        ]);
        if (!isCancelled) {
          setProperty(propertyData);
          setBrief(briefData);
        }
      } catch {
        if (!isCancelled) {
          setError("Failed to load property");
          setBriefError("Failed to load property brief");
        }
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
        <div className="propertyDetailStack">
          <div className="propertyDetail">
            <div className="propertyDetailHero">
              {property.image_url ? (
                <img
                  className="propertyHeroImg"
                  src={property.image_url}
                  alt={`${property.address}, ${property.city}`}
                />
              ) : null}
            </div>
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

          {briefError ? <p role="alert">{briefError}</p> : null}

          {brief ? (
            <section className="brief" aria-label="Property brief">
              <div className="briefHeader">
                <h2 className="briefTitle">{brief.title}</h2>
                <p className="briefSummary">{brief.summary}</p>
              </div>

              <div className="briefGrid">
                <div className="briefCard">
                  <h3 className="briefCardTitle">Quick facts</h3>
                  <dl className="briefFacts">
                    {brief.quick_facts.map((kv) => (
                      <div className="briefFactRow" key={kv.label}>
                        <dt className="briefFactLabel">{kv.label}</dt>
                        <dd className="briefFactValue">
                          {kv.value}
                          <span
                            className={`briefConfidence briefConfidence_${kv.confidence}`}
                          >
                            {kv.confidence}
                          </span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="briefCard">
                  <h3 className="briefCardTitle">Estimated monthly costs</h3>
                  <p className="briefNote">
                    Assumes {brief.assumptions.down_payment_percent}% down at{" "}
                    {brief.assumptions.interest_rate_percent}% for{" "}
                    {brief.assumptions.loan_term_years} years.
                  </p>
                  <ul className="briefMoneyList">
                    {brief.estimated_monthly_costs.map((line) => (
                      <li className="briefMoneyRow" key={line.label}>
                        <span>{line.label}</span>
                        <strong>{formatDollars(line.monthly)}</strong>
                      </li>
                    ))}
                    <li className="briefMoneyRow briefMoneyTotal">
                      <span>Total (est.)</span>
                      <strong>
                        {formatDollars(
                          brief.estimated_monthly_costs.reduce(
                            (sum, line) => sum + line.monthly,
                            0
                          )
                        )}
                      </strong>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="briefGrid">
                <div className="briefCard">
                  <h3 className="briefCardTitle">Highlights</h3>
                  <ul className="briefBullets">
                    {brief.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="briefCard">
                  <h3 className="briefCardTitle">Things to verify</h3>
                  <ul className="briefBullets">
                    {brief.watchouts.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {brief.conflicts.length ? (
                <div className="briefCard">
                  <h3 className="briefCardTitle">Conflicts to resolve</h3>
                  <div className="briefConflicts">
                    {brief.conflicts.map((c) => (
                      <div key={c.field} className="briefConflict">
                        <div className="briefConflictField">{c.field}</div>
                        <div className="briefConflictValues">
                          {c.values.map((v) => (
                            <div key={v} className="briefConflictValue">
                              {v}
                            </div>
                          ))}
                        </div>
                        <div className="briefNote">{c.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="briefCard">
                <h3 className="briefCardTitle">Sources</h3>
                <ul className="briefSources">
                  {brief.sources.map((s) => (
                    <li
                      key={`${s.name}:${s.last_updated}`}
                      className="briefSourceRow"
                    >
                      <span className="briefSourceName">{s.name}</span>
                      <span className="briefSourceMeta">
                        Updated {s.last_updated} ·
                        <span
                          className={`briefConfidence briefConfidence_${s.reliability}`}
                        >
                          {s.reliability}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
