import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  useLocation,
  useParams
} from "react-router-dom";

import {
  loginUser,
  registerUser,
  getStats,
  getInvestigations,
  getInvestigation,
  createInvestigation,
  updateInvestigation,
  deleteInvestigation,
  getLiveAircraft,
  getWeatherData
} from "./api";


// =====================================================
// HELPERS
// =====================================================

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

const isLoggedIn = () => {
  return !!localStorage.getItem("token");
};


// =====================================================
// PROTECTED ROUTE
// =====================================================

function ProtectedRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}


// =====================================================
// LAYOUT
// =====================================================

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const navItems = [
    { path: "/dashboard", icon: "▦", label: "Dashboard" },
    { path: "/investigations", icon: "◈", label: "Investigations" },
    { path: "/investigations/new", icon: "+", label: "New Investigation" },
    { path: "/profile", icon: "◉", label: "Profile" }
  ];

  return (
    <div className="app-shell">

      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">✈</div>

          <div>
            <h2>CONTRAIL</h2>
            <span>COURT</span>
          </div>
        </div>

        <div className="sidebar-label">MAIN MENU</div>

        <nav>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={
                location.pathname === item.path
                  ? "nav-item active"
                  : "nav-item"
              }
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">

          <div className="system-status">
            <span className="status-dot"></span>

            <div>
              <strong>System Online</strong>
              <small>Investigation platform</small>
            </div>
          </div>

          <button className="logout-btn" onClick={logout}>
            ⇥ Logout
          </button>

        </div>

      </aside>


      <main className="main-area">

        <header className="topbar">

          <div>
            <span className="topbar-title">
              Aircraft Trail Investigation System
            </span>
          </div>

          <div className="user-area">

            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="user-info">
              <strong>{user?.name || "User"}</strong>
              <span>{user?.role || "Investigator"}</span>
            </div>

          </div>

        </header>

        <section className="content">
          {children}
        </section>

      </main>

    </div>
  );
}


// =====================================================
// LOGIN
// =====================================================

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser(form);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed. Check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-decoration">
        <div className="orbit orbit-one"></div>
        <div className="orbit orbit-two"></div>
        <div className="plane-symbol">✈</div>
      </div>

      <div className="auth-card">

        <div className="auth-brand">
          <div className="large-brand-icon">✈</div>

          <div>
            <h1>CONTRAIL COURT</h1>
            <p>Aircraft Trail Investigation System</p>
          </div>
        </div>

        <div className="auth-heading">
          <h2>Investigator Login</h2>
          <p>Access the investigation command centre</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={submit}>

          <label>Email Address</label>

          <input
            type="email"
            placeholder="investigator@example.com"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value
              })
            }
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value
              })
            }
            required
          />

          <button
            className="primary-btn full-btn"
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In →"}
          </button>

        </form>

        <div className="auth-footer">
          New investigator?

          <button
            className="link-btn"
            onClick={() => navigate("/register")}
          >
            Create account
          </button>
        </div>

      </div>

    </div>
  );
}


// =====================================================
// REGISTER
// =====================================================

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "investigator"
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      await registerUser(form);

      setMessage(
        "Account created successfully. You can now login."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration failed."
      );
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-brand">
          <div className="large-brand-icon">✈</div>

          <div>
            <h1>CONTRAIL COURT</h1>
            <p>Create investigator account</p>
          </div>
        </div>

        <div className="auth-heading">
          <h2>Register</h2>
          <p>Join the investigation system</p>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        {message && (
          <div className="success-message">{message}</div>
        )}

        <form onSubmit={submit}>

          <label>Full Name</label>

          <input
            value={form.name}
            placeholder="Your name"
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value
              })
            }
            required
          />

          <label>Email</label>

          <input
            type="email"
            value={form.email}
            placeholder="you@example.com"
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value
              })
            }
            required
          />

          <label>Password</label>

          <input
            type="password"
            value={form.password}
            placeholder="Create password"
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value
              })
            }
            required
          />

          <label>Role</label>

          <select
            value={form.role}
            onChange={(e) =>
              setForm({
                ...form,
                role: e.target.value
              })
            }
          >
            <option value="investigator">
              Investigator
            </option>

            <option value="admin">
              Administrator
            </option>
          </select>

          <button className="primary-btn full-btn">
            Create Account
          </button>

        </form>

        <div className="auth-footer">

          Already registered?

          <button
            className="link-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

        </div>

      </div>

    </div>
  );
}


