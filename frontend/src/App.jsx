import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  RefreshCw,
  ExternalLink,
  Activity,
} from "lucide-react";
import StatsCards from "./components/StatsCards";
import RulesTable from "./components/RulesTable";
import ArchitectureDiagram from "./components/ArchitectureDiagram";
import ApiTester from "./components/ApiTester";
import RouteBreakdown from "./components/RouteBreakdown";
import RedisStatus from "./components/RedisStatus";
import { fetchRules, fetchMetrics, fetchRedisInfo, fetchArchitecture } from "./api";
import "./App.css";

function App() {
  const [rules, setRules] = useState([]);
  const [defaultRule, setDefaultRule] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [redisInfo, setRedisInfo] = useState(null);
  const [architecture, setArchitecture] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [rulesRes, metricsRes, redisRes, archRes] = await Promise.allSettled([
        fetchRules(),
        fetchMetrics(),
        fetchRedisInfo(),
        fetchArchitecture(),
      ]);

      if (rulesRes.status === "fulfilled" && rulesRes.value.success) {
        setRules(rulesRes.value.rules);
        setDefaultRule(rulesRes.value.defaultRule);
      }
      if (metricsRes.status === "fulfilled" && metricsRes.value.success) {
        setMetrics(metricsRes.value.metrics);
      }
      if (redisRes.status === "fulfilled" && redisRes.value.success) {
        setRedisInfo(redisRes.value.redis);
      }
      if (archRes.status === "fulfilled" && archRes.value.success) {
        setArchitecture(archRes.value.architecture);
      }

      setBackendOnline(
        rulesRes.status === "fulfilled" || metricsRes.status === "fulfilled"
      );
      setLastUpdated(new Date());
    } catch {
      setBackendOnline(false);
    }
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();

    // Auto-refresh every 10 seconds
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "tester", label: "API Tester", icon: Shield },
  ];

  return (
    <div className="dashboard">
      {/* ─── Header ─── */}
      <header className="dashboard-header">
        <div className="dashboard-header__left">
          <div className="dashboard-header__logo">
            <div className="dashboard-header__logo-icon">
              <Shield size={22} />
            </div>
            <div>
              <h1 className="dashboard-header__title">
                Distributed Rate Limiter
              </h1>
              <p className="dashboard-header__subtitle">
                Real-time monitoring dashboard
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-header__right">
          <div className="dashboard-header__status">
            <span className={`status-dot ${backendOnline ? "online" : "offline"}`} />
            <span className="dashboard-header__status-text">
              {backendOnline ? "Backend Online" : "Backend Offline"}
            </span>
          </div>

          {lastUpdated && (
            <span className="dashboard-header__updated">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}

          <button
            className={`dashboard-header__refresh ${isRefreshing ? "spinning" : ""}`}
            onClick={loadData}
            title="Refresh data"
          >
            <RefreshCw size={16} />
          </button>

          <a
            href="http://localhost:9090"
            target="_blank"
            rel="noopener noreferrer"
            className="dashboard-header__link"
            title="Prometheus"
          >
            Prometheus
            <ExternalLink size={12} />
          </a>

          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="dashboard-header__link"
            title="Grafana"
          >
            Grafana
            <ExternalLink size={12} />
          </a>
        </div>
      </header>

      {/* ─── Tab Navigation ─── */}
      <nav className="dashboard-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`dashboard-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* ─── Main Content ─── */}
      <main className="dashboard-content">
        {activeTab === "overview" && (
          <div className="dashboard-overview animate-fade-in-up">
            {/* Stats */}
            <section className="dashboard-section">
              <StatsCards metrics={metrics} redisInfo={redisInfo} />
            </section>

            {/* Two Column: Rules + Redis */}
            <section className="dashboard-section dashboard-grid-2">
              <RulesTable rules={rules} defaultRule={defaultRule} />
              <div className="dashboard-sidebar-stack">
                <RedisStatus redisInfo={redisInfo} />
                <RouteBreakdown routeBreakdown={metrics?.routeBreakdown} />
              </div>
            </section>

            {/* Architecture */}
            <section className="dashboard-section">
              <ArchitectureDiagram architecture={architecture} />
            </section>
          </div>
        )}

        {activeTab === "tester" && (
          <div className="dashboard-tester animate-fade-in-up">
            <ApiTester onRequestComplete={loadData} />
          </div>
        )}
      </main>

      {/* ─── Footer ─── */}
      <footer className="dashboard-footer">
        <span>Distributed Rate Limiter Dashboard</span>
        <span className="dashboard-footer__sep">·</span>
        <span>Sliding Window Log · Redis · Nginx</span>
      </footer>
    </div>
  );
}

export default App;
