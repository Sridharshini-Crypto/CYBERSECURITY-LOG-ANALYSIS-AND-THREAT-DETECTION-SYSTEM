import React, { useState, useEffect } from 'react'
import {
  Menu,
  Upload,
  AlertTriangle,
  X,
  ChevronDown,
  Shield,
  Layers,
  RotateCw,
  Info,
} from 'lucide-react'
import { Navigation, NAV_ITEMS } from './components/Navigation'
import { DashboardPage } from './pages/DashboardPage'
import { UploadLogsPage } from './pages/UploadLogsPage'
import { AnalysisPage } from './pages/AnalysisPage'
import { ReportsPage } from './pages/ReportsPage'
import { AboutPage } from './pages/AboutPage'
import { ThreatDetailsModal } from './components/ThreatDetailsModal'
import { logService } from './services/api'

export function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [reports, setReports] = useState([])
  const [analysis, setAnalysis] = useState(null)
  const [selectedReportId, setSelectedReportId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [apiConnected, setApiConnected] = useState(false)
  const [globalError, setGlobalError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedThreatModal, setSelectedThreatModal] = useState(null)

  // Fetch past reports and latest report on load
  const refreshReports = async (preferredId) => {
    try {
      const data = await logService.getReports()
      setReports(data || [])
      setApiConnected(true)

      const targetId = preferredId ?? selectedReportId ?? data[0]?.id
      if (targetId) {
        setSelectedReportId(targetId)
        const activeReport = await logService.getReportById(targetId)
        setAnalysis(activeReport)
      } else {
        setAnalysis(null)
      }
      setGlobalError('')
    } catch (err) {
      setApiConnected(false)
      setGlobalError(
        'Cannot connect to Spring Boot backend at http://localhost:8080. Please ensure the backend is started.'
      )
    }
  }

  useEffect(() => {
    refreshReports()
  }, [])

  const handleSelectReport = async (id) => {
    if (!id) return
    const numId = Number(id)
    setSelectedReportId(numId)
    setLoading(true)
    try {
      const data = await logService.getReportById(numId)
      setAnalysis(data)
      setGlobalError('')
    } catch (err) {
      setGlobalError(`Failed to load report #${id}.`)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file) => {
    setLoading(true)
    setGlobalError('')
    try {
      const result = await logService.analyzeLogFile(file)
      setAnalysis(result)
      setSelectedReportId(result.reportId)
      await refreshReports(result.reportId)
      setActivePage('analysis')
      return result
    } catch (err) {
      throw err
    } finally {
      setLoading(false)
    }
  }

  const handleLoadSample = async () => {
    setLoading(true)
    setGlobalError('')
    try {
      const result = await logService.analyzeSampleLog()
      setAnalysis(result)
      setSelectedReportId(result.reportId)
      await refreshReports(result.reportId)
      setActivePage('analysis')
      return result
    } catch (err) {
      setGlobalError('Failed to load sample log from server.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadCsv = (reportId) => {
    const id = reportId || analysis?.reportId
    if (!id) return
    window.open(logService.getCsvDownloadUrl(id), '_blank')
  }

  const handleDownloadSummary = (reportId) => {
    const id = reportId || analysis?.reportId
    if (!id) return
    window.open(logService.getSummaryDownloadUrl(id), '_blank')
  }

  const handleGenerateReport = (reportId) => {
    if (reportId) {
      handleSelectReport(reportId)
    }
    setActivePage('reports')
  }

  const currentPageTitle =
    NAV_ITEMS.find((item) => item.id === activePage)?.label || 'Dashboard'

  return (
    <div className="cyberguard-shell">
      {/* Sidebar Navigation */}
      <Navigation
        activePage={activePage}
        onNavigate={(page) => {
          setActivePage(page)
          setMenuOpen(false)
        }}
        reportsCount={reports.length}
        apiConnected={apiConnected}
        menuOpen={menuOpen}
        onCloseMenu={() => setMenuOpen(false)}
      />

      {/* Main Content Area */}
      <main className="main-viewport">
        {/* Top Header Bar */}
        <header className="topbar-container">
          <div className="topbar-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
            >
              <Menu size={20} />
            </button>
            <div className="breadcrumbs">
              <span className="crumb-root">CYBERGUARD</span>
              <span className="crumb-separator">/</span>
              <span className="crumb-current">{currentPageTitle}</span>
            </div>
          </div>

          <div className="topbar-right">
            {reports.length > 0 && (
              <div className="report-quick-select">
                <span className="select-label">ACTIVE AUDIT:</span>
                <select
                  value={selectedReportId || ''}
                  onChange={(e) => handleSelectReport(e.target.value)}
                  aria-label="Select report"
                >
                  {reports.map((r) => (
                    <option key={r.id} value={r.id}>
                      #{r.id} · {r.fileName}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="select-chevron" />
              </div>
            )}

            <button
              className="btn btn-sm btn-outline"
              onClick={() => refreshReports(selectedReportId)}
              title="Refresh connection and data"
            >
              <RotateCw size={14} />
            </button>

            {activePage !== 'upload' && (
              <button
                className="btn btn-sm btn-primary"
                onClick={() => setActivePage('upload')}
              >
                <Upload size={14} /> Upload Logs
              </button>
            )}
          </div>
        </header>

        {/* Global Error Alert Banner */}
        {globalError && (
          <div className="global-alert-banner" role="alert">
            <AlertTriangle size={18} />
            <span>{globalError}</span>
            <button
              className="btn btn-xs btn-outline-light retry-btn"
              onClick={() => refreshReports(selectedReportId)}
            >
              Retry Connection
            </button>
            <button
              className="alert-dismiss-btn"
              onClick={() => setGlobalError('')}
              aria-label="Dismiss error"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Page Content Viewport */}
        <div className="page-body-container">
          {activePage === 'dashboard' && (
            <DashboardPage
              analysis={analysis}
              reports={reports}
              onNavigate={setActivePage}
              onSelectThreat={setSelectedThreatModal}
              onSelectReport={handleSelectReport}
              onLoadSample={handleLoadSample}
            />
          )}

          {activePage === 'upload' && (
            <UploadLogsPage
              onUploadSuccess={handleFileUpload}
              onLoadSample={handleLoadSample}
              onError={setGlobalError}
            />
          )}

          {activePage === 'analysis' && (
            <AnalysisPage
              analysis={analysis}
              onNavigate={setActivePage}
              onDownloadCsv={handleDownloadCsv}
              onGenerateReport={handleGenerateReport}
              onSelectThreat={setSelectedThreatModal}
            />
          )}

          {activePage === 'reports' && (
            <ReportsPage
              analysis={analysis}
              reports={reports}
              onSelectReport={handleSelectReport}
              onDownloadCsv={handleDownloadCsv}
              onDownloadSummary={handleDownloadSummary}
            />
          )}

          {activePage === 'about' && <AboutPage />}
        </div>

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-left">
            <strong>CYBERGUARD</strong> — Cybersecurity Log Analysis and Threat Detection System
          </div>
          <div className="footer-right">
            <span>Java 21 / Spring Boot 3.4</span>
            <span className="dot-divider">•</span>
            <span>React 18 + Vite</span>
            <span className="dot-divider">•</span>
            <span>College PBL Full-Stack Architecture</span>
          </div>
        </footer>
      </main>

      {/* Global Threat Details Modal */}
      {selectedThreatModal && (
        <ThreatDetailsModal
          threat={selectedThreatModal}
          onClose={() => setSelectedThreatModal(null)}
        />
      )}
    </div>
  )
}

export default App