// =====================================================
// DASHBOARD
// =====================================================

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div>

      <div className="page-heading">

        <div>
          <span className="eyebrow">COMMAND CENTRE</span>
          <h1>Investigation Dashboard</h1>
          <p>
            Monitor aircraft trail investigations and risk indicators.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() => navigate("/investigations/new")}
        >
          + New Investigation
        </button>

      </div>


      <div className="stats-grid">

        <StatCard
          icon="◈"
          title="Total Cases"
          value={stats?.total || 0}
          className="blue"
        />

        <StatCard
          icon="▲"
          title="High Risk"
          value={stats?.highRisk || 0}
          className="red"
        />

        <StatCard
          icon="!"
          title="Medium Risk"
          value={stats?.mediumRisk || 0}
          className="orange"
        />

        <StatCard
          icon="✓"
          title="Low Risk"
          value={stats?.lowRisk || 0}
          className="green"
        />

      </div>


      <div className="dashboard-grid">

        <div className="panel">

          <div className="panel-header">
            <div>
              <h3>Investigation Status</h3>
              <span>Current case distribution</span>
            </div>
          </div>

          <div className="status-list">

            <StatusRow
              label="Under Investigation"
              value={stats?.underInvestigation || 0}
              color="blue"
            />

            <StatusRow
              label="Completed"
              value={stats?.completed || 0}
              color="green"
            />

            <StatusRow
              label="Resolved"
              value={stats?.resolved || 0}
              color="purple"
            />

          </div>

        </div>


        <div className="panel">

          <div className="panel-header">

            <div>
              <h3>Recent Investigations</h3>
              <span>Latest cases added to the system</span>
            </div>

            <button
              className="text-btn"
              onClick={() => navigate("/investigations")}
            >
              View all →
            </button>

          </div>

          <div className="recent-list">

            {stats?.recent?.length ? (
              stats.recent.map((item) => (
                <div
                  className="recent-item"
                  key={item._id}
                  onClick={() =>
                    navigate(`/investigations/${item._id}`)
                  }
                >

                  <div className="case-icon">
                    ✈
                  </div>

                  <div className="recent-info">
                    <strong>{item.caseId}</strong>

                    <span>
                      {item.flightNumber} · {item.airline}
                    </span>
                  </div>

                  <RiskBadge level={item.riskLevel} />

                </div>
              ))
            ) : (
              <div className="empty-state">
                No investigations yet.
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}


function StatCard({
  icon,
  title,
  value,
  className
}) {
  return (
    <div className={`stat-card ${className}`}>

      <div className="stat-icon">
        {icon}
      </div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>

    </div>
  );
}


function StatusRow({
  label,
  value,
  color
}) {
  return (
    <div className="status-row">

      <div className="status-label">

        <span className={`status-circle ${color}`}></span>

        {label}

      </div>

      <strong>{value}</strong>

    </div>
  );
}


function RiskBadge({ level }) {
  return (
    <span
      className={`risk-badge ${
        level?.toLowerCase() || "low"
      }`}
    >
      {level || "Low"}
    </span>
  );
}


// =====================================================
// INVESTIGATION LIST
// =====================================================

function Investigations() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState("All");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const result = await getInvestigations();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = data.filter((item) => {

    const query = search.toLowerCase();

    const matchesSearch =
      item.caseId?.toLowerCase().includes(query) ||
      item.flightNumber?.toLowerCase().includes(query) ||
      item.airline?.toLowerCase().includes(query);

    const matchesRisk =
      risk === "All" ||
      item.riskLevel === risk;

    const matchesStatus =
      status === "All" ||
      item.status === status;

    return (
      matchesSearch &&
      matchesRisk &&
      matchesStatus
    );
  });

  if (loading) {
    return <div className="loading">Loading investigations...</div>;
  }

  return (
    <div>

      <div className="page-heading">

        <div>
          <span className="eyebrow">CASE MANAGEMENT</span>
          <h1>Investigations</h1>
          <p>
            Search, review and manage aircraft trail cases.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() => navigate("/investigations/new")}
        >
          + New Case
        </button>

      </div>


      <div className="filter-panel">

        <input
          className="search-input"
          placeholder="Search case ID, flight number or airline..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={risk}
          onChange={(e) =>
            setRisk(e.target.value)
          }
        >
          <option value="All">All Risk Levels</option>
          <option value="High">High Risk</option>
          <option value="Medium">Medium Risk</option>
          <option value="Low">Low Risk</option>
        </select>

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        >
          <option value="All">All Statuses</option>
          <option value="Under Investigation">
            Under Investigation
          </option>
          <option value="Evidence Review">
            Evidence Review
          </option>
          <option value="Completed">
            Completed
          </option>
          <option value="Resolved">
            Resolved
          </option>
        </select>

      </div>


      <div className="panel table-panel">

        <div className="table-header">
          <strong>{filtered.length} Cases</strong>
          <span>Investigation records</span>
        </div>

        {filtered.length ? (

          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>CASE ID</th>
                  <th>FLIGHT</th>
                  <th>ROUTE</th>
                  <th>DATE</th>
                  <th>RISK</th>
                  <th>STATUS</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>

                {filtered.map((item) => (

                  <tr key={item._id}>

                    <td>
                      <strong className="case-id">
                        {item.caseId}
                      </strong>
                    </td>

                    <td>
                      <strong>{item.flightNumber}</strong>
                      <small>{item.airline}</small>
                    </td>

                    <td>
                      {item.origin} → {item.destination}
                    </td>

                    <td>
                      {new Date(
                        item.flightDate
                      ).toLocaleDateString()}
                    </td>

                    <td>
                      <RiskBadge level={item.riskLevel} />
                    </td>

                    <td>
                      <span className="status-badge">
                        {item.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="view-btn"
                        onClick={() =>
                          navigate(
                            `/investigations/${item._id}`
                          )
                        }
                      >
                        View →
                      </button>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        ) : (

          <div className="empty-state large">
            <div className="empty-icon">◈</div>
            <h3>No investigations found</h3>
            <p>
              Try changing your search or create a new case.
            </p>
          </div>

        )}

      </div>

    </div>
  );
}


// =====================================================
// INVESTIGATION FORM
// =====================================================

const inferAirlineFromCallsign = (callsign = "") => {
  const code = String(callsign).trim().toUpperCase().replace(/\s+/g, "");
  if (code.startsWith("AIC") || code.startsWith("AI")) return "AIR INDIA";
  if (code.startsWith("IGO")) return "INDIGO";
  if (code.startsWith("VTI")) return "VISTARA";
  if (code.startsWith("AKJ")) return "AKASA AIR";
  if (code.startsWith("AXB")) return "AIR INDIA EXPRESS";
  return "Live aircraft feed";
};

const createCaseId = () => {
  const year = new Date().getFullYear();
  const suffix = String(Date.now()).slice(-4);
  return `CC-${year}-${suffix}`;
};

const getSavedAircraftData = (data) => {
  const path = String(data?.flightPath || "");
  const read = (regex) => path.match(regex)?.[1]?.trim() || "";
  return {
    icao24: read(/Aircraft ID \(ICAO24\):\s*([^.]*)\./i),
    latitude: read(/Live position:\s*(-?\d+(?:\.\d+)?)\s*,/i),
    longitude: read(/Live position:\s*-?\d+(?:\.\d+)?\s*,\s*(-?\d+(?:\.\d+)?)/i),
    heading: read(/Heading:\s*([^°.]+)(?:°|\.)/i),
    velocity: read(/Speed:\s*([^ ]+)\s*m\/s/i),
    verticalRate: read(/Vertical rate:\s*([^ ]+)\s*m\/s/i),
    originCountry: read(/Origin country:\s*([^.]*)\./i)
  };
};

const emptyForm = {
  caseId: "",
  investigator: "",
  status: "Under Investigation",

  flightNumber: "",
  airline: "",
  origin: "",
  destination: "",
  flightDate: "",
  altitude: "",
  flightDuration: "",
  flightPath: "",

  atmosphericConditions: {
    temperature: "",
    humidity: "",
    pressure: "",
    windSpeed: "",
    cloudCover: ""
  },

  contrailObservation: {
    observed: false,
    type: "",
    persistence: "",
    details: ""
  },

  evidence: {
    description: "",
    imageUrl: "",
    available: false
  },

  findings: "",
  investigationResult: "",
  notes: ""
};


function InvestigationForm() {

  const navigate = useNavigate();
  const { id } = useParams();

  const editing = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Real-data lookup controls
  const [location, setLocation] = useState({
    lat: "",
    lon: ""
  });
  const [fetchingRealData, setFetchingRealData] = useState(false);
  const [realDataMessage, setRealDataMessage] = useState("");
  const [contrailAnalysis, setContrailAnalysis] = useState(null);
  const [liveAircraft, setLiveAircraft] = useState(null);
  const [liveAtmosphere, setLiveAtmosphere] = useState(null);

  useEffect(() => {

    if (editing) {
      loadCase();
    } else {

      const user = getUser();

      setForm({
        ...emptyForm,
        caseId: createCaseId(),
        investigator: user?.name || "",
        flightDate: new Date().toISOString().slice(0, 10)
      });
    }

  }, [id]);


  const loadCase = async () => {

    try {

      const data = await getInvestigation(id);

      setForm({
        ...emptyForm,
        ...data,
        flightDate: data.flightDate
          ? data.flightDate.substring(0, 10)
          : "",

        atmosphericConditions: {
          ...emptyForm.atmosphericConditions,
          ...data.atmosphericConditions
        },

        contrailObservation: {
          ...emptyForm.contrailObservation,
          ...data.contrailObservation
        },

        evidence: {
          ...emptyForm.evidence,
          ...data.evidence
        }
      });

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Could not load case."
      );

    } finally {
      setLoading(false);
    }
  };


  const updateField = (field, value) => {

    setForm({
      ...form,
      [field]: value
    });
  };


  const updateNested = (
    section,
    field,
    value
  ) => {

    setForm({
      ...form,
      [section]: {
        ...form[section],
        [field]: value
      }
    });
  };


  // Convert relative humidity over water to an approximate relative humidity over ice.
  // This is a screening estimate only; it is not a full contrail prediction model.
  const estimateRHi = (temperatureC, relativeHumidity) => {
    const T = Number(temperatureC);
    const RHw = Number(relativeHumidity);

    if (!Number.isFinite(T) || !Number.isFinite(RHw) || T >= 0) {
      return null;
    }

    const iceSaturation =
      6.0612 * Math.exp((18.102 * T) / (249.52 + T));
    const waterSaturation =
      6.1162 * Math.exp((22.577 * T) / (237.78 + T));

    return RHw * (iceSaturation / waterSaturation);
  };

  const analyzeContrailConditions = (data) => {
    const temperature = Number(data?.atmosphericConditions?.temperature);
    const humidity = Number(data?.atmosphericConditions?.humidity);
    const altitude = Number(data?.altitude);
    const rhi = estimateRHi(temperature, humidity);

    const reasons = [];

    if (Number.isFinite(temperature)) {
      reasons.push(
        temperature <= -40
          ? `Very cold upper-air temperature (${temperature.toFixed(1)}°C).`
          : `Temperature is ${temperature.toFixed(1)}°C.`
      );
    }

    if (Number.isFinite(humidity)) {
      reasons.push(`Relative humidity: ${humidity.toFixed(1)}%.`);
    }

    if (rhi !== null) {
      reasons.push(`Estimated RH over ice: ${rhi.toFixed(0)}%.`);
    }

    if (Number.isFinite(altitude) && altitude >= 25000) {
      reasons.push(`Cruising-level altitude: ${Math.round(altitude).toLocaleString()} ft.`);
    }

    let level = "Low";
    let potential = "Low";
    let recommendation =
      "Conditions do not strongly indicate persistent contrail formation. Continue with observational evidence.";

    if (Number.isFinite(temperature) && temperature <= -40 && rhi !== null && rhi >= 100) {
      level = "High";
      potential = "High";
      recommendation =
        "Atmospheric conditions are favorable for persistent contrail formation. Review satellite/visual evidence and flight-path history.";
    } else if (
      Number.isFinite(temperature) &&
      temperature <= -35 &&
      ((rhi !== null && rhi >= 80) || humidity >= 70)
    ) {
      level = "Medium";
      potential = "Moderate";
      recommendation =
        "Conditions may support contrail formation or persistence. Additional observational evidence is recommended.";
    } else if (
      Number.isFinite(temperature) &&
      temperature <= -30 &&
      humidity >= 60
    ) {
      level = "Low";
      potential = "Possible";
      recommendation =
        "Some atmospheric conditions are compatible with contrail formation, but persistence is uncertain.";
    }

    return {
      level,
      potential,
      rhi,
      reasons,
      recommendation,
      summary: `Contrail formation potential: ${potential}. Risk screening level: ${level}.`
    };
  };


  // Fetch real aircraft and atmospheric data
  const fetchRealData = async () => {
    const lat = Number(location.lat);
    const lon = Number(location.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      setRealDataMessage("Enter valid latitude and longitude first.");
      return;
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setRealDataMessage(
        "Latitude must be between -90 and 90 and longitude between -180 and 180."
      );
      return;
    }

    setFetchingRealData(true);
    setRealDataMessage("");
    setError("");

    try {
      const [aircraftResult, weatherResult] = await Promise.allSettled([
        getLiveAircraft(lat, lon, 1),
        getWeatherData(lat, lon)
      ]);

      // Always start from the CURRENT form so manual entries are never lost.
      const nextForm = {
        ...form,
        atmosphericConditions: {
          ...form.atmosphericConditions
        },
        contrailObservation: {
          ...form.contrailObservation
        },
        evidence: {
          ...form.evidence
        }
      };

      const messages = [];

      // -------------------------------------------------
      // 1. AIRCRAFT DATA
      // -------------------------------------------------
      let aircraft = null;

      if (aircraftResult.status === "fulfilled") {
        aircraft = aircraftResult.value?.aircraft?.[0] || null;

        if (aircraft) {
          setLiveAircraft(aircraft);

          const callsign =
            String(aircraft.callsign || "").trim().toUpperCase();

          // OpenSky sometimes has no callsign. Use ICAO24 as a safe
          // fallback so Flight Number is NEVER left blank.
          const liveFlightNumber =
            callsign ||
            (aircraft.icao24
              ? `LIVE-${String(aircraft.icao24).toUpperCase()}`
              : `LIVE-${Math.abs(Math.round(lat * 100))}-${Math.abs(Math.round(lon * 100))}`);

          nextForm.flightNumber = liveFlightNumber;
          nextForm.airline = inferAirlineFromCallsign(callsign);

          // Always fill these basic case/flight fields from the fetch.
          nextForm.flightDate = new Date().toISOString().slice(0, 10);

          if (!nextForm.caseId) {
            nextForm.caseId = createCaseId();
          }

          nextForm.origin =
            aircraft.originCountry ||
            `Live area (${lat.toFixed(4)}, ${lon.toFixed(4)})`;

          // A state-vector feed does NOT know the planned destination.
          // Keep a clear value instead of leaving the field blank.
          nextForm.destination =
            nextForm.destination ||
            "Not available from live state data";

          // Duration is not supplied by OpenSky state vectors.
          // Keep a numeric value so saving the form works correctly.
          if (
            nextForm.flightDuration === "" ||
            nextForm.flightDuration === null ||
            nextForm.flightDuration === undefined
          ) {
            nextForm.flightDuration = 0;
          }

          const altitudeMeters =
            aircraft.barometricAltitude ??
            aircraft.geometricAltitude;

          if (altitudeMeters !== null && altitudeMeters !== undefined) {
            const altitudeFeet = Number(altitudeMeters) * 3.28084;

            if (Number.isFinite(altitudeFeet)) {
              nextForm.altitude = Math.round(altitudeFeet);
            }
          }

          // ALWAYS create a Flight Path value.
          // Even if some live aircraft fields are missing, the fetched
          // latitude/longitude is still useful and visible in the form.
          const aircraftId = aircraft.icao24 || "N/A";
          const originCountry = aircraft.originCountry || "N/A";
          const liveLat = Number.isFinite(Number(aircraft.latitude))
            ? Number(aircraft.latitude).toFixed(4)
            : lat.toFixed(4);
          const liveLon = Number.isFinite(Number(aircraft.longitude))
            ? Number(aircraft.longitude).toFixed(4)
            : lon.toFixed(4);

          nextForm.flightPath =
            `LIVE AIRCRAFT PATH — ` +
            `ICAO24: ${aircraftId}; ` +
            `Origin country: ${originCountry}; ` +
            `Position: ${liveLat}, ${liveLon}; ` +
            `Heading: ${aircraft.heading != null ? `${aircraft.heading}°` : "N/A"}; ` +
            `Speed: ${aircraft.velocity != null ? `${Number(aircraft.velocity).toFixed(1)} m/s` : "N/A"}; ` +
            `Vertical rate: ${aircraft.verticalRate != null ? `${Number(aircraft.verticalRate).toFixed(1)} m/s` : "N/A"}.`;

          messages.push(`Aircraft loaded: ${liveFlightNumber}`);
        } else {
          // No aircraft found: still fill the case from the requested
          // location instead of leaving Flight Path and Flight Number blank.
          setLiveAircraft(null);

          nextForm.flightNumber =
            nextForm.flightNumber ||
            `AREA-${Math.abs(Math.round(lat * 100))}-${Math.abs(Math.round(lon * 100))}`;

          nextForm.airline =
            nextForm.airline || "No aircraft identified";

          nextForm.flightDate =
            nextForm.flightDate || new Date().toISOString().slice(0, 10);

          if (!nextForm.caseId) {
            nextForm.caseId = createCaseId();
          }

          nextForm.origin =
            nextForm.origin ||
            `Live area (${lat.toFixed(4)}, ${lon.toFixed(4)})`;

          nextForm.destination =
            nextForm.destination ||
            "Not available";

          if (
            nextForm.flightDuration === "" ||
            nextForm.flightDuration === null ||
            nextForm.flightDuration === undefined
          ) {
            nextForm.flightDuration = 0;
          }

          nextForm.flightPath =
            `LIVE SEARCH POSITION — No aircraft state vector found within the selected radius. ` +
            `Search coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}.`;

          messages.push("No aircraft found in this area; search position recorded.");
        }
      } else {
        setLiveAircraft(null);

        // Even when aircraft API fails, keep the user's fetched location.
        nextForm.flightNumber =
          nextForm.flightNumber ||
          `AREA-${Math.abs(Math.round(lat * 100))}-${Math.abs(Math.round(lon * 100))}`;

        nextForm.airline =
          nextForm.airline || "Aircraft feed unavailable";

        nextForm.flightDate =
          nextForm.flightDate || new Date().toISOString().slice(0, 10);

        if (!nextForm.caseId) {
          nextForm.caseId = createCaseId();
        }

        nextForm.origin =
          nextForm.origin ||
          `Search area (${lat.toFixed(4)}, ${lon.toFixed(4)})`;

        nextForm.destination =
          nextForm.destination || "Not available";

        if (
          nextForm.flightDuration === "" ||
          nextForm.flightDuration === null ||
          nextForm.flightDuration === undefined
        ) {
          nextForm.flightDuration = 0;
        }

        nextForm.flightPath =
          `LIVE SEARCH POSITION — Aircraft feed unavailable. ` +
          `Search coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}.`;

        messages.push("Aircraft feed could not be loaded; search position recorded.");
      }

      // -------------------------------------------------
      // 2. ATMOSPHERIC DATA
      // -------------------------------------------------
      if (weatherResult.status === "fulfilled") {
        const weather = weatherResult.value;
        const atmospheric = weather?.atmospheric;

        if (atmospheric) {
          setLiveAtmosphere(atmospheric);

          if (atmospheric.temperature !== null && atmospheric.temperature !== undefined) {
            nextForm.atmosphericConditions.temperature =
              atmospheric.temperature;
          }

          if (atmospheric.humidity !== null && atmospheric.humidity !== undefined) {
            nextForm.atmosphericConditions.humidity =
              atmospheric.humidity;
          }

          // The backend requests the 300 hPa upper-air dataset.
          nextForm.atmosphericConditions.pressure = 300;

          if (atmospheric.windSpeed !== null && atmospheric.windSpeed !== undefined) {
            nextForm.atmosphericConditions.windSpeed =
              atmospheric.windSpeed;
          }

          if (atmospheric.cloudCover !== null && atmospheric.cloudCover !== undefined) {
            nextForm.atmosphericConditions.cloudCover =
              atmospheric.cloudCover;
          }

          messages.push("Atmospheric data loaded at 300 hPa.");
        } else {
          setLiveAtmosphere(null);
          messages.push("Atmospheric response was empty.");
        }
      } else {
        setLiveAtmosphere(null);
        messages.push("Atmospheric data could not be loaded.");
      }

      // -------------------------------------------------
      // 3. CONTRAIL SCREENING
      // -------------------------------------------------
      const analysis = analyzeContrailConditions(nextForm);
      setContrailAnalysis(analysis);

      // Automatically populate the investigation fields.
      // These are SYSTEM-GENERATED SCREENING VALUES and remain editable.
      const observed = analysis.potential !== "Low";

      nextForm.contrailObservation = {
        ...nextForm.contrailObservation,
        observed,
        type:
          analysis.potential === "High"
            ? "Linear / persistent candidate"
            : analysis.potential === "Moderate"
              ? "Linear / possible candidate"
              : "Linear / possible candidate",
        persistence:
          analysis.potential === "High"
            ? "Persistent candidate"
            : analysis.potential === "Moderate"
              ? "Potentially persistent"
              : "Persistence uncertain",
        details:
          `${analysis.summary} ` +
          `${analysis.reasons.join(" ")} ` +
          `System-generated from live aircraft and atmospheric data at ` +
          `${lat.toFixed(4)}, ${lon.toFixed(4)}. ` +
          `Direct visual confirmation should be added when available.`
      };

      // Automatically fill findings/result too.
      nextForm.findings =
        `${analysis.summary} ${analysis.reasons.join(" ")}`;

      nextForm.investigationResult =
        analysis.recommendation;

      // -------------------------------------------------
      // 4. UPDATE THE FORM ONCE — prevents fields from
      //    overwriting each other or appearing blank.
      // -------------------------------------------------
      setForm(nextForm);

      setRealDataMessage(
        messages.length
          ? messages.join(" ")
          : "Live investigation data loaded successfully."
      );

    } catch (err) {
      console.error("Live data fetch error:", err);

      setRealDataMessage(
        err.response?.data?.message ||
        "Could not fetch live data. Please check the backend and try again."
      );
    } finally {
      setFetchingRealData(false);
    }
  };

  const submit = async (e) => {

    e.preventDefault();

    setError("");
    setSaving(true);

    try {

      const prepared = {
        ...form,

        altitude: Number(form.altitude),
        flightDuration: Number(form.flightDuration),

        atmosphericConditions: {
          temperature: Number(
            form.atmosphericConditions.temperature
          ),

          humidity: Number(
            form.atmosphericConditions.humidity
          ),

          pressure: Number(
            form.atmosphericConditions.pressure
          ),

          windSpeed: Number(
            form.atmosphericConditions.windSpeed
          ),

          cloudCover: Number(
            form.atmosphericConditions.cloudCover || 0
          )
        }
      };

      if (editing) {

        await updateInvestigation(
          id,
          prepared
        );

      } else {

        await createInvestigation(
          prepared
        );

      }

      navigate(
        editing
          ? `/investigations/${id}`
          : "/investigations"
      );

    } catch (err) {

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Could not save investigation."
      );

    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return <div className="loading">Loading case...</div>;
  }


  return (
    <div>

      <div className="page-heading">

        <div>

          <span className="eyebrow">
            {editing
              ? "CASE EDITOR"
              : "NEW INVESTIGATION"}
          </span>

          <h1>
            {editing
              ? "Edit Investigation"
              : "Create Investigation"}
          </h1>

          <p>
            Record flight, atmospheric and contrail evidence.
          </p>

        </div>

      </div>


      {error && (
        <div className="error-message page-error">
          {error}
        </div>
      )}


      <form
        className="investigation-form"
        onSubmit={submit}
      >

        {!editing && contrailAnalysis && (
          <div className="panel" style={{ marginBottom: "18px" }}>
            <div className="panel-header">
              <div>
                <h3>Contrail Analysis Insight</h3>
                <span>Rule-based screening using the fetched flight and 300 hPa atmospheric data.</span>
              </div>
              <RiskBadge level={contrailAnalysis.level} />
            </div>

            <div className="form-grid">
              <div className="detail-card">
                <span>Formation Potential</span>
                <strong>{contrailAnalysis.potential}</strong>
              </div>

              <div className="detail-card">
                <span>Estimated RH over Ice</span>
                <strong>
                  {contrailAnalysis.rhi !== null
                    ? `${contrailAnalysis.rhi.toFixed(0)}%`
                    : "Not available"}
                </strong>
              </div>
            </div>

            <div style={{ marginTop: "14px" }}>
              <strong>Why?</strong>
              <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                {contrailAnalysis.reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>

            <div className="success-message" style={{ marginTop: "14px" }}>
              {contrailAnalysis.recommendation}
            </div>

            <p style={{ marginTop: "12px", marginBottom: 0, fontSize: "13px" }}>
              Screening estimate only — the system does not claim to be a full scientific contrail prediction model.
            </p>
          </div>
        )}

        {!editing && (
          <div className="panel real-data-panel">
            <div className="panel-header">
              <div>
                <h3>Live Data Assistant</h3>
                <span>One fetch fills the live aircraft, atmosphere and screening fields automatically.</span>
              </div>
            </div>

            <div className="form-grid">
              <Field
                label="Latitude"
                type="number"
                value={location.lat}
                onChange={(v) =>
                  setLocation({ ...location, lat: v })
                }
                placeholder="8.5241"
              />

              <Field
                label="Longitude"
                type="number"
                value={location.lon}
                onChange={(v) =>
                  setLocation({ ...location, lon: v })
                }
                placeholder="76.9366"
              />
            </div>

            <button
              type="button"
              className="secondary-btn"
              onClick={fetchRealData}
              disabled={fetchingRealData}
            >
              {fetchingRealData
                ? "Fetching Real Data..."
                : "↻ Fetch Real Aircraft + Atmosphere Data"}
            </button>

            {realDataMessage && (
              <div className="success-message" style={{ marginTop: "14px" }}>
                {realDataMessage}
              </div>
            )}

            {contrailAnalysis && (
              <div style={{
                marginTop: "22px",
                border: "1px solid #dbe4ee",
                borderRadius: "18px",
                overflow: "hidden",
                background: "linear-gradient(135deg, #f8fbff 0%, #ffffff 55%, #f7fafc 100%)"
              }}>
                <div style={{
                  padding: "18px 20px",
                  background: "linear-gradient(135deg, #0f172a, #1e293b)",
                  color: "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  flexWrap: "wrap"
                }}>
                  <div>
                    <div style={{ fontSize: "11px", letterSpacing: "1.5px", opacity: 0.7, fontWeight: 700 }}>LIVE INTELLIGENCE</div>
                    <h3 style={{ margin: "5px 0 3px", color: "white" }}>🛰️ Investigation Intelligence</h3>
                    <div style={{ fontSize: "13px", opacity: 0.78 }}>Real aircraft + atmospheric snapshot used for this case</div>
                  </div>
                  <div style={{ padding: "7px 12px", borderRadius: "999px", background: "rgba(255,255,255,.1)", fontSize: "12px", fontWeight: 700 }}>● DATA RECEIVED</div>
                </div>

                <div style={{ padding: "18px" }}>
                  <div className="form-grid">
                    <div className="detail-card" style={{ padding: "18px", borderRadius: "14px" }}>
                      <span>✈️ Aircraft</span>
                      <strong style={{ display: "block", marginTop: "10px", fontSize: "17px" }}>{liveAircraft?.callsign || form.flightNumber || "Not available"}</strong>
                      <div style={{ marginTop: "12px", lineHeight: 1.9, fontSize: "13px" }}>
                        <div><b>ICAO24:</b> {liveAircraft?.icao24 || "N/A"}</div>
                        <div><b>Altitude:</b> {form.altitude ? `${Number(form.altitude).toLocaleString()} ft` : "N/A"}</div>
                        <div><b>Speed:</b> {liveAircraft?.velocity != null ? `${Number(liveAircraft.velocity).toFixed(1)} m/s` : "N/A"}</div>
                        <div><b>Heading:</b> {liveAircraft?.heading != null ? `${liveAircraft.heading}°` : "N/A"}</div>
                        <div><b>Origin:</b> {liveAircraft?.originCountry || "N/A"}</div>
                      </div>
                    </div>

                    <div className="detail-card" style={{ padding: "18px", borderRadius: "14px" }}>
                      <span>🌤️ Atmosphere</span>
                      <strong style={{ display: "block", marginTop: "10px", fontSize: "17px" }}>300 hPa Snapshot</strong>
                      <div style={{ marginTop: "12px", lineHeight: 1.9, fontSize: "13px" }}>
                        <div><b>Temperature:</b> {liveAtmosphere?.temperature ?? form.atmosphericConditions.temperature}°C</div>
                        <div><b>Humidity:</b> {liveAtmosphere?.humidity ?? form.atmosphericConditions.humidity}%</div>
                        <div><b>Pressure:</b> {form.atmosphericConditions.pressure || "N/A"} hPa</div>
                        <div><b>Wind:</b> {liveAtmosphere?.windSpeed ?? form.atmosphericConditions.windSpeed} km/h</div>
                        <div><b>Cloud cover:</b> {liveAtmosphere?.cloudCover ?? form.atmosphericConditions.cloudCover}%</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: "16px", padding: "16px", borderRadius: "14px", background: "#f1f5f9", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "11px", letterSpacing: "1.2px", fontWeight: 800, color: "#64748b" }}>🔥 CONTRAIL SCREENING</div>
                    <div style={{ display: "flex", gap: "22px", flexWrap: "wrap", alignItems: "center", marginTop: "10px" }}>
                      <div><span style={{ fontSize: "12px", color: "#64748b" }}>Formation potential</span><strong style={{ display: "block", fontSize: "19px" }}>{contrailAnalysis.potential}</strong></div>
                      <div><span style={{ fontSize: "12px", color: "#64748b" }}>Estimated RH over ice</span><strong style={{ display: "block", fontSize: "19px" }}>{contrailAnalysis.rhi !== null ? `${contrailAnalysis.rhi.toFixed(0)}%` : "N/A"}</strong></div>
                      <div><span style={{ fontSize: "12px", color: "#64748b" }}>Risk screening</span><div style={{ marginTop: "4px" }}><RiskBadge level={contrailAnalysis.level} /></div></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <p style={{ marginTop: "12px", marginBottom: 0 }}>
              After fetching, only human-observation items such as contrail observation and evidence need manual input. Flight route/duration may remain unavailable because the live state feed does not provide those values.
            </p>
          </div>
        )}

        <FormSection
          number="01"
          title="Flight Information"
          description="Basic aircraft and route information"
        >

          <div className="form-grid">

            <Field
              label="Case ID"
              value={form.caseId}
              onChange={(v) =>
                updateField("caseId", v)
              }
              placeholder="CC-2026-001"
              required
            />

            <Field
              label="Investigator"
              value={form.investigator}
              onChange={(v) =>
                updateField("investigator", v)
              }
              placeholder="Investigator name"
              required
            />

            <Field
              label="Flight Number"
              value={form.flightNumber}
              onChange={(v) =>
                updateField("flightNumber", v)
              }
              placeholder="AI-101"
              required
            />

            <Field
              label="Airline"
              value={form.airline}
              onChange={(v) =>
                updateField("airline", v)
              }
              placeholder="Air India"
            />

            <Field
              label="Origin"
              value={form.origin}
              onChange={(v) =>
                updateField("origin", v)
              }
              placeholder="Chennai"
            />

            <Field
              label="Destination"
              value={form.destination}
              onChange={(v) =>
                updateField("destination", v)
              }
              placeholder="Delhi"
            />

            <Field
              label="Flight Date"
              type="date"
              value={form.flightDate}
              onChange={(v) =>
                updateField("flightDate", v)
              }
              required
            />

            <Field
              label="Altitude (ft)"
              type="number"
              value={form.altitude}
              onChange={(v) =>
                updateField("altitude", v)
              }
              placeholder="35000"
              required
            />

            <Field
              label="Flight Duration (min)"
              type="number"
              value={form.flightDuration}
              onChange={(v) =>
                updateField("flightDuration", v)
              }
              placeholder="180"
            />

          </div>

          <label>Flight Path</label>

          <textarea
            value={form.flightPath}
            onChange={(e) =>
              updateField(
                "flightPath",
                e.target.value
              )
            }
            placeholder="Describe the observed aircraft path..."
          />

        </FormSection>


        <FormSection
          number="02"
          title="Atmospheric Conditions"
          description="Environmental conditions during observation"
        >

          <div className="form-grid">

            <Field
              label="Temperature (°C)"
              type="number"
              value={
                form.atmosphericConditions.temperature
              }
              onChange={(v) =>
                updateNested(
                  "atmosphericConditions",
                  "temperature",
                  v
                )
              }
              placeholder="-35"
              required
            />

            <Field
              label="Humidity (%)"
              type="number"
              value={
                form.atmosphericConditions.humidity
              }
              onChange={(v) =>
                updateNested(
                  "atmosphericConditions",
                  "humidity",
                  v
                )
              }
              placeholder="75"
              required
            />

            <Field
              label="Pressure (hPa)"
              type="number"
              value={
                form.atmosphericConditions.pressure
              }
              onChange={(v) =>
                updateNested(
                  "atmosphericConditions",
                  "pressure",
                  v
                )
              }
              placeholder="250"
              required
            />

            <Field
              label="Wind Speed (km/h)"
              type="number"
              value={
                form.atmosphericConditions.windSpeed
              }
              onChange={(v) =>
                updateNested(
                  "atmosphericConditions",
                  "windSpeed",
                  v
                )
              }
              placeholder="40"
              required
            />

            <Field
              label="Cloud Cover (%)"
              type="number"
              value={
                form.atmosphericConditions.cloudCover
              }
              onChange={(v) =>
                updateNested(
                  "atmosphericConditions",
                  "cloudCover",
                  v
                )
              }
              placeholder="20"
            />

          </div>

        </FormSection>


        <FormSection
          number="03"
          title="Contrail Observation"
          description="Record the observed trail characteristics"
        >

          <label className="checkbox-row">

            <input
              type="checkbox"
              checked={
                form.contrailObservation.observed
              }
              onChange={(e) => {
                const observed = e.target.checked;
                if (observed) {
                  updateNested("contrailObservation", "observed", true);
                } else {
                  setForm({
                    ...form,
                    contrailObservation: {
                      ...form.contrailObservation,
                      observed: false,
                      type: "",
                      persistence: "",
                      details: "No direct visual observation recorded."
                    }
                  });
                }
              }}
            />

            <span>
              Contrail observed
            </span>

          </label>


          <div className="form-grid">

            <Field
              label="Contrail Type"
              value={
                form.contrailObservation.type
              }
              onChange={(v) =>
                updateNested(
                  "contrailObservation",
                  "type",
                  v
                )
              }
              placeholder="Linear / Diffuse / Mixed"
            />

            <Field
              label="Persistence"
              value={
                form.contrailObservation.persistence
              }
              onChange={(v) =>
                updateNested(
                  "contrailObservation",
                  "persistence",
                  v
                )
              }
              placeholder="Persistent / Short-lived"
            />

          </div>

          <label>Observation Details</label>

          <textarea
            value={
              form.contrailObservation.details
            }
            onChange={(e) =>
              updateNested(
                "contrailObservation",
                "details",
                e.target.value
              )
            }
            placeholder="Describe the observed contrail..."
          />

        </FormSection>


        <FormSection
          number="04"
          title="Evidence"
          description="Supporting investigation evidence"
        >

          <label className="checkbox-row">

            <input
              type="checkbox"
              checked={
                form.evidence.available
              }
              onChange={(e) =>
                updateNested(
                  "evidence",
                  "available",
                  e.target.checked
                )
              }
            />

            <span>
              Supporting evidence available
            </span>

          </label>

          <label>Evidence Description</label>

          <textarea
            value={
              form.evidence.description
            }
            onChange={(e) =>
              updateNested(
                "evidence",
                "description",
                e.target.value
              )
            }
            placeholder="Describe photographs, reports, observations or other evidence..."
          />

          <Field
            label="Evidence Image URL (optional)"
            value={
              form.evidence.imageUrl
            }
            onChange={(v) =>
              updateNested(
                "evidence",
                "imageUrl",
                v
              )
            }
            placeholder="https://..."
          />

        </FormSection>


        <FormSection
          number="05"
          title="Investigation Result"
          description="Final findings and investigator notes"
        >

          <div className="form-grid">

            <div>

              <label>Status</label>

              <select
                value={form.status}
                onChange={(e) =>
                  updateField(
                    "status",
                    e.target.value
                  )
                }
              >

                <option>
                  Under Investigation
                </option>

                <option>
                  Evidence Review
                </option>

                <option>
                  Completed
                </option>

                <option>
                  Resolved
                </option>

              </select>

            </div>

          </div>


          <label>Findings</label>

          <textarea
            value={form.findings}
            onChange={(e) =>
              updateField(
                "findings",
                e.target.value
              )
            }
            placeholder="Summarize the investigation findings..."
          />


          <label>Investigation Result</label>

          <textarea
            value={form.investigationResult}
            onChange={(e) =>
              updateField(
                "investigationResult",
                e.target.value
              )
            }
            placeholder="Record the final investigation result..."
          />


          <label>Additional Notes</label>

          <textarea
            value={form.notes}
            onChange={(e) =>
              updateField(
                "notes",
                e.target.value
              )
            }
            placeholder="Additional investigator notes..."
          />

        </FormSection>


        <div className="form-actions">

          <button
            type="button"
            className="secondary-btn"
            onClick={() =>
              navigate(
                editing
                  ? `/investigations/${id}`
                  : "/investigations"
              )
            }
          >
            Cancel
          </button>

          <button
            className="primary-btn"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : editing
              ? "Save Changes"
              : "Create Investigation"}
          </button>

        </div>

      </form>

    </div>
  );
}


function FormSection({
  number,
  title,
  description,
  children
}) {
  return (
    <div className="form-section">

      <div className="form-section-heading">

        <div className="section-number">
          {number}
        </div>

        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>

      </div>

      {children}

    </div>
  );
}


function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required
}) {
  return (
    <div>

      <label>{label}</label>

      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        required={required}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />

    </div>
  );
}


