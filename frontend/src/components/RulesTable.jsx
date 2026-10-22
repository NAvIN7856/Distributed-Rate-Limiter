import { Shield, Clock, Route } from "lucide-react";
import "./RulesTable.css";

export default function RulesTable({ rules, defaultRule }) {
  if (!rules || rules.length === 0) {
    return (
      <div className="rules-panel glass-card">
        <div className="rules-panel__header">
          <Shield size={18} />
          <h3>Rate Limit Rules</h3>
        </div>
        <div className="rules-panel__empty">
          <p>No rules configured</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rules-panel glass-card">
      <div className="rules-panel__header">
        <div className="rules-panel__title">
          <Shield size={18} />
          <h3>Rate Limit Rules</h3>
        </div>
        {defaultRule && (
          <div className="rules-panel__default">
            Default: <strong>{defaultRule.limit}</strong> req / <strong>{defaultRule.window}s</strong>
          </div>
        )}
      </div>

      <div className="rules-table-wrap">
        <table className="rules-table">
          <thead>
            <tr>
              <th>Endpoint</th>
              <th>Method</th>
              <th>
                <Clock size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Window
              </th>
              <th>
                <Route size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Limit
              </th>
              <th>Rate</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule, i) => (
              <tr key={rule.id} style={{ animationDelay: `${i * 0.05}s` }}>
                <td>
                  <code className="endpoint-code">{rule.path}</code>
                </td>
                <td>
                  <span className={`method-badge ${rule.method.toLowerCase()}`}>
                    {rule.method}
                  </span>
                </td>
                <td className="mono">{rule.window}s</td>
                <td>
                  <span className="limit-badge">{rule.limit}</span>
                </td>
                <td className="mono rate-cell">
                  {(rule.limit / rule.window).toFixed(1)}/s
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
