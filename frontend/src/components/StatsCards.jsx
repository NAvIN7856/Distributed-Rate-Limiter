import {
  Activity,
  ShieldCheck,
  ShieldX,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";
import "./StatsCards.css";

export default function StatsCards({ metrics, redisInfo }) {
  const cards = [
    {
      label: "Total Requests",
      value: metrics?.total ?? "—",
      icon: Activity,
      color: "accent",
      subtitle: "All time",
    },
    {
      label: "Allowed",
      value: metrics?.allowed ?? "—",
      icon: ShieldCheck,
      color: "success",
      subtitle: `${100 - (parseFloat(metrics?.blockRate) || 0)}% pass rate`,
    },
    {
      label: "Blocked (429)",
      value: metrics?.blocked ?? "—",
      icon: ShieldX,
      color: "danger",
      subtitle: `${metrics?.blockRate ?? 0}% block rate`,
    },
    {
      label: "Avg Response",
      value: metrics?.avgResponseTime
        ? `${metrics.avgResponseTime}ms`
        : "—",
      icon: Timer,
      color: "info",
      subtitle: "Request duration",
    },
    {
      label: "Active Clients",
      value: redisInfo?.activeClients ?? "—",
      icon: TrendingUp,
      color: "warning",
      subtitle: "Unique identities",
    },
    {
      label: "Redis Keys",
      value: redisInfo?.activeRateLimitKeys ?? "—",
      icon: Zap,
      color: "purple",
      subtitle: `${redisInfo?.totalKeys ?? 0} total keys`,
    },
  ];

  return (
    <div className="stats-grid stagger-children">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className={`stat-card stat-card--${card.color}`}>
            <div className="stat-card__icon-wrap">
              <Icon size={20} />
            </div>
            <div className="stat-card__content">
              <span className="stat-card__label">{card.label}</span>
              <span className="stat-card__value">{card.value}</span>
              <span className="stat-card__subtitle">{card.subtitle}</span>
            </div>
            <div className="stat-card__glow" />
          </div>
        );
      })}
    </div>
  );
}
