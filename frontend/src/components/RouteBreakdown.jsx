import { BarChart3 } from "lucide-react";
import "./RouteBreakdown.css";

export default function RouteBreakdown({ routeBreakdown }) {
  if (!routeBreakdown || routeBreakdown.length === 0) {
    return (
      <div className="route-panel glass-card">
        <div className="route-panel__header">
          <BarChart3 size={18} />
          <h3>Route Breakdown</h3>
        </div>
        <div className="route-panel__empty">
          <p>No route data yet. Send some requests!</p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...routeBreakdown.map((r) => r.count), 1);

  return (
    <div className="route-panel glass-card">
      <div className="route-panel__header">
        <BarChart3 size={18} />
        <h3>Route Breakdown</h3>
      </div>

      <div className="route-bars">
        {routeBreakdown.map((route, i) => {
          const successCount = route.statuses["200"] || 0;
          const blockedCount = route.statuses["429"] || 0;
          const otherCount = route.count - successCount - blockedCount;
          const barWidth = (route.count / maxCount) * 100;

          return (
            <div
              key={`${route.method}-${route.route}`}
              className="route-bar"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="route-bar__label">
                <span className={`method-badge ${route.method.toLowerCase()}`}>
                  {route.method}
                </span>
                <code>{route.route}</code>
              </div>

              <div className="route-bar__track">
                <div
                  className="route-bar__fill route-bar__fill--success"
                  style={{
                    width: `${(successCount / maxCount) * 100}%`,
                  }}
                />
                <div
                  className="route-bar__fill route-bar__fill--blocked"
                  style={{
                    width: `${(blockedCount / maxCount) * 100}%`,
                    left: `${(successCount / maxCount) * 100}%`,
                  }}
                />
                {otherCount > 0 && (
                  <div
                    className="route-bar__fill route-bar__fill--other"
                    style={{
                      width: `${(otherCount / maxCount) * 100}%`,
                      left: `${((successCount + blockedCount) / maxCount) * 100}%`,
                    }}
                  />
                )}
              </div>

              <div className="route-bar__count mono">{route.count}</div>
            </div>
          );
        })}
      </div>

      <div className="route-legend">
        <div className="route-legend__item">
          <span className="route-legend__dot route-legend__dot--success" />
          <span>200 OK</span>
        </div>
        <div className="route-legend__item">
          <span className="route-legend__dot route-legend__dot--blocked" />
          <span>429 Blocked</span>
        </div>
        <div className="route-legend__item">
          <span className="route-legend__dot route-legend__dot--other" />
          <span>Other</span>
        </div>
      </div>
    </div>
  );
}
