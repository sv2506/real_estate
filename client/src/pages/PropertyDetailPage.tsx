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

function formatRange(low: number, high: number): string {
  return `${formatDollars(low)} – ${formatDollars(high)}`;
}

export default function PropertyDetailPage() {
  const { propertyId } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [property, setProperty] = useState<PropertySummary | null>(null);

  const [brief, setBrief] = useState<PropertyBrief | null>(null);
  const [briefError, setBriefError] = useState<string | null>(null);

  const [expandedFactLabel, setExpandedFactLabel] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!propertyId) return;

    const id = propertyId;
    addViewedPropertyId(id);

    let isCancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      setBriefError(null);
      setExpandedFactLabel(null);
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

              {brief ? (
                <div className="whatThisMeans" aria-label="What this means">
                  <div className="whatThisMeansTitle">Summary</div>
                  <div className="whatThisMeansBody">
                    {brief.what_this_means}
                  </div>
                </div>
              ) : null}

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

              {brief.risks.length ? (
                <div
                  className="briefCard briefCardAttention"
                  aria-label="Open questions and risks"
                >
                  <h3 className="briefCardTitle">⚠️ Open questions / risks</h3>
                  <ul className="briefBullets">
                    {brief.risks.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="briefGrid">
                <div className="briefCard">
                  <h3 className="briefCardTitle">Quick facts</h3>
                  <dl className="briefFacts">
                    {brief.quick_facts.map((kv) => (
                      <div className="briefFactRow" key={kv.label}>
                        <dt className="briefFactLabel">{kv.label}</dt>
                        <dd className="briefFactValue">
                          {kv.value}
                          <button
                            type="button"
                            className={`briefConfidence briefConfidence_${kv.confidence}`}
                            title="Click to see why"
                            onClick={() =>
                              setExpandedFactLabel((cur) =>
                                cur === kv.label ? null : kv.label
                              )
                            }
                            aria-expanded={expandedFactLabel === kv.label}
                          >
                            {kv.confidence}
                          </button>
                        </dd>

                        {expandedFactLabel === kv.label &&
                        (kv.why.length || kv.context) ? (
                          <div className="briefExplain" role="note">
                            {kv.why.length ? (
                              <ul className="briefExplainList">
                                {kv.why.map((line) => (
                                  <li key={line}>{line}</li>
                                ))}
                              </ul>
                            ) : null}
                            {kv.context ? (
                              <div className="briefExplainContext">
                                {kv.context}
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="briefCard">
                  <h3 className="briefCardTitle">Estimated monthly cost</h3>
                  <div className="briefCostRange">
                    <div className="briefCostRangeLabel">Likely range</div>
                    <div className="briefCostRangeValue">
                      {formatRange(
                        brief.estimated_monthly_total_range.low,
                        brief.estimated_monthly_total_range.high
                      )}
                    </div>
                  </div>

                  <p className="briefNote">
                    Assumptions: {brief.assumptions.down_payment_percent}% down
                    at {brief.assumptions.interest_rate_percent}% for{" "}
                    {brief.assumptions.loan_term_years} years.
                  </p>

                  <div className="briefCostColumns">
                    <div>
                      <div className="briefCostColumnTitle">
                        Fixed (more predictable)
                      </div>
                      <ul className="briefMoneyList">
                        {brief.estimated_monthly_fixed.map((line) => (
                          <li className="briefMoneyRow" key={line.label}>
                            <span>{line.label}</span>
                            <strong>{formatDollars(line.monthly)}</strong>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="briefCostColumnTitle">
                        Variable (can swing)
                      </div>
                      <ul className="briefMoneyList">
                        {brief.estimated_monthly_variable.map((line) => (
                          <li className="briefMoneyRow" key={line.label}>
                            <span>{line.label}</span>
                            <strong>{formatRange(line.low, line.high)}</strong>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
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
                  <div className="briefVerify">
                    {brief.watchouts.map((w) => (
                      <div key={w.item} className="briefVerifyItem">
                        <div className="briefVerifyTitle">{w.item}</div>
                        <div className="briefVerifyWhy">{w.why}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {brief.conflicts.length ? (
                <div className="briefCard briefCardAttention">
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

              <div className="briefCard">
                <h3 className="briefCardTitle">Overall data confidence</h3>
                <div className="briefOverall">
                  <span
                    className={`briefConfidence briefConfidence_${brief.overall_confidence}`}
                    aria-label={`Overall confidence ${brief.overall_confidence}`}
                  >
                    {brief.overall_confidence}
                  </span>
                  <p className="briefNote">{brief.overall_confidence_why}</p>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
