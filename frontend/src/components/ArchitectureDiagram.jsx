import {
  Globe,
  Server,
  Database,
  BarChart3,
  ArrowRight,
  Layers,
} from "lucide-react";
import "./ArchitectureDiagram.css";

export default function ArchitectureDiagram({ architecture }) {
  if (!architecture) return null;

  return (
    <div className="arch-panel glass-card">
      <div className="arch-panel__header">
        <Layers size={18} />
        <h3>System Architecture</h3>
      </div>

      <div className="arch-flow">
        {/* Client */}
        <div className="arch-node arch-node--client">
          <div className="arch-node__icon">
            <Globe size={22} />
          </div>
          <span className="arch-node__label">Client</span>
          <span className="arch-node__sub">HTTP Requests</span>
        </div>

        <div className="arch-connector">
          <div className="arch-connector__line" />
          <ArrowRight size={14} className="arch-connector__arrow" />
        </div>

        {/* Nginx */}
        <div className="arch-node arch-node--nginx">
          <div className="arch-node__icon">
            <Server size={22} />
          </div>
          <span className="arch-node__label">{architecture.loadBalancer.type}</span>
          <span className="arch-node__sub">
            {architecture.loadBalancer.algorithm} · Port {architecture.loadBalancer.port}
          </span>
        </div>

        <div className="arch-connector">
          <div className="arch-connector__line" />
          <ArrowRight size={14} className="arch-connector__arrow" />
        </div>

        {/* Backend Cluster */}
        <div className="arch-node arch-node--backend arch-node--cluster">
          <div className="arch-node__icon">
            <Server size={22} />
          </div>
          <span className="arch-node__label">Backend Cluster</span>
          <div className="arch-cluster__instances">
            {architecture.backends.map((b, i) => (
              <div key={i} className="arch-instance">
                <span className="status-dot online" />
                <span>{b.name}</span>
                <code>:{b.port}</code>
              </div>
            ))}
          </div>
          <span className="arch-node__sub arch-node__algo">
            {architecture.algorithm}
          </span>
        </div>

        <div className="arch-connector arch-connector--bidirectional">
          <div className="arch-connector__line arch-connector__line--dashed" />
          <ArrowRight size={14} className="arch-connector__arrow" />
        </div>

        {/* Redis */}
        <div className="arch-node arch-node--redis">
          <div className="arch-node__icon">
            <Database size={22} />
          </div>
          <span className="arch-node__label">Redis</span>
          <span className="arch-node__sub">
            {architecture.redis.host}:{architecture.redis.port}
          </span>
          <span className="arch-node__tag">Shared State</span>
        </div>
      </div>

      {/* Strategies */}
      <div className="arch-strategies">
        <h4 className="arch-strategies__title">Identity Resolution Priority</h4>
        <div className="arch-strategies__list">
          {architecture.strategies.map((s) => (
            <div key={s.name} className="arch-strategy">
              <span className="arch-strategy__priority">{s.priority}</span>
              <span className="arch-strategy__name">{s.name}</span>
              <code className="arch-strategy__header">{s.header}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Monitoring */}
      <div className="arch-monitoring">
        <h4 className="arch-monitoring__title">Monitoring Stack</h4>
        <div className="arch-monitoring__items">
          <div className="arch-monitor-item">
            <BarChart3 size={16} />
            <span>Prometheus</span>
            <code>:{architecture.monitoring.prometheus.port}</code>
          </div>
          <div className="arch-monitor-item">
            <BarChart3 size={16} />
            <span>Grafana</span>
            <code>:{architecture.monitoring.grafana.port}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
