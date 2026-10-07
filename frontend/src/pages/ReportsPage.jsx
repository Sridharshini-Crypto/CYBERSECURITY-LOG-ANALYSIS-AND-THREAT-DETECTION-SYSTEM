import React, { useState, useEffect } from 'react'
import {
  FileText,
  Download,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  Terminal,
  ExternalLink,
  RefreshCw,
} from 'lucide-react'
import { logService } from '../services/api'

export function ReportsPage({
  analysis,
  reports,
  onSelectReport,
  onDownloadCsv,
  onDownloadSummary,
}) {
  const [reportText, setReportText] = useState('')
  const [loadingText, setLoadingText] = useState(false)
  const [copied, setCopied] = useState(false)
  const activeReportId = analysis?.reportId || reports[0]?.id

  useEffect(() => {
    if (activeReportId) {
      loadTextSummary(activeReportId)
    }
  }, [activeReportId])

  const loadTextSummary = async (id) => {
    setLoadingText(true)
    try {
      const text = await logService.getSummaryText(id)
      setReportText(text)
    } catch (err) {
      setReportText('Could not load text report from server. Ensure backend is running.')
    } finally {
      setLoadingText(false)
    }
  }

  const handleCopy = () => {
    if (reportText) {
      navigator.clipboard.writeText(reportText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="reports-page-container">
      <div className="reports-header-block">
        <div>
          <h2>Security Analysis Reports</h2>
          <p>
            Generated using the Java <code>ReportGenerator</code> class. Download formatted CSV reports for spreadsheet auditing or text summaries for incident documentation.
          </p>
        </div>
      </div>

      {analysis ? (
        <div className="reports-main-grid">
          {/* Latest Analysis Overview Card */}
          <div className="panel report-summary-card">
            <div className="panel-header">
              <div>
                <span className="panel-kicker">LATEST ANALYSIS</span>
                <h3>{analysis.fileName}</h3>
              </div>
              <span className="report-badge">Report #{analysis.reportId}</span>
            </div>

            <div className="report-metrics-row">
              <div className="metric-box">
                <span className="metric-title">TOTAL RECORDS</span>
                <strong>{analysis.totalLines}</strong>
              </div>
              <div className="metric-box">
                <span className="metric-title">THREATS FOUND</span>
                <strong className="text-red">{analysis.totalThreats}</strong>
              </div>
              <div className="metric-box">
                <span className="metric-title">SAFE RECORDS</span>
                <strong className="text-green">{analysis.safeLines}</strong>
              </div>
              <div className="metric-box">
                <span className="metric-title">PROCESSING TIME</span>
                <strong>{analysis.processingTimeMs} ms</strong>
              </div>
            </div>

            <div className="download-buttons-group">
              <button
                className="btn btn-primary"
                onClick={() => onDownloadCsv(analysis.reportId)}
              >
                <Download size={16} /> Download CSV Report (.csv)
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => onDownloadSummary(analysis.reportId)}
              >
                <Download size={16} /> Download Text Summary (.txt)
              </button>
            </div>
          </div>

          {/* Interactive Text Report Viewer */}
          <div className="panel terminal-report-panel">
            <div className="panel-header">
              <div className="terminal-title-group">
                <Terminal size={17} />
                <h3>Live Text Report Preview (ReportGenerator Output)</h3>
              </div>
              <div className="terminal-actions">
                <button
                  className="btn btn-xs btn-outline"
                  onClick={() => loadTextSummary(analysis.reportId)}
                  disabled={loadingText}
                >
                  <RefreshCw size={13} className={loadingText ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
                <button
                  className="btn btn-xs btn-secondary"
                  onClick={handleCopy}
                  disabled={!reportText}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                </button>
              </div>
            </div>

            <div className="terminal-content">
              {loadingText ? (
                <div className="terminal-loading">Loading report output...</div>
              ) : (
                <pre className="terminal-pre">{reportText}</pre>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="panel empty-card">
          <FileText size={38} className="text-muted" />
          <h3>No Analysis Reports Generated Yet</h3>
          <p>Upload a log file to generate downloadable CSV and text audit reports.</p>
        </div>
      )}

      {/* Analysis History Archive */}
      {reports && reports.length > 0 && (
        <div className="panel history-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">LOCAL ARCHIVE</span>
              <h3>Past Analysis Reports (MySQL Database)</h3>
            </div>
            <span className="total-reports-pill">{reports.length} Reports Saved</span>
          </div>

          <div className="history-table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>REPORT ID</th>
                  <th>FILE NAME</th>
                  <th>TOTAL RECORDS</th>
                  <th>THREATS DETECTED</th>
                  <th>PROCESSING TIME</th>
                  <th>ANALYZED DATE</th>
                  <th style={{ textAlign: 'right' }}>DOWNLOADS</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className={report.id === activeReportId ? 'row-active' : ''}>
                    <td className="font-mono">#{report.id}</td>
                    <td>
                      <button
                        className="file-link-btn"
                        onClick={() => onSelectReport(report.id)}
                        title="Click to view this report"
                      >
                        <strong>{report.fileName}</strong>
                      </button>
                    </td>
                    <td>{report.totalLines.toLocaleString()}</td>
                    <td>
                      <strong className={report.totalThreats > 0 ? 'text-red' : 'text-green'}>
                        {report.totalThreats}
                      </strong>
                    </td>
                    <td>{report.processingTimeMs} ms</td>
                    <td className="text-muted">
                      {new Date(report.analyzedAt).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="history-action-group">
                        <button
                          className="btn btn-xs btn-outline"
                          onClick={() => onDownloadCsv(report.id)}
                          title="Download CSV"
                        >
                          <Download size={12} /> CSV
                        </button>
                        <button
                          className="btn btn-xs btn-outline"
                          onClick={() => onDownloadSummary(report.id)}
                          title="Download Text Summary"
                        >
                          <FileText size={12} /> TXT
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

