import React, { useState, useRef } from 'react'
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  FileCode,
  ShieldAlert,
  ArrowRight,
  Database,
  Sparkles,
} from 'lucide-react'

export function UploadLogsPage({ onUploadSuccess, onLoadSample, onError }) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef(null)

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    if (bytes < 1024) return bytes + ' Bytes'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const validateAndSetFile = (file) => {
    setErrorMessage('')
    if (!file) return

    const name = file.name.toLowerCase()
    if (!name.endsWith('.log') && !name.endsWith('.txt')) {
      setErrorMessage('Invalid file format. Please upload a .log or .txt file.')
      setSelectedFile(null)
      return
    }

    if (file.size === 0) {
      setErrorMessage('The selected file is empty (0 bytes). Please upload a valid log file.')
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const handleStartAnalysis = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a .log or .txt file before starting analysis.')
      return
    }

    setProcessing(true)
    setErrorMessage('')
    setProcessingStep('Ingesting log records via Java I/O...')

    try {
      setTimeout(() => setProcessingStep('Applying SystemLogAnalyzer detection rules...'), 200)
      const result = await onUploadSuccess(selectedFile)
      // Redirect happens in parent handler
    } catch (err) {
      const serverMessage =
        err.response?.data?.details?.join(' ') ||
        err.response?.data?.error ||
        err.message ||
        'Failed to analyze log file. Check that the backend is running.'
      setErrorMessage(serverMessage)
    } finally {
      setProcessing(false)
      setProcessingStep('')
    }
  }

  const handleLoadSample = async () => {
    setProcessing(true)
    setErrorMessage('')
    setProcessingStep('Loading bundled samplelog.txt...')

    try {
      await onLoadSample()
    } catch (err) {
      setErrorMessage('Could not load sample log from server. Please check backend status.')
    } finally {
      setProcessing(false)
      setProcessingStep('')
    }
  }

  return (
    <div className="upload-page-container">
      <div className="upload-header-block">
        <h2>Log Ingestion &amp; Threat Analysis</h2>
        <p>
          Upload security audit records, web server logs, or authentication streams in <code>.log</code> or{' '}
          <code>.txt</code> format. The Java rule-based engine will identify suspicious activities.
        </p>
      </div>

      {errorMessage && (
        <div className="alert-box alert-error" role="alert">
          <AlertTriangle size={18} />
          <div className="alert-content">
            <strong>Upload Error:</strong> {errorMessage}
          </div>
        </div>
      )}

      <div className="upload-main-grid">
        {/* Drop Zone Card */}
        <div className="upload-card">
          <div
            className={`drop-zone ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".log,.txt,text/plain"
              className="file-hidden-input"
              onChange={handleFileChange}
            />

            <div className="drop-zone-icon">
              {selectedFile ? <FileCode size={40} /> : <Upload size={40} />}
            </div>

            {selectedFile ? (
              <div className="selected-file-details">
                <span className="file-ready-tag">File Ready for Analysis</span>
                <h4 className="file-name">{selectedFile.name}</h4>
                <p className="file-size">Size: {formatFileSize(selectedFile.size)}</p>
                <button
                  type="button"
                  className="change-file-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                >
                  Choose a different file
                </button>
              </div>
            ) : (
              <div className="drop-zone-instructions">
                <h3>Drag and drop your log file here</h3>
                <p>or click to browse your local filesystem</p>
                <div className="badge-supported">Supports .log and .txt files (UTF-8 encoded)</div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="upload-action-row">
            <button
              className="btn btn-primary btn-lg"
              disabled={!selectedFile || processing}
              onClick={handleStartAnalysis}
            >
              {processing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{processingStep || 'Processing...'}</span>
                </>
              ) : (
                <>
                  <ShieldAlert size={18} />
                  <span>Start Security Analysis</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Sample & Guidelines Card */}
        <div className="side-info-card">
          <div className="info-section">
            <div className="info-title">
              <Sparkles size={18} />
              <h4>One-Click Evaluation</h4>
            </div>
            <p>
              Test all 6 threat detection rules immediately using the built-in <code>samplelog.txt</code>{' '}
              containing real-world attacks:
            </p>
            <button
              className="btn btn-secondary btn-block sample-btn"
              disabled={processing}
              onClick={handleLoadSample}
            >
              <Database size={16} />
              <span>Load Bundled samplelog.txt</span>
            </button>
          </div>

          <div className="info-section">
            <div className="info-title">
              <CheckCircle2 size={18} />
              <h4>Active Detection Signatures</h4>
            </div>
            <ul className="detection-list">
              <li>
                <strong>SQL Injection:</strong> UNION SELECT, OR 1=1, DROP TABLE
              </li>
              <li>
                <strong>Cross-Site Scripting:</strong> &lt;script&gt;, javascript:, onerror
              </li>
              <li>
                <strong>Suspicious Commands:</strong> powershell, cmd.exe, wget, curl, rm -rf
              </li>
              <li>
                <strong>Port Scanning:</strong> Nmap probes, scan detected
              </li>
              <li>
                <strong>Failed Logins:</strong> Authentication failures, invalid passwords
              </li>
              <li>
                <strong>Unauthorized Access:</strong> Access denied, permission denied, 403
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

