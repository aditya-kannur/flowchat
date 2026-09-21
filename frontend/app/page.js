"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const OceanGlobe = dynamic(
  () => import("./components/OceanGlobe"),
  { ssr: false }
);

const ProfileChart = dynamic(
  () => import("./components/ProfileChart"),
  { ssr: false }
);

const API = "http://127.0.0.1:8000";

export default function Home() {
  const [summary, setSummary] = useState(null);
  const [trajectory, setTrajectory] = useState([]);
  const [profile, setProfile] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [activeView, setActiveView] = useState("trajectory");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSummary();
    loadTrajectory();
    loadProfile();
  }, []);

  async function loadSummary() {
    try {
      const response = await fetch(`${API}/summary`);

      if (!response.ok) {
        throw new Error(`Summary API returned ${response.status}`);
      }

      const data = await response.json();

      console.log("[SUMMARY SUCCESS]", data);
      setSummary(data);
    } catch (error) {
      console.error("[SUMMARY ERROR]", error);
    }
  }

  async function loadTrajectory() {
    try {
      const response = await fetch(`${API}/trajectory`);

      if (!response.ok) {
        throw new Error(`Trajectory API returned ${response.status}`);
      }

      const data = await response.json();

      console.log("[TRAJECTORY SUCCESS]", data);
      setTrajectory(data.data || []);
    } catch (error) {
      console.error("[TRAJECTORY ERROR]", error);
    }
  }

  async function loadProfile() {
    try {
      const response = await fetch(`${API}/profile`);

      if (!response.ok) {
        throw new Error(`Profile API returned ${response.status}`);
      }

      const data = await response.json();

      console.log("[PROFILE SUCCESS]", data);
      setProfile(data.data || []);
    } catch (error) {
      console.error("[PROFILE ERROR]", error);
    }
  }

  async function runQuery(text = query) {
    if (!text.trim()) return;

    setQuery(text);
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `${API}/query?q=${encodeURIComponent(text)}`
      );

      if (!response.ok) {
        throw new Error(`Query API returned ${response.status}`);
      }

      const data = await response.json();

      console.log("[QUERY SUCCESS]", data);

      setResult(data);

      const intent = data.parsed_query?.intent;

      if (intent === "SHOW_TRAJECTORY") {
        setActiveView("trajectory");
      } else if (intent === "SHOW_PROFILE") {
        setActiveView("profile");
      } else if (intent === "DETECT_ANOMALY") {
        setActiveView("anomaly");

        const detected = (data.data || []).filter(
          (item) =>
            item.anomaly === true ||
            Math.abs(Number(item.z_score)) >= 2
        );

        setAnomalies(detected);
      }
    } catch (error) {
      console.error("[QUERY ERROR]", error);

      setResult({
        query: text,
        message: "Could not connect to FloatChat backend.",
      });
    } finally {
      setLoading(false);
    }
  }

  function showTrajectory() {
    console.log("[VIEW] Switching to trajectory");
    setActiveView("trajectory");
    setResult(null);
  }

  function showProfile() {
    console.log("[VIEW] Switching to profile");
    setActiveView("profile");
    setResult(null);
  }

  async function showAnomalies() {
    console.log("[VIEW] Switching to anomaly");

    setLoading(true);
    setActiveView("anomaly");
    setResult(null);

    try {
      const response = await fetch(`${API}/anomaly`);

      if (!response.ok) {
        throw new Error(`Anomaly API returned ${response.status}`);
      }

      const data = await response.json();

      console.log("[ANOMALY SUCCESS]", data);

      const detected = (data.data || []).filter(
        (item) =>
          item.anomaly === true ||
          Math.abs(Number(item.z_score)) >= 2
      );

      setAnomalies(detected);
      setResult(data);
    } catch (error) {
      console.error("[ANOMALY ERROR]", error);

      setResult({
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  function selectView(view) {
    if (view === "trajectory") {
      showTrajectory();
    }

    if (view === "profile") {
      showProfile();
    }

    if (view === "anomaly") {
      showAnomalies();
    }
  }

  return (
    <main className="dashboard">

      {/* HEADER */}

      <header className="header">
        <div>
          <div className="logo">
            FLOAT<span>CHAT</span>
          </div>

          <p>ARGO Ocean Intelligence Platform</p>
        </div>

        <div className="status">
          <span></span>
          SYSTEM ONLINE
        </div>
      </header>

      {/* COMPACT LANDING / QUERY AREA */}

      <section className="hero">

        <div className="hero-badge">
          ARGO • OCEANOGRAPHIC INTELLIGENCE
        </div>

        <h1>
          Explore the
          <span>Ocean.</span>
        </h1>

        <p>
          Ask FloatChat about ocean temperature, salinity,
          trajectories and thermal anomalies.
        </p>

        <div className="search">

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                runQuery();
              }
            }}
            placeholder="Ask: Find unusual temperature observations"
          />

          <button
            onClick={() => runQuery()}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>

        </div>

        <div className="example-queries">
          <span>Try:</span>

          <button
            onClick={() =>
              runQuery("Show float trajectories")
            }
          >
            Float trajectories
          </button>

          <button
            onClick={() =>
              runQuery("Show temperature profile")
            }
          >
            Temperature profile
          </button>

          <button
            onClick={() =>
              runQuery(
                "Find unusual temperature observations"
              )
            }
          >
            Detect anomalies
          </button>
        </div>

      </section>

      {/* DATA SNAPSHOT */}

      {summary && (
        <section className="stats">

          <Stat
            title="Observations"
            value={summary.observations}
          />

          <Stat
            title="ARGO Floats"
            value={summary.floats}
          />

          <Stat
            title="Temperature"
            value={`${summary.temperature_min.toFixed(1)} – ${summary.temperature_max.toFixed(1)} °C`}
          />

          <Stat
            title="Salinity"
            value={`${summary.salinity_min.toFixed(2)} – ${summary.salinity_max.toFixed(2)}`}
          />

        </section>
      )}

      <div className="data-status">
        <span className="status-dot"></span>
        ARGO dataset connected · {summary?.observations || 0} observations
      </div>

      {/* ANALYSIS DASHBOARD */}

      <section className="analysis">

        <div className="analysis-heading">

          <div>
            <div className="label">ANALYSIS WORKSPACE</div>

            <h2>Ocean Observation Explorer</h2>

            <p>
              Explore spatial trajectories, depth profiles and
              statistically unusual temperature observations.
            </p>
          </div>

          <div className="method-compact">
            <span>ANOMALY METHOD</span>
            <strong>Z-score · |z| ≥ 2</strong>
          </div>

        </div>

        {/* TABS */}

        <div className="view-tabs">

          <button
            className={
              activeView === "trajectory"
                ? "active"
                : ""
            }
            onClick={() => selectView("trajectory")}
          >
            <span className="tab-icon">◎</span>
            <span>
              <strong>Trajectory</strong>
              <small>Where floats moved</small>
            </span>
          </button>

          <button
            className={
              activeView === "profile"
                ? "active"
                : ""
            }
            onClick={() => selectView("profile")}
          >
            <span className="tab-icon">⌁</span>
            <span>
              <strong>Depth Profile</strong>
              <small>Temperature vs depth</small>
            </span>
          </button>

          <button
            className={
              activeView === "anomaly"
                ? "active"
                : ""
            }
            onClick={() => selectView("anomaly")}
          >
            <span className="tab-icon">△</span>
            <span>
              <strong>Anomalies</strong>
              <small>Unusual temperatures</small>
            </span>
          </button>

        </div>

        {/* WORKSPACE */}

        <div className="workspace">

          <div className="workspace-header">

            <div>
              <div className="label">
                {activeView === "trajectory" &&
                  "SPATIOTEMPORAL VIEW"}

                {activeView === "profile" &&
                  "SCIENTIFIC PROFILE"}

                {activeView === "anomaly" &&
                  "THERMAL ANALYSIS"}
              </div>

              <h2>
                {activeView === "trajectory" &&
                  "Float Trajectories"}

                {activeView === "profile" &&
                  "Temperature Depth Profile"}

                {activeView === "anomaly" &&
                  "Temperature Anomalies"}
              </h2>
            </div>

            <div className="view-count">

              {activeView === "trajectory" &&
                `${trajectory.length} observations`}

              {activeView === "profile" &&
                `${profile.length} measurements`}

              {activeView === "anomaly" &&
                result?.anomaly_count !== undefined &&
                `${result.anomaly_count} anomalies`}

            </div>

          </div>

          <div className="visualization">

            {activeView === "trajectory" && (
              <div className="visual-panel">

                <div className="panel-explanation">

                  <div>
                    <strong>
                      Float movement across the observation region
                    </strong>

                    <p>
                      Each point represents an ARGO observation.
                      The connected path shows how the float's
                      recorded position changes over time.
                    </p>
                  </div>

                  <div className="legend">

                    <span>
                      <i className="legend-dot"></i>
                      Observation
                    </span>

                    <span>
                      <i className="legend-anomaly"></i>
                      Anomaly
                    </span>

                  </div>

                </div>

                <OceanGlobe
                  data={trajectory}
                  anomalies={anomalies}
                />

              </div>
            )}

            {activeView === "profile" && (
              <div className="visual-panel">

                <div className="panel-explanation">

                  <div>
                    <strong>
                      How temperature changes with depth
                    </strong>

                    <p>
                      The horizontal axis shows temperature in °C.
                      The vertical axis shows pressure depth in dbar.
                      Moving downward represents deeper water.
                    </p>
                  </div>

                  <div className="profile-note">
                    ARGO profile observations
                  </div>

                </div>

                <ProfileChart data={profile} />

              </div>
            )}

            {activeView === "anomaly" && (
              <div className="visual-panel">

                <div className="panel-explanation">

                  <div>
                    <strong>
                      Statistically unusual temperature observations
                    </strong>

                    <p>
                      Observations with an absolute z-score of at
                      least 2 are flagged for investigation. These
                      are temperature anomalies, not automatically
                      classified marine heatwaves.
                    </p>
                  </div>

                  <div className="profile-note">
                    |z| ≥ 2
                  </div>

                </div>

                <AnomalyPanel result={result} />

              </div>
            )}

          </div>

        </div>

      </section>

      {/* QUERY RESULT */}

      {result &&
        activeView !== "anomaly" &&
        !result.error && (
          <section className="query-result">

            <div className="result-title">

              <div>
                <div className="label">
                  SEMANTIC QUERY
                </div>

                <h3>
                  {result.query ||
                    result.parsed_query?.original_query}
                </h3>
              </div>

              {result.parsed_query && (
                <span className="intent">
                  {result.parsed_query.intent}
                </span>
              )}

            </div>

          </section>
        )}

    </main>
  );
}

