import React, { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  Download,
  FileText,
  Upload,
  ArrowUpDown,
  ShieldAlert,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  Eye,
  RefreshCw,
  Clock,
} from 'lucide-react'
import { SeverityBadge } from '../components/SeverityBadge'
import { ThreatDetailsModal } from '../components/ThreatDetailsModal'

const THREAT_TYPES = [
  'All Types',
  'SQL Injection',
  'Cross-Site Scripting (XSS)',
  'Suspicious Command',
  'Port Scanning',
  'Failed Login',
  'Unauthorized Access',
]

const SEVERITIES = ['All Severities', 'CRITICAL', 'HIGH', 'MEDIUM']

export function AnalysisPage({
  analysis,
  onNavigate,
  onDownloadCsv,
  onGenerateReport,
  onSelectThreat,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState('All Severities')
  const [selectedType, setSelectedType] = useState('All Types')
  const [sortBy, setSortBy] = useState('lineAsc')
  const [activeModalThreat, setActiveModalThreat] = useState(null)

  if (!analysis) {
    return (
      <div className="empty-analysis-container">
        <div className="empty-card">
          <ShieldAlert size={40} className="text-muted" />
          <h2>No Active Analysis Results</h2>
          <p>Upload a log file to view detailed line-by-line security findings and IOC analysis.</p>
          <button className="btn btn-primary" onClick={() => onNavigate('upload')}>
            <Upload size={16} /> Go to Upload Logs
          </button>
        </div>
      </div>
    )
  }

  const threats = analysis.threats || []
  const severityCounts = analysis.threatsBySeverity || {}
  const critical = analysis.criticalCount ?? severityCounts.CRITICAL ?? 0
  const high = analysis.highCount ?? severityCounts.HIGH ?? 0
  const medium = analysis.mediumCount ?? severityCounts.MEDIUM ?? 0
  const safeEntries =
    analysis.safeLines ?? Math.max(0, analysis.totalLines - (analysis.suspiciousLines || 0))

  // Filter and Sort Threats
  const filteredThreats = useMemo(() => {
    return threats
      .filter((threat) => {
        // Search filter
        const query = searchQuery.toLowerCase().trim()
        const matchesSearch =
          !query ||
          String(threat.lineNumber).includes(query) ||
          (threat.threatType && threat.threatType.toLowerCase().includes(query)) ||
          (threat.description && threat.description.toLowerCase().includes(query)) ||
          (threat.logLine && threat.logLine.toLowerCase().includes(query))

        // Severity filter
        const matchesSeverity =
          selectedSeverity === 'All Severities' ||
          (threat.severity && threat.severity.toUpperCase() === selectedSeverity.toUpperCase())

        // Type filter
        const matchesType =
          selectedType === 'All Types' ||
          (threat.threatType && threat.threatType.toLowerCase() === selectedType.toLowerCase())

        return matchesSearch && matchesSeverity && matchesType
      })
      .sort((a, b) => {
        if (sortBy === 'lineAsc') return a.lineNumber - b.lineNumber
        if (sortBy === 'lineDesc') return b.lineNumber - a.lineNumber
        if (sortBy === 'severity') {
          const rank = { CRITICAL: 3, HIGH: 2, MEDIUM: 1, LOW: 0 }
          return (rank[b.severity] || 0) - (rank[a.severity] || 0)
        }
        if (sortBy === 'type') {
          return (a.threatType || '').localeCompare(b.threatType || '')
        }
        return 0
      })
  }, [threats, searchQuery, selectedSeverity, selectedType, sortBy])

  return (
    <div className="analysis-page-container">
      {/* Top Results Metrics Header */}
      <div className="analysis-summary-bar">
        <div className="file-meta-header">
          <div className="file-badge">
            <span className="file-label">ANALYZED FILE</span>
            <h3>{analysis.fileName}</h3>
          </div>
          <div className="file-stats">
            <span className="processing-pill">
              <Clock size={13} /> {analysis.processingTimeMs} ms
            </span>
            <span className="report-id-pill">Report #{analysis.reportId}</span>
          </div>
        </div>

        <div className="summary-badges-row">
          <div className="summary-pill">
            <span className="pill-title">Total Lines</span>
            <strong>{analysis.totalLines}</strong>
          </div>
          <div className="summary-pill pill-alert">
            <span className="pill-title">Total Threats</span>
            <strong className="text-red">{analysis.totalThreats}</strong>
          </div>
          <div className="summary-pill pill-critical">
            <span className="pill-title">Critical</span>
            <strong className="text-red">{critical}</strong>
          </div>
          <div className="summary-pill pill-high">
            <span className="pill-title">High</span>
            <strong className="text-orange">{high}</strong>
          </div>
          <div className="summary-pill pill-medium">
            <span className="pill-title">Medium</span>
            <strong className="text-teal">{medium}</strong>
          </div>
          <div className="summary-pill pill-safe">
            <span className="pill-title">Safe Entries</span>
            <strong className="text-green">{safeEntries}</strong>
          </div>
        </div>
      </div>

      {/* Main Actions Bar */}
      <div className="analysis-action-bar">
        <div className="action-buttons-group">
          <button className="btn btn-secondary" onClick={onExportCsvClick}>
            <Download size={15} /> Export CSV
          </button>
          <button className="btn btn-secondary" onClick={() => onGenerateReport(analysis.reportId)}>
            <FileText size={15} /> Generate Report
          </button>
          <button className="btn btn-outline" onClick={() => onNavigate('upload')}>
            <Upload size={15} /> Analyze Another File
          </button>
        </div>
      </div>

      {/* Filters & Search Controls */}
      <div className="controls-panel">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by line #, keyword, attack signature, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              ×
            </button>
          )}
        </div>

        <div className="filters-group">
          <div className="filter-select-wrapper">
            <Filter size={14} className="filter-icon" />
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              aria-label="Filter by Severity"
            >
              {SEVERITIES.map((sev) => (
                <option key={sev} value={sev}>
                  {sev}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrapper">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              aria-label="Filter by Threat Type"
            >
              {THREAT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrapper">
            <ArrowUpDown size={14} className="filter-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort Order"
            >
              <option value="lineAsc">Line Number (Ascending)</option>
              <option value="lineDesc">Line Number (Descending)</option>
              <option value="severity">Severity (Critical First)</option>
              <option value="type">Threat Type (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Threats Table */}
      <div className="panel table-panel">
        <div className="table-responsive">
          <table className="analysis-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>LINE #</th>
                <th style={{ width: '190px' }}>THREAT TYPE</th>
                <th style={{ width: '110px' }}>SEVERITY</th>
                <th style={{ width: '260px' }}>DESCRIPTION</th>
                <th>ORIGINAL LOG ENTRY</th>
                <th style={{ width: '110px', textAlign: 'center' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredThreats.map((threat, index) => (
                <tr
                  key={`${threat.lineNumber}-${index}`}
                  className="threat-row"
                  onClick={() => setActiveModalThreat(threat)}
                >
                  <td className="font-mono line-col">
                    #{String(threat.lineNumber).padStart(4, '0')}
                  </td>
                  <td className="threat-type-col">
                    <strong>{threat.threatType}</strong>
                  </td>
                  <td>
                    <SeverityBadge severity={threat.severity} />
                  </td>
                  <td className="desc-col">{threat.description}</td>
                  <td className="log-col">
                    <code className="log-snippet">{threat.logLine}</code>
                  </td>
                  <td className="action-col" style={{ textAlign: 'center' }}>
                    <button
                      className="btn btn-xs btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveModalThreat(threat)
                      }}
                      title="View threat details and recommended actions"
                    >
                      <Eye size={12} /> Details
                    </button>
                  </td>
                </tr>
              ))}

              {filteredThreats.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-results-cell">
                    <CheckCircle2 size={24} className="text-green" />
                    <p>No threats matched the current filters.</p>
                    {(searchQuery || selectedSeverity !== 'All Severities' || selectedType !== 'All Types') && (
                      <button
                        className="btn btn-xs btn-outline"
                        onClick={() => {
                          setSearchQuery('')
                          setSelectedSeverity('All Severities')
                          setSelectedType('All Types')
                        }}
                      >
                        Reset Filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer-status">
          <span>
            Showing <strong>{filteredThreats.length}</strong> of{' '}
            <strong>{threats.length}</strong> detected threat events
          </span>
          <span className="source-note">Analyzed by Java Rule Engine</span>
        </div>
      </div>

      {/* Threat Details Modal */}
      {activeModalThreat && (
        <ThreatDetailsModal
          threat={activeModalThreat}
          onClose={() => setActiveModalThreat(null)}
        />
      )}
    </div>
  )

  function onExportCsvClick() {
    onDownloadCsv(analysis.reportId)
  }
}

