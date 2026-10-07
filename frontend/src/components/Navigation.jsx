import React from 'react'
import {
  LayoutDashboard,
  Upload,
  ScanLine,
  FileText,
  Info,
  Shield,
  Fingerprint,
} from 'lucide-react'

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'upload', label: 'Upload Logs', icon: Upload },
  { id: 'analysis', label: 'Analysis', icon: ScanLine },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'about', label: 'About', icon: Info },
]

export function Navigation({ activePage, onNavigate, reportsCount, apiConnected, menuOpen, onCloseMenu }) {
  return (
    <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
      <div className="brand-block" onClick={() => onNavigate('dashboard')} role="button" tabIndex={0}>
        <div className="brand-logo">
          <Shield size={22} strokeWidth={2.4} />
        </div>
        <div className="brand-text">
          <span className="brand-title">CYBERGUARD</span>
          <span className="brand-subtitle">THREAT DETECTION SYSTEM</span>
        </div>
      </div>

      <div className="nav-group-label">NAVIGATION</div>

      <nav className="primary-nav" aria-label="Main Navigation">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${activePage === id ? 'active' : ''}`}
            onClick={() => {
              onNavigate(id)
              if (onCloseMenu) onCloseMenu()
            }}
          >
            <Icon size={18} strokeWidth={1.9} />
            <span className="nav-label">{label}</span>
            {id === 'reports' && reportsCount > 0 && (
              <span className="nav-counter">{reportsCount}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="api-status-badge">
          <span className={`status-circle ${apiConnected ? 'online' : 'offline'}`} />
          <span className="status-text">{apiConnected ? 'Backend Connected' : 'Backend Offline'}</span>
          <span className="port-tag">:8080</span>
        </div>
        <div className="system-tag">
          <Fingerprint size={14} />
          <span>Java Rule Detection</span>
        </div>
      </div>
    </aside>
  )
}