function Stat({ title, value }) {
  return (
    <div className="stat">
      <p>{title}</p>
      <strong>{value}</strong>
    </div>
  );
}

function AnomalyPanel({ result }) {

  if (!result) {
    return (
      <div className="empty-state">
        <div className="loader"></div>
        <p>Running temperature anomaly analysis...</p>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="empty-state">
        <p>Analysis error: {result.error}</p>
      </div>
    );
  }

  if (result.message) {
    return (
      <div className="empty-state">
        <p>{result.message}</p>
      </div>
    );
  }

  return (
    <div>

      <div className="anomaly-summary">

        <div className="anomaly-number">
          <strong>{result.anomaly_count}</strong>
          <span>anomalies detected</span>
        </div>

        <div className="method">
          <span>METHOD</span>
          <strong>Temperature z-score</strong>
          <small>
            Threshold: ±{result.threshold}
          </small>
        </div>

        <div className="method">
          <span>MEAN TEMPERATURE</span>
          <strong>
            {Number(result.mean_temperature).toFixed(2)} °C
          </strong>
        </div>

        <div className="method">
          <span>STANDARD DEVIATION</span>
          <strong>
            {Number(result.standard_deviation).toFixed(2)} °C
          </strong>
        </div>

      </div>

      {result.data?.length > 0 ? (

        <div className="anomaly-table">

          <div className="table-head">
            <span>Date</span>
            <span>Latitude</span>
            <span>Longitude</span>
            <span>Depth</span>
            <span>Temperature</span>
            <span>Z-score</span>
          </div>

          {result.data.slice(0, 20).map((item, index) => (
            <div
              className="table-row"
              key={`${item.TIME}-${index}`}
            >

              <span>
                {item.TIME
                  ? new Date(item.TIME).toLocaleDateString()
                  : "—"}
              </span>

              <span>
                {Number(item.LATITUDE).toFixed(2)}°
              </span>

              <span>
                {Number(item.LONGITUDE).toFixed(2)}°
              </span>

              <span>
                {Number(item.PRES).toFixed(1)} dbar
              </span>

              <span className="temperature">
                {Number(item.TEMP).toFixed(2)} °C
              </span>

              <span className="zscore">
                {Number(item.z_score).toFixed(2)}
              </span>

            </div>
          ))}

        </div>

      ) : (

        <div className="empty-state">
          No anomalous observations were detected.
        </div>

      )}

    </div>
  );
}