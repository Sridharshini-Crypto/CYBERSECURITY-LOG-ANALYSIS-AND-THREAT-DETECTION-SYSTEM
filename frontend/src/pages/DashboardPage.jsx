import React from 'react'
import {
  FileText,
  ShieldAlert,
  AlertOctagon,
  AlertTriangle,
  Info,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  Upload,
  Clock,
  PieChart as PieIcon,
  BarChart3,
  Layers,
} from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { SeverityBadge } from '../components/SeverityBadge'

const SEVERITY_COLORS = {
  CRITICAL: '#dc2626',
  HIGH: '#ea580c',
  MEDIUM: '#0284c7',
  LOW: '#64748b',
}

const POSTURE_COLORS = {
  'CRITICAL RISK': { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c' },
  'HIGH RISK': { bg: '#fff7ed', border: '#ffedd5', text: '#c2410c' },
  'MODERATE RISK': { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
  'LOW RISK': { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
  SECURE: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
  'AWAITING ANALYSIS': { bg: '#f8fafc', border: '#e2e8f0', text: '#64748b' },
}

export function DashboardPage({
  analysis,
  reports,
  onNavigate,
  onSelectThreat,
  onSelectReport,
  onLoadSample,
}) {
  if (!analysis) {
    return (
      <div className="empty-dashboard-container">
        <div className="empty-card">
          <div className="empty-icon-ring">
            <ShieldCheck size={42} strokeWidth={1.5} />
          </div>
          <h2>No Active Log Analysis</h2>
          <p>
            CYBERGUARD provides rule-based cybersecurity log inspection, detecting SQL Injection,
            XSS, Port Scanning, Suspicious Commands, and Authentication failures.
          </p>
          <div className="empty-actions">
            <button className="btn btn-primary" onClick={() => onNavigate('upload')}>
              <Upload size={16} /> Upload Log File
            </button>
            <button className="btn btn-secondary" onClick={onLoadSample}>
              <Layers size={16} /> Load Sample Log
            </button>
          </div>
        </div>
      </div>
    )
  }

  const severityCounts = analysis.threatsBySeverity || {}
  const critical = analysis.criticalCount ?? severityCounts.CRITICAL ?? 0
  const high = analysis.highCount ?? severityCounts.HIGH ?? 0
  const medium = analysis.mediumCount ?? severityCounts.MEDIUM ?? 0
  const safeEntries = analysis.safeLines ?? Math.max(0, analysis.totalLines - (analysis.suspiciousLines || 0))
  const securityStatus = analysis.securityStatus || 'EVALUATING'

  // Severity Chart Data
  const severityChartData = [
    { name: 'CRITICAL', value: critical },
    { name: 'HIGH', value: high },
    { name: 'MEDIUM', value: medium },
  ].filter((item) => item.value > 0)

  // Category Chart Data
  const categoryChartData = Object.entries(analysis.threatsByType || {}).map(([name, value]) => ({
    name,
    count: value,
  }))

  // Safe vs Suspicious Data
  const safeVsSuspiciousData = [
    { name: 'Safe Records', value: safeEntries, fill: '#16a34a' },
    { name: 'Suspicious Records', value: analysis.suspiciousLines || analysis.totalThreats, fill: '#dc2626' },
  ]

  const postureStyle = POSTURE_COLORS[securityStatus] || POSTURE_COLORS['AWAITING ANALYSIS']

  return (
    <div className="dashboard-content">
      {/* Top Banner Security Status */}
      <div
        className="security-posture-banner"
        style={{
          backgroundColor: postureStyle.bg,
          borderColor: postureStyle.border,
          color: postureStyle.text,
        }}
      >
        <div className="posture-info">
          <div className="posture-indicator">
            <span
              className="posture-dot"
              style={{ backgroundColor: postureStyle.text }}
            />
            <span className="posture-title">OVERALL SECURITY STATUS:</span>
            <strong className="posture-status">{securityStatus}</strong>
          </div>
          <p className="posture-desc">
            File analyzed: <strong>{analysis.fileName}</strong> | Processed{' '}
            <strong>{analysis.totalLines} lines</strong> in {analysis.processingTimeMs} ms using Java SystemLogAnalyzer rules.
          </p>
        </div>
        <div className="posture-action">
          <button className="btn btn-sm btn-outline" onClick={() => onNavigate('analysis')}>
            View Detailed Analysis <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span>TOTAL LOG LINES</span>
            <FileText size={18} />
          </div>
          <div className="stat-number">{analysis.totalLines.toLocaleString()}</div>
          <div className="stat-caption">Total records ingested</div>
        </div>

        <div className="stat-card stat-alert">
          <div className="stat-header">
            <span>THREATS DETECTED</span>
            <ShieldAlert size={18} />
          </div>
          <div className="stat-number text-red">{analysis.totalThreats}</div>
          <div className="stat-caption">{analysis.suspiciousLines || analysis.totalThreats} suspicious line(s)</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>CRITICAL THREATS</span>
            <AlertOctagon size={18} className="text-red" />
          </div>
          <div className="stat-number text-red">{critical}</div>
          <div className="stat-caption">SQL Injection &amp; Severe exploits</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>HIGH THREATS</span>
            <AlertTriangle size={18} className="text-orange" />
          </div>
          <div className="stat-number text-orange">{high}</div>
          <div className="stat-caption">XSS, Commands &amp; Unauthorized</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>MEDIUM THREATS</span>
            <Info size={18} className="text-teal" />
          </div>
          <div className="stat-number text-teal">{medium}</div>
          <div className="stat-caption">Failed logins &amp; Port scans</div>
        </div>

        <div className="stat-card stat-safe">
          <div className="stat-header">
            <span>SAFE ENTRIES</span>
            <ShieldCheck size={18} className="text-green" />
          </div>
          <div className="stat-number text-green">{safeEntries.toLocaleString()}</div>
          <div className="stat-caption">Benign normal traffic</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Chart 1: Threats by Severity */}
        <div className="chart-panel">
          <div className="chart-panel-header">
            <div>
              <span className="panel-kicker">CLASSIFICATION</span>
              <h3>Threats by Severity</h3>
            </div>
            <PieIcon size={18} />
          </div>

          <div className="chart-body">
            {severityChartData.length > 0 ? (
              <div className="donut-chart-container">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={severityChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                    >
                      {severityChartData.map((entry) => (
                        <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] || '#64748b'} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [`${val} threats`, name]}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="chart-legend">
                  {severityChartData.map((item) => (
                    <div key={item.name} className="legend-item">
                      <span
                        className="legend-dot"
                        style={{ backgroundColor: SEVERITY_COLORS[item.name] }}
                      />
                      <span className="legend-label">{item.name}</span>
                      <strong className="legend-count">{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="chart-empty">No threat severities detected.</div>
            )}
          </div>
        </div>

        {/* Chart 2: Safe vs Suspicious Log Entries */}
        <div className="chart-panel">
          <div className="chart-panel-header">
            <div>
              <span className="panel-kicker">PROPORTION</span>
              <h3>Safe vs Suspicious Entries</h3>
            </div>
            <Activity size={18} />
          </div>

          <div className="chart-body">
            <div className="donut-chart-container">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={safeVsSuspiciousData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {safeVsSuspiciousData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} lines`, name]}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: '#16a34a' }} />
                  <span className="legend-label">Safe Log Records</span>
                  <strong className="legend-count">{safeEntries}</strong>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: '#dc2626' }} />
                  <span className="legend-label">Suspicious Records</span>
                  <strong className="legend-count">{analysis.suspiciousLines || analysis.totalThreats}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 3: Threats by Category */}
        <div className="chart-panel chart-panel-full">
          <div className="chart-panel-header">
            <div>
              <span className="panel-kicker">CATEGORIES</span>
              <h3>Threats by Category</h3>
            </div>
            <BarChart3 size={18} />
          </div>

          <div className="chart-body">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={categoryChartData} layout="vertical" margin={{ left: 20, right: 30, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" allowDecimals={false} tickLine={false} stroke="#94a3b8" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={180}
                    tickLine={false}
                    stroke="#475569"
                    tick={{ fontSize: 13 }}
                  />
                  <Tooltip
                    formatter={(val) => [`${val} events`, 'Count']}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="count" fill="#334155" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">No threat categories detected.</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Detections Preview */}
      <div className="panel preview-panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">ACTIVITY AUDIT</span>
            <h3>Recent Detected Security Events</h3>
          </div>
          <button className="btn btn-sm btn-secondary" onClick={() => onNavigate('analysis')}>
            View All ({analysis.threats?.length || 0}) <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="preview-table-wrap">
          <table className="threat-table">
            <thead>
              <tr>
                <th>LINE</th>
                <th>THREAT TYPE</th>
                <th>SEVERITY</th>
                <th>DESCRIPTION</th>
                <th>LOG ENTRY</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {analysis.threats?.slice(0, 5).map((threat, idx) => (
                <tr key={`${threat.lineNumber}-${idx}`}>
                  <td className="font-mono">#{threat.lineNumber}</td>
                  <td><strong>{threat.threatType}</strong></td>
                  <td>
                    <SeverityBadge severity={threat.severity} />
                  </td>
                  <td className="desc-cell">{threat.description}</td>
                  <td className="log-cell font-mono">{threat.logLine}</td>
                  <td>
                    <button
                      className="btn btn-xs btn-outline"
                      onClick={() => onSelectThreat(threat)}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
              {(!analysis.threats || analysis.threats.length === 0) && (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No threats detected in this log file.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