// =====================================================
// INVESTIGATION DETAILS
// =====================================================

function InvestigationDetails() {

  const navigate = useNavigate();
  const { id } = useParams();

  const user = getUser();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {

    try {

      const result =
        await getInvestigation(id);

      setData(result);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    load();
  }, [id]);


  const liveAircraft = getSavedAircraftData(data);

  const downloadReport = () => {
    const safe = (value) => String(value ?? "").replace(/[\\\r\n]/g, " ").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

    const lines = [];
    const add = (text = "") => {
      String(text).split("\n").forEach((line) => {
        const words = line.split(/\s+/);
        let current = "";
        words.forEach((word) => {
          if ((current + " " + word).trim().length > 92) {
            if (current) lines.push(current.trim());
            current = word;
          } else {
            current += " " + word;
          }
        });
        lines.push(current.trim());
      });
    };
    const section = (title) => {
      lines.push("");
      lines.push("============================================================");
      lines.push(title.toUpperCase());
      lines.push("============================================================");
    };

    add("CONTRAIL COURT");
    add("Aircraft Trail Investigation E-Report");
    add(`Case ID: ${safe(data.caseId)}    Generated: ${new Date().toLocaleString()}`);

    section("Case Information");
    add(`Case ID: ${safe(data.caseId)}`);
    add(`Investigator: ${safe(data.investigator)}`);
    add(`Status: ${safe(data.status)}`);
    add(`Risk Level: ${safe(data.riskLevel)}`);
    add(`Risk Score: ${safe(data.riskScore)} points`);

    section("Flight Information");
    add(`Flight Number: ${safe(data.flightNumber)}`);
    add(`Airline: ${safe(data.airline)}`);
    add(`Origin: ${safe(data.origin)}`);
    add(`Destination: ${safe(data.destination)}`);
    add(`Flight Date: ${data.flightDate ? new Date(data.flightDate).toLocaleDateString() : "Not recorded"}`);
    add(`Altitude: ${safe(data.altitude)} ft`);
    add(`Duration: ${safe(data.flightDuration)} min`);
    add(`Aircraft ID / ICAO24: ${safe(data.icao24 || data.aircraftId || liveAircraft.icao24 || "Not recorded")}`);
    add(`Origin Country: ${safe(liveAircraft.originCountry || "Not recorded")}`);
    add(`Position: ${safe(data.latitude || liveAircraft.latitude || "Not recorded")}, ${safe(data.longitude || liveAircraft.longitude || "Not recorded")}`);
    add(`Heading: ${safe(data.heading || liveAircraft.heading || "Not recorded")}`);
    add(`Speed: ${safe(data.velocity || data.speed || liveAircraft.velocity || "Not recorded")} m/s`);
    add(`Vertical Rate: ${safe(liveAircraft.verticalRate || "Not recorded")} m/s`);

    section("Atmospheric Conditions");
    add(`Temperature: ${safe(data.atmosphericConditions?.temperature)} C`);
    add(`Humidity: ${safe(data.atmosphericConditions?.humidity)}%`);
    add(`Pressure: ${safe(data.atmosphericConditions?.pressure)} hPa`);
    add(`Wind Speed: ${safe(data.atmosphericConditions?.windSpeed)} km/h`);
    add(`Cloud Cover: ${safe(data.atmosphericConditions?.cloudCover)}%`);

    section("Contrail Observation");
    add(`Observed: ${data.contrailObservation?.observed ? "Yes" : "No"}`);
    add(`Type: ${safe(data.contrailObservation?.type || "Not specified")}`);
    add(`Persistence: ${safe(data.contrailObservation?.persistence || "Not specified")}`);
    add(`Details: ${safe(data.contrailObservation?.details || "No observation details recorded.")}`);

    section("Evidence");
    add(data.evidence?.description || "No evidence description recorded.");
    if (data.evidence?.imageUrl) add(`Evidence image: ${safe(data.evidence.imageUrl)}`);

    section("Investigation Assessment");
    add(`Findings: ${safe(data.findings || "No findings recorded.")}`);
    add(`Investigation Result: ${safe(data.investigationResult || "No final result recorded.")}`);
    add(`Additional Notes: ${safe(data.notes || "No additional notes.")}`);

    add("");
    add("This report is generated from the information stored in CONTRAIL COURT.");
    add("Contrail screening is an investigation-support estimate and does not by itself prove that a contrail occurred.");

    // Build a simple downloadable PDF without opening the browser print dialog.
    const pageHeight = 720;
    const top = 680;
    const lineHeight = 14;
    const linesPerPage = 46;
    const pages = [];
    for (let i = 0; i < lines.length; i += linesPerPage) pages.push(lines.slice(i, i + linesPerPage));

    const objects = [];
    const addObj = (body) => { objects.push(body); return objects.length; };
    const catalogId = addObj("");
    const pagesId = addObj("");
    const fontId = addObj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
    const pageIds = [];
    const contentIds = [];

    pages.forEach((pageLines) => {
      const commands = ["BT", "/F1 10 Tf", `50 ${top} Td`, `${lineHeight} TL`];
      pageLines.forEach((line, index) => {
        if (index === 0) commands.push("/F1 16 Tf");
        else if (index === 1) commands.push("/F1 12 Tf");
        else commands.push("/F1 10 Tf");
        commands.push(`(${safe(line)}) Tj`);
        if (index < pageLines.length - 1) commands.push("T*");
      });
      commands.push("ET");
      const stream = commands.join("\n");
      const contentId = addObj(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
      contentIds.push(contentId);
      pageIds.push(addObj(""));
    });

    objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
    objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
    pageIds.forEach((pageId, i) => {
      objects[pageId - 1] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 ${pageHeight}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentIds[i]} 0 R >>`;
    });

    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    objects.forEach((obj, index) => {
      offsets[index + 1] = pdf.length;
      pdf += `${index + 1} 0 obj\n${obj}\nendobj\n`;
    });
    const xref = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= objects.length; i++) pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`;

    const blob = new Blob([pdf], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CONTRAIL_COURT_${data.caseId || "Investigation"}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };


  const remove = async () => {

    if (
      !window.confirm(
        "Are you sure you want to permanently delete this investigation? This action cannot be undone."
      )
    ) {
      return;
    }

    try {

      await deleteInvestigation(id);

      navigate("/investigations");

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Delete failed."
      );

    }
  };


  if (loading) {
    return (
      <div className="loading">
        Loading investigation...
      </div>
    );
  }


  if (!data) {
    return (
      <div className="empty-state large">
        Investigation not found.
      </div>
    );
  }


  return (
    <div className="report-page">

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .report-page, .report-page * { visibility: visible !important; }
          .report-page { position: absolute; left: 0; top: 0; width: 100%; background: white; padding: 24px; }
          .no-print { display: none !important; }
          .print-title { display: block !important; }
        }
        .print-title { display: none; }
      `}</style>

      <div className="print-title">
        <h1 style={{ marginBottom: "4px" }}>CONTRAIL COURT</h1>
        <h2 style={{ marginTop: 0 }}>Aircraft Trail Investigation E-Report</h2>
        <p>Case ID: {data.caseId} · Generated: {new Date().toLocaleString()}</p>
      </div>

      <div className="detail-top no-print">

        <button
          className="back-btn"
          onClick={() =>
            navigate("/investigations")
          }
        >
          ← Back to Investigations
        </button>


        <div className="detail-actions">

          <button
            className="secondary-btn no-print"
            onClick={downloadReport}
          >
            ⬇ Generate E-Report
          </button>

          <button
            className="secondary-btn no-print"
            onClick={() =>
              navigate(
                `/investigations/${id}/edit`
              )
            }
          >
            ✎ Edit
          </button>

          {user?.role === "admin" && (
            <button
              className="danger-btn"
              onClick={remove}
            >
              🗑 Delete Investigation
            </button>
          )}

        </div>

      </div>


      <div className="case-hero">

        <div>

          <span className="eyebrow">
            INVESTIGATION CASE
          </span>

          <h1>{data.caseId}</h1>

          <p>
            {data.flightNumber} · {data.airline}
            {" · "}
            {data.origin} → {data.destination}
          </p>

        </div>


        <div className="risk-large">

          <span>RISK LEVEL</span>

          <RiskBadge level={data.riskLevel} />

          <strong>
            {data.riskScore} points
          </strong>

        </div>

      </div>


      <div className="detail-grid">


        <DetailCard
          title="Flight Information"
          items={[
            ["Flight Number", data.flightNumber],
            ["Airline", data.airline],
            ["Origin", data.origin],
            ["Destination", data.destination],
            [
              "Flight Date",
              new Date(
                data.flightDate
              ).toLocaleDateString()
            ],
            [
              "Altitude",
              `${data.altitude} ft`
            ],
            [
              "Duration",
              data.flightDuration ? `${data.flightDuration} min` : "Not recorded"
            ],
            [
              "Aircraft ID / ICAO24",
              liveAircraft.icao24 || "Not recorded"
            ],
            [
              "Live Position",
              liveAircraft.latitude && liveAircraft.longitude
                ? `${liveAircraft.latitude}, ${liveAircraft.longitude}`
                : "Not recorded"
            ],
            [
              "Heading",
              liveAircraft.heading ? `${liveAircraft.heading}°` : "Not recorded"
            ],
            [
              "Speed",
              liveAircraft.velocity ? `${liveAircraft.velocity} m/s` : "Not recorded"
            ],
            [
              "Investigator",
              data.investigator
            ]
          ]}
        />


        <DetailCard
          title="Atmospheric Conditions"
          items={[
            [
              "Temperature",
              `${data.atmosphericConditions?.temperature} °C`
            ],
            [
              "Humidity",
              `${data.atmosphericConditions?.humidity}%`
            ],
            [
              "Pressure",
              `${data.atmosphericConditions?.pressure} hPa`
            ],
            [
              "Wind Speed",
              `${data.atmosphericConditions?.windSpeed} km/h`
            ],
            [
              "Cloud Cover",
              `${data.atmosphericConditions?.cloudCover}%`
            ]
          ]}
        />


        <DetailCard
          title="Contrail Observation"
          items={[
            [
              "Observed",
              data.contrailObservation?.observed
                ? "Yes"
                : "No"
            ],
            [
              "Type",
              data.contrailObservation?.type ||
              "Not specified"
            ],
            [
              "Persistence",
              data.contrailObservation?.persistence ||
              "Not specified"
            ]
          ]}
        />


        <DetailCard
          title="Case Status"
          items={[
            [
              "Status",
              data.status
            ],
            [
              "Risk Score",
              `${data.riskScore} / 100+`
            ],
            [
              "Created",
              new Date(
                data.createdAt
              ).toLocaleDateString()
            ],
            [
              "Last Updated",
              new Date(
                data.updatedAt
              ).toLocaleDateString()
            ]
          ]}
        />

      </div>


      <div className="detail-wide-grid">

        <TextCard
          title="Observation Details"
          text={
            data.contrailObservation?.details ||
            "No observation details recorded."
          }
        />

        <TextCard
          title="Evidence"
          text={
            data.evidence?.description ||
            "No evidence description recorded."
          }
        />

        <TextCard
          title="Investigation Findings"
          text={
            data.findings ||
            "No findings recorded."
          }
        />

        <TextCard
          title="Investigation Result"
          text={
            data.investigationResult ||
            "No final result recorded."
          }
        />

        <TextCard
          title="Additional Notes"
          text={
            data.notes ||
            "No additional notes."
          }
        />

      </div>


      {data.evidence?.imageUrl && (
        <div className="panel evidence-image-panel">

          <div className="panel-header">
            <div>
              <h3>Evidence Image</h3>
              <span>Supporting visual evidence</span>
            </div>
          </div>

          <img
            src={data.evidence.imageUrl}
            alt="Investigation evidence"
            className="evidence-image"
          />

        </div>
      )}

    </div>
  );
}


function DetailCard({
  title,
  items
}) {
  return (
    <div className="panel detail-card">

      <div className="panel-header">
        <h3>{title}</h3>
      </div>

      <div className="detail-items">

        {items.map(([label, value]) => (

          <div
            className="detail-item"
            key={label}
          >

            <span>{label}</span>

            <strong>
              {value || "—"}
            </strong>

          </div>

        ))}

      </div>

    </div>
  );
}


function TextCard({
  title,
  text
}) {
  return (
    <div className="panel text-card">

      <div className="panel-header">
        <h3>{title}</h3>
      </div>

      <p>{text}</p>

    </div>
  );
}


// =====================================================
// PROFILE
// =====================================================

function Profile() {

  const user = getUser();

  return (
    <div>

      <div className="page-heading">

        <div>
          <span className="eyebrow">
            ACCOUNT
          </span>

          <h1>Profile</h1>

          <p>
            Your CONTrAIL COURT investigator profile.
          </p>
        </div>

      </div>


      <div className="profile-card panel">

        <div className="profile-avatar">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>

        <div className="profile-main">

          <h2>{user?.name}</h2>

          <p>{user?.email}</p>

          <span className="role-badge">
            {user?.role}
          </span>

        </div>

      </div>


      <div className="panel profile-info">

        <h3>Account Information</h3>

        <div className="detail-items">

          <div className="detail-item">
            <span>Name</span>
            <strong>{user?.name}</strong>
          </div>

          <div className="detail-item">
            <span>Email</span>
            <strong>{user?.email}</strong>
          </div>

          <div className="detail-item">
            <span>Role</span>
            <strong>{user?.role}</strong>
          </div>

        </div>

      </div>

    </div>
  );
}


// =====================================================
// APP
// =====================================================

function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/login"
          element={
            isLoggedIn()
              ? <Navigate to="/dashboard" />
              : <Login />
          }
        />

        <Route
          path="/register"
          element={
            isLoggedIn()
              ? <Navigate to="/dashboard" />
              : <Register />
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/investigations"
          element={
            <ProtectedRoute>
              <Layout>
                <Investigations />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/investigations/new"
          element={
            <ProtectedRoute>
              <Layout>
                <InvestigationForm />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/investigations/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <InvestigationDetails />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/investigations/:id/edit"
          element={
            <ProtectedRoute>
              <Layout>
                <InvestigationForm />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <Navigate to="/dashboard" />
          }
        />

        <Route
          path="*"
          element={
            <Navigate to="/dashboard" />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;