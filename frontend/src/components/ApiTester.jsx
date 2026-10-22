import { useState, useRef, useCallback } from "react";
import {
  Zap,
  Send,
  RotateCcw,
  ChevronDown,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  Hash,
} from "lucide-react";
import { sendTestRequest, sendBurstRequests } from "../api";
import "./ApiTester.css";

const ENDPOINTS = [
  { method: "GET", path: "/products", label: "GET /products" },
  { method: "GET", path: "/profile", label: "GET /profile" },
  { method: "POST", path: "/login", label: "POST /login" },
  { method: "POST", path: "/payment", label: "POST /payment" },
];

export default function ApiTester({ onRequestComplete }) {
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0]);
  const [burstCount, setBurstCount] = useState(10);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customHeaders, setCustomHeaders] = useState("");
  const logRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, []);

  const parseCustomHeaders = () => {
    if (!customHeaders.trim()) return {};
    try {
      return JSON.parse(customHeaders);
    } catch {
      return {};
    }
  };

  const handleSingleRequest = async () => {
    setIsLoading(true);
    const startTime = Date.now();
    try {
      const result = await sendTestRequest(
        selectedEndpoint.path,
        selectedEndpoint.method,
        parseCustomHeaders()
      );
      const entry = {
        index: results.length + 1,
        ...result,
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        endpoint: selectedEndpoint.label,
      };
      setResults((prev) => [...prev, entry]);
      onRequestComplete?.();
    } catch (err) {
      const entry = {
        index: results.length + 1,
        statusCode: 0,
        body: { message: err.message },
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        endpoint: selectedEndpoint.label,
        error: true,
      };
      setResults((prev) => [...prev, entry]);
    }
    setIsLoading(false);
    setTimeout(scrollToBottom, 50);
  };

  const handleBurstRequest = async () => {
    setIsLoading(true);
    const burstResults = await sendBurstRequests(
      selectedEndpoint.path,
      selectedEndpoint.method,
      burstCount,
      parseCustomHeaders()
    );
    const enriched = burstResults.map((r, i) => ({
      ...r,
      index: results.length + i + 1,
      endpoint: selectedEndpoint.label,
    }));
    setResults((prev) => [...prev, ...enriched]);
    onRequestComplete?.();
    setIsLoading(false);
    setTimeout(scrollToBottom, 50);
  };

  const clearResults = () => setResults([]);

  const successCount = results.filter((r) => r.statusCode === 200).length;
  const blockedCount = results.filter((r) => r.statusCode === 429).length;
  const errorCount = results.filter(
    (r) => r.statusCode !== 200 && r.statusCode !== 429
  ).length;

  return (
    <div className="tester-panel glass-card">
      <div className="tester-panel__header">
        <div className="tester-panel__title">
          <Zap size={18} />
          <h3>API Tester</h3>
        </div>
        {results.length > 0 && (
          <button className="tester-clear-btn" onClick={clearResults}>
            <RotateCcw size={14} />
            Clear
          </button>
        )}
      </div>

      <div className="tester-controls">
        {/* Endpoint Selector */}
        <div className="tester-dropdown">
          <button
            className="tester-dropdown__trigger"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className={`method-badge ${selectedEndpoint.method.toLowerCase()}`}>
              {selectedEndpoint.method}
            </span>
            <span className="tester-dropdown__path">{selectedEndpoint.path}</span>
            <ChevronDown
              size={14}
              className={`tester-dropdown__chevron ${dropdownOpen ? "open" : ""}`}
            />
          </button>
          {dropdownOpen && (
            <div className="tester-dropdown__menu animate-fade-in">
              {ENDPOINTS.map((ep) => (
                <button
                  key={ep.label}
                  className={`tester-dropdown__item ${
                    ep.label === selectedEndpoint.label ? "active" : ""
                  }`}
                  onClick={() => {
                    setSelectedEndpoint(ep);
                    setDropdownOpen(false);
                  }}
                >
                  <span className={`method-badge ${ep.method.toLowerCase()}`}>
                    {ep.method}
                  </span>
                  <span>{ep.path}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Headers Input */}
        <input
          type="text"
          className="tester-headers-input"
          placeholder='Headers: {"x-user-id": "123"}'
          value={customHeaders}
          onChange={(e) => setCustomHeaders(e.target.value)}
        />

        {/* Action Buttons */}
        <div className="tester-actions">
          <button
            className="tester-btn tester-btn--send"
            onClick={handleSingleRequest}
            disabled={isLoading}
          >
            <Send size={14} />
            Send
          </button>

          <div className="tester-burst">
            <input
              type="number"
              className="tester-burst__input"
              value={burstCount}
              onChange={(e) =>
                setBurstCount(Math.max(1, Math.min(100, Number(e.target.value))))
              }
              min={1}
              max={100}
            />
            <button
              className="tester-btn tester-btn--burst"
              onClick={handleBurstRequest}
              disabled={isLoading}
            >
              <Flame size={14} />
              Burst
            </button>
          </div>
        </div>
      </div>

      {/* Summary bar */}
      {results.length > 0 && (
        <div className="tester-summary">
          <div className="tester-summary__item tester-summary__item--total">
            <Hash size={13} />
            <span>{results.length}</span>
          </div>
          <div className="tester-summary__item tester-summary__item--success">
            <CheckCircle2 size={13} />
            <span>{successCount}</span>
          </div>
          <div className="tester-summary__item tester-summary__item--blocked">
            <XCircle size={13} />
            <span>{blockedCount}</span>
          </div>
          <div className="tester-summary__item tester-summary__item--time">
            <Clock size={13} />
            <span>
              {results.length > 0
                ? `${Math.round(
                    results.reduce((s, r) => s + r.responseTime, 0) /
                      results.length
                  )}ms avg`
                : "—"}
            </span>
          </div>
        </div>
      )}

      {/* Results Log */}
      <div className="tester-log" ref={logRef}>
        {results.length === 0 ? (
          <div className="tester-log__empty">
            <Zap size={32} className="tester-log__empty-icon" />
            <p>Send a request to see results</p>
            <p className="tester-log__empty-sub">
              Use <strong>Burst</strong> mode to test rate limiting
            </p>
          </div>
        ) : (
          results.map((r, i) => (
            <div
              key={i}
              className={`tester-log__entry ${
                r.statusCode === 200
                  ? "tester-log__entry--success"
                  : r.statusCode === 429
                  ? "tester-log__entry--blocked"
                  : "tester-log__entry--error"
              }`}
              style={{ animationDelay: `${(i % 20) * 0.02}s` }}
            >
              <span className="tester-log__index">#{r.index}</span>
              <span
                className={`tester-log__status ${
                  r.statusCode === 200
                    ? "success"
                    : r.statusCode === 429
                    ? "blocked"
                    : "error"
                }`}
              >
                {r.statusCode}
              </span>
              <span className="tester-log__endpoint mono">{r.endpoint}</span>
              <span className="tester-log__message truncate">
                {r.body?.message || "—"}
              </span>
              <span className="tester-log__time mono">{r.responseTime}ms</span>
            </div>
          ))
        )}
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="tester-loading">
          <div className="tester-loading__spinner" />
          <span>Sending requests...</span>
        </div>
      )}
    </div>
  );
}
