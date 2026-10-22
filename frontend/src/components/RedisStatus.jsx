import { Database, Key, Wifi, WifiOff } from "lucide-react";
import "./RedisStatus.css";

export default function RedisStatus({ redisInfo }) {
  if (!redisInfo) {
    return (
      <div className="redis-panel glass-card">
        <div className="redis-panel__header">
          <Database size={18} />
          <h3>Redis</h3>
          <span className="status-dot offline" />
        </div>
        <div className="redis-panel__body">
          <p className="redis-panel__offline">Redis is not connected</p>
        </div>
      </div>
    );
  }

  const isOnline = redisInfo.status === "ready";

  return (
    <div className="redis-panel glass-card">
      <div className="redis-panel__header">
        <Database size={18} />
        <h3>Redis</h3>
        <span className={`status-dot ${isOnline ? "online" : "offline"}`} />
        <span className="redis-panel__status-text">
          {isOnline ? "Connected" : "Disconnected"}
        </span>
      </div>

      <div className="redis-panel__body">
        <div className="redis-stats">
          <div className="redis-stat">
            <Key size={14} />
            <span className="redis-stat__label">Rate Limit Keys</span>
            <span className="redis-stat__value mono">{redisInfo.activeRateLimitKeys}</span>
          </div>
          <div className="redis-stat">
            <Wifi size={14} />
            <span className="redis-stat__label">Active Clients</span>
            <span className="redis-stat__value mono">{redisInfo.activeClients}</span>
          </div>
          <div className="redis-stat">
            <Database size={14} />
            <span className="redis-stat__label">Total Keys</span>
            <span className="redis-stat__value mono">{redisInfo.totalKeys}</span>
          </div>
        </div>

        {redisInfo.keys && redisInfo.keys.length > 0 && (
          <div className="redis-keys">
            <h4 className="redis-keys__title">Active Keys</h4>
            <div className="redis-keys__list">
              {redisInfo.keys.map((key, i) => (
                <div key={i} className="redis-key mono">
                  {key}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
