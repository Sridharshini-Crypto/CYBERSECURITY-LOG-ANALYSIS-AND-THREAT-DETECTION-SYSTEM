import React, { useState } from 'react'
import {
  X,
  Copy,
  Check,
  ShieldAlert,
  AlertTriangle,
  Terminal,
  Lightbulb,
  FileText,
  Hash,
} from 'lucide-react'
import { SeverityBadge } from './SeverityBadge'

export function ThreatDetailsModal({ threat, onClose }) {
  const [copied, setCopied] = useState(false)

  if (!threat) return null

  const copyToClipboard = () => {
    if (threat.logLine) {
      navigator.clipboard.writeText(threat.logLine)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon">
              <ShieldAlert size={20} />
            </span>
            <div>
              <h3>Security Incident Details</h3>
              <p className="modal-subtitle">Threat Detection Audit Record</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-grid">
            <div className="meta-card">
              <span className="meta-label">
                <ShieldAlert size={14} /> Threat Type
              </span>
              <span className="meta-value threat-name">{threat.threatType}</span>
            </div>

            <div className="meta-card">
              <span className="meta-label">
                <AlertTriangle size={14} /> Severity Classification
              </span>
              <div className="meta-value">
                <SeverityBadge severity={threat.severity} />
              </div>
            </div>

            <div className="meta-card">
              <span className="meta-label">
                <Hash size={14} /> Line Number
              </span>
              <span className="meta-value font-mono">#{threat.lineNumber}</span>
            </div>

            <div className="meta-card">
              <span className="meta-label">
                <FileText size={14} /> Detection Engine
              </span>
              <span className="meta-value">Java SystemLogAnalyzer</span>
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-section-header">
              <Lightbulb size={16} />
              <h4>Detection Reason &amp; Description</h4>
            </div>
            <div className="detail-box description-box">
              <p>{threat.description || 'Pattern matching triggered based on predefined security rules.'}</p>
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-section-header">
              <Terminal size={16} />
              <h4>Original Log Entry</h4>
              <button
                className="copy-btn"
                onClick={copyToClipboard}
                title="Copy log entry to clipboard"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy Log Line'}</span>
              </button>
            </div>
            <div className="terminal-box">
              <pre className="log-code">{threat.logLine}</pre>
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-section-header recommendation-header">
              <ShieldAlert size={16} />
              <h4>Recommended Security Action</h4>
            </div>
            <div className="detail-box recommendation-box">
              <p>
                {threat.recommendedAction ||
                  'Isolate the host or source IP, review recent audit logs for privilege escalation, and update detection filters.'}
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

