import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import {
  Activity, AlertOctagon, AlertTriangle, ArrowDownToLine, ArrowUpRight,
  BarChart3, Check, ChevronDown, CircleHelp, FileClock, FileText, Fingerprint,
  LayoutDashboard, LoaderCircle, LockKeyhole, Menu, ScanLine, Shield,
  ShieldAlert, ShieldCheck, Upload, X,
} from 'lucide-react'
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'

const api = axios.create({ baseURL: 'http://localhost:8080/api' })
const navItems = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'analysis', label: 'Log analysis', icon: ScanLine },
  { id: 'reports', label: 'Reports', icon: FileText },
]
const severityColors = { CRITICAL: '#bd493d', HIGH: '#d88b37', MEDIUM: '#2c8b83', LOW: '#65766f' }

function App() {
  const [page, setPage] = useState('dashboard')
  const [reports, setReports] = useState([])
  const [analysis, setAnalysis] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [connected, setConnected] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState('No file selected')
  const fileInput = useRef(null)

  async function refreshReports(preferredId) {
    const { data } = await api.get('/reports')
    setReports(data)
    const nextId = preferredId ?? selectedId ?? data[0]?.id
    setSelectedId(nextId ?? null)
    if (nextId) {
      const report = await api.get(`/reports/${nextId}`)
      setAnalysis(report.data)
    } else {
      setAnalysis(null)
    }
    setConnected(true)
  }

  useEffect(() => {
    let retryTimer
    let active = true
    async function connect() {
      try {
        await refreshReports()
        if (active) setError('')
      } catch {
        if (!active) return
        setConnected(false)
        setError('Backend unavailable. Start the Spring Boot service on port 8080.')
        retryTimer = window.setTimeout(connect, 5000)
      }
    }
    connect()
    return () => {
      active = false
      window.clearTimeout(retryTimer)
    }
  }, [])

  async function retryConnection() {
    try {
      await refreshReports()
      setError('')
    } catch {
      setConnected(false)
      setError('Backend unavailable. Start the Spring Boot service on port 8080.')
    }
  }

  async function selectReport(id) {
    if (!id) return
    setSelectedId(Number(id))
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get(`/reports/${id}`)
      setAnalysis(data)
    } catch {
      setError('Could not load this analysis report.')
    } finally {
      setLoading(false)
    }
  }

  async function uploadFile(event) {
    event.preventDefault()
    const file = fileInput.current?.files?.[0]
    if (!file) {
      setError('Choose a .log or .txt file first.')
      return
    }
    const body = new FormData()
    body.append('file', file)
    setUploading(true)
    setError('')
    try {
      const { data } = await api.post('/logs/upload', body)
      setAnalysis(data)
      setSelectedId(data.reportId)
      await refreshReports(data.reportId)
      setPage('analysis')
      if (fileInput.current) fileInput.current.value = ''
      setSelectedFileName('No file selected')
    } catch (requestError) {
      setError(requestError.response?.data?.details?.join(' ') || 'Upload failed. Check that the backend is running and the file is valid.')
    } finally {
      setUploading(false)
    }
  }

  function downloadReport(id, kind) {
    window.open(`${api.defaults.baseURL}/reports/${id}/${kind}`, '_blank', 'noopener,noreferrer')
  }

  const title = navItems.find((item) => item.id === page)?.label ?? 'Overview'

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <a className="brand" href="#overview" onClick={() => setPage('dashboard')}>
          <span className="brand-mark"><Shield size={19} strokeWidth={2.2} /></span>
          <span className="brand-name">CYBERGUARD<span>LOG INTELLIGENCE</span></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="primary-nav" aria-label="Main navigation">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-link ${page === id ? 'active' : ''}`} onClick={() => { setPage(id); setMenuOpen(false) }}>
              <Icon size={17} strokeWidth={1.8} /><span>{label}</span>
              {id === 'reports' && reports.length > 0 && <span className="nav-count">{reports.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="service-state"><span className={`status-dot ${connected ? 'online' : ''}`} />
            <span>{connected ? 'API connected' : 'API offline'}</span>
            <span className="service-port">:8080</span>
          </div>
          <div className="sidebar-foot"><Fingerprint size={15} /> Local analysis workspace</div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button menu-toggle" aria-label="Open navigation" onClick={() => setMenuOpen(!menuOpen)}><Menu size={19} /></button>
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{title}</strong></div>
          <div className="topbar-right">
            <span className="system-chip"><span className="status-dot online" />SYSTEM READY</span>
            <button className="icon-button help-button" aria-label="About CyberGuard"><CircleHelp size={18} /></button>
            <div className="avatar">CG</div>
          </div>
        </header>

        <div className="content-wrap">
          <div className="page-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> SECURITY OPERATIONS <span className="eyebrow-date">{new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date())}</span></div>
              <h1>{page === 'dashboard' ? 'Threat overview' : page === 'analysis' ? 'Log analysis' : 'Report archive'}</h1>
              <p className="page-subtitle">{page === 'dashboard' ? 'Detection activity across your analyzed log files.' : page === 'analysis' ? 'Inspect uploaded records and classified security events.' : 'Review past analyses and export findings.'}</p>
            </div>
            <div className="heading-actions">
              {reports.length > 0 && <label className="report-select-label"><span>ANALYSIS</span><select value={selectedId ?? ''} onChange={(event) => selectReport(event.target.value)} aria-label="Select analysis report">
                {reports.map((report) => <option value={report.id} key={report.id}>#{report.id} · {report.fileName}</option>)}
              </select><ChevronDown size={14} /></label>}
              <button className="primary-button" onClick={() => setPage('analysis')}><Upload size={15} /> Upload log</button>
            </div>
          </div>

          {error && <div className="alert-banner" role="alert"><AlertTriangle size={17} /><span>{error}</span><button className="retry-button" onClick={retryConnection}>Retry</button><button className="icon-button" aria-label="Dismiss" onClick={() => setError('')}><X size={16} /></button></div>}

          {page === 'dashboard' && <Dashboard analysis={analysis} reports={reports} loading={loading} onAnalyze={() => setPage('analysis')} onSelectReport={selectReport} onDownload={downloadReport} />}
          {page === 'analysis' && <AnalysisView analysis={analysis} uploading={uploading} loading={loading} inputRef={fileInput} selectedFileName={selectedFileName} onFileSelect={(name) => setSelectedFileName(name)} onUpload={uploadFile} onDownload={downloadReport} />}
          {page === 'reports' && <ReportsView reports={reports} onAnalyze={() => setPage('analysis')} onSelect={(id) => { selectReport(id); setPage('analysis') }} onDownload={downloadReport} />}

          <footer className="page-footer"><span>CYBERGUARD <span className="footer-dot">/</span> LOCAL THREAT ANALYSIS</span><span>JAVA 21 <i /> SPRING BOOT <i /> H2</span></footer>
        </div>
      </main>
    </div>
  )
}

function Dashboard({ analysis, reports, loading, onAnalyze, onSelectReport, onDownload }) {
  if (!analysis && !loading) return <EmptyState onAnalyze={onAnalyze} />
  const severity = analysis?.threatsBySeverity ?? {}
  const stats = [
    { label: 'LOG RECORDS', value: analysis?.totalLines ?? '—', icon: FileClock, accent: 'neutral', note: analysis?.fileName ?? 'Awaiting first upload' },
    { label: 'DETECTIONS', value: analysis?.totalThreats ?? '—', icon: ShieldAlert, accent: 'red', note: `${analysis?.suspiciousLines ?? 0} suspicious records` },
    { label: 'CRITICAL', value: severity.CRITICAL ?? 0, icon: AlertOctagon, accent: 'red', note: 'Immediate review' },
    { label: 'HIGH + MEDIUM', value: (severity.HIGH ?? 0) + (severity.MEDIUM ?? 0), icon: Activity, accent: 'amber', note: 'Elevated priority' },
  ]
  const severityData = ['CRITICAL', 'HIGH', 'MEDIUM'].map((name) => ({ name, value: severity[name] ?? 0 }))
  const typeData = Object.entries(analysis?.threatsByType ?? {}).map(([name, value]) => ({ name, value }))

  return <>
    <section className="stat-grid">
      {stats.map(({ label, value, icon: Icon, accent, note }, index) => <article className={`stat-card stat-${accent}`} key={label} style={{ animationDelay: `${index * 65}ms` }}>
        <div className="stat-top"><span>{label}</span><Icon size={17} strokeWidth={1.7} /></div>
        <div className="stat-value">{loading ? <LoaderCircle className="spin" size={25} /> : value}</div>
        <div className="stat-note">{note}</div>
      </article>)}
    </section>
    <section className="dashboard-grid">
      <article className="panel severity-panel">
        <div className="panel-heading"><div><span className="panel-kicker">CLASSIFICATION</span><h2>Severity distribution</h2></div><span className="panel-icon"><BarChart3 size={17} /></span></div>
        {analysis?.totalThreats ? <div className="severity-content">
          <div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={severityData} dataKey="value" nameKey="name" innerRadius="67%" outerRadius="91%" paddingAngle={3} stroke="none">{severityData.map((entry) => <Cell key={entry.name} fill={severityColors[entry.name]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="donut-center"><strong>{analysis.totalThreats}</strong><span>EVENTS</span></div></div>
          <div className="severity-legend">{severityData.map((entry) => <div className="legend-row" key={entry.name}><span className="legend-name"><i style={{ background: severityColors[entry.name] }} />{entry.name}</span><strong>{entry.value}</strong></div>)}<div className="legend-foot">PROCESSING TIME <b>{analysis.processingTimeMs} ms</b></div></div>
        </div> : <div className="chart-empty">No detections in this analysis.</div>}
      </article>
      <article className="panel type-panel">
        <div className="panel-heading"><div><span className="panel-kicker">SIGNATURES</span><h2>Events by threat type</h2></div><span className="panel-icon"><Activity size={17} /></span></div>
        {typeData.length ? <div className="bar-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={typeData} layout="vertical" margin={{ left: 4, right: 16, top: 5, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke="#e9ece9" /><XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#87908b', fontSize: 11 }} /><YAxis type="category" dataKey="name" width={146} axisLine={false} tickLine={false} tick={{ fill: '#535e58', fontSize: 11 }} /><Tooltip cursor={{ fill: '#f1f3f0' }} /><Bar dataKey="value" fill="#3b8b7f" radius={[0, 3, 3, 0]} barSize={13} />
        </BarChart></ResponsiveContainer></div> : <div className="chart-empty">Threat categories appear here after analysis.</div>}
      </article>
      <article className="panel recent-panel">
        <div className="panel-heading"><div><span className="panel-kicker">LATEST SIGNALS</span><h2>Recent detections</h2></div><button className="text-button" onClick={onAnalyze}>Open analysis <ArrowUpRight size={14} /></button></div>
        {analysis?.threats?.length ? <div className="recent-list">{analysis.threats.slice(0, 5).map((threat, index) => <ThreatRow key={`${threat.lineNumber}-${threat.threatType}-${index}`} threat={threat} />)}</div> : <div className="chart-empty">No threat events to show.</div>}
      </article>
      <article className="panel latest-panel">
        <div className="panel-heading"><div><span className="panel-kicker">ARCHIVE</span><h2>Recent analyses</h2></div><button className="text-button" onClick={() => onDownload(analysis?.reportId, 'summary')} disabled={!analysis}>Summary <ArrowDownToLine size={14} /></button></div>
        <div className="archive-list">{reports.slice(0, 4).map((report) => <button className="archive-row" key={report.id} onClick={() => onSelectReport(report.id)}><span className="file-icon"><FileText size={16} /></span><span className="archive-info"><b>{report.fileName}</b><small>{new Date(report.analyzedAt).toLocaleString()}</small></span><span className="archive-threats">{report.totalThreats}<small>events</small></span><ArrowUpRight size={14} className="archive-arrow" /></button>)}</div>
      </article>
    </section>
  </>
}

function AnalysisView({ analysis, uploading, loading, inputRef, selectedFileName, onFileSelect, onUpload, onDownload }) {
  return <section className="analysis-layout">
    <form className="upload-strip" onSubmit={onUpload}>
      <div className="upload-badge"><Upload size={19} /></div>
      <div className="upload-copy"><strong>Analyze a log file</strong><span>UTF-8 text files · .log or .txt · up to 25 MB</span></div>
      <input ref={inputRef} type="file" accept=".log,.txt,text/plain" aria-label="Select log file" onChange={(event) => onFileSelect(event.target.files?.[0]?.name ?? 'No file selected')} />
      <button className="secondary-button" type="button" onClick={() => inputRef.current?.click()}><FileText size={15} /> Choose file</button>
      <span className="upload-filename">{selectedFileName}</span>
      <button className="primary-button" type="submit" disabled={uploading}>{uploading ? <LoaderCircle className="spin" size={15} /> : <ScanLine size={15} />}{uploading ? 'Analyzing' : 'Run analysis'}</button>
    </form>
    {analysis ? <>
      <div className="results-bar"><div><span className="panel-kicker">ANALYSIS RESULT</span><h2>{analysis.fileName} <span className="record-count">{analysis.totalLines} records</span></h2></div><div className="results-actions"><span className="processing-time"><Activity size={14} /> {analysis.processingTimeMs} ms</span><button className="secondary-button" onClick={() => onDownload(analysis.reportId, 'csv')}><ArrowDownToLine size={15} /> CSV</button><button className="secondary-button" onClick={() => onDownload(analysis.reportId, 'summary')}><FileText size={15} /> Summary</button></div></div>
      <div className="table-wrap"><table><thead><tr><th>LINE</th><th>THREAT TYPE</th><th>SEVERITY</th><th>DESCRIPTION</th><th>LOG ENTRY</th></tr></thead><tbody>
        {analysis.threats?.map((threat, index) => <tr key={`${threat.lineNumber}-${threat.threatType}-${index}`}><td className="line-number">{String(threat.lineNumber).padStart(4, '0')}</td><td className="threat-type">{threat.threatType}</td><td><SeverityPill value={threat.severity} /></td><td className="description-cell">{threat.description}</td><td className="log-entry">{threat.logLine}</td></tr>)}
        {!analysis.threats?.length && <tr><td colSpan="5" className="no-rows"><ShieldCheck size={18} /> No threats detected across {analysis.totalLines} records.</td></tr>}
      </tbody></table></div>
      <div className="table-footer"><span>Showing <b>{analysis.threats?.length ?? 0}</b> detected events</span><span><span className="status-dot online" /> SAVED TO REPORT #{analysis.reportId}</span></div>
    </> : <div className="analysis-empty"><ScanLine size={27} /><h2>{loading ? 'Loading analysis' : 'No analysis selected'}</h2><p>Upload a log file to inspect its records and security events.</p></div>}
  </section>
}

function ReportsView({ reports, onAnalyze, onSelect, onDownload }) {
  if (!reports.length) return <EmptyState onAnalyze={onAnalyze} />
  return <section className="panel reports-panel"><div className="panel-heading"><div><span className="panel-kicker">SAVED TO H2</span><h2>Analysis history</h2></div><span className="report-total">{reports.length} {reports.length === 1 ? 'REPORT' : 'REPORTS'}</span></div>
    <div className="report-list">{reports.map((report) => <article className="report-item" key={report.id}><span className="report-file"><FileText size={19} /></span><div className="report-meta"><b>{report.fileName}</b><span>Report #{report.id} <i /> {new Date(report.analyzedAt).toLocaleString()}</span></div><div className="report-metric"><b>{report.totalLines.toLocaleString()}</b><small>RECORDS</small></div><div className="report-metric report-metric-threat"><b>{report.totalThreats.toLocaleString()}</b><small>THREATS</small></div><div className="report-metric"><b>{report.processingTimeMs} ms</b><small>PROCESSING</small></div><div className="report-actions"><button className="icon-button" title="Open report" aria-label={`Open report ${report.id}`} onClick={() => onSelect(report.id)}><ArrowUpRight size={16} /></button><button className="icon-button" title="Download CSV" aria-label={`Download CSV for report ${report.id}`} onClick={() => onDownload(report.id, 'csv')}><ArrowDownToLine size={16} /></button><button className="icon-button" title="Download summary" aria-label={`Download summary for report ${report.id}`} onClick={() => onDownload(report.id, 'summary')}><FileText size={16} /></button></div></article>)}</div>
  </section>
}

function ThreatRow({ threat }) {
  return <div className="recent-row"><span className="recent-line">L{String(threat.lineNumber).padStart(3, '0')}</span><div className="recent-copy"><b>{threat.threatType}</b><span>{threat.logLine}</span></div><SeverityPill value={threat.severity} /></div>
}

function SeverityPill({ value }) {
  return <span className={`severity-pill severity-${value?.toLowerCase()}`}><i />{value}</span>
}

function EmptyState({ onAnalyze }) {
  return <section className="welcome-panel"><div className="welcome-art"><span className="art-ring ring-one" /><span className="art-ring ring-two" /><span className="art-shield"><ShieldCheck size={39} strokeWidth={1.25} /></span><span className="art-scan" /></div><div className="welcome-copy"><span className="panel-kicker">READY FOR INPUT</span><h2>Start with a log file.</h2><p>Upload a system or application log to identify suspicious activity and build your first analysis report.</p><button className="primary-button" onClick={onAnalyze}><Upload size={15} /> Open log analysis</button></div><div className="welcome-meta"><span><LockKeyhole size={14} /> Local H2 persistence</span><span><Activity size={14} /> Concurrent analysis</span><span><Check size={14} /> Six detection signatures</span></div></section>
}

export default App
