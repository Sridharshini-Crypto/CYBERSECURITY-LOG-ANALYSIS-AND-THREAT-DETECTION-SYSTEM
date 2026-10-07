import React from 'react'
import {
  Shield,
  Code2,
  Cpu,
  Layers,
  Database,
  CheckCircle2,
  FileCode,
  Lock,
  Server,
  Terminal,
  AlertOctagon,
  AlertTriangle,
  Info,
} from 'lucide-react'

export function AboutPage() {
  return (
    <div className="about-page-container">
      {/* Hero Section */}
      <div className="about-hero-card">
        <div className="hero-icon-badge">
          <Shield size={36} />
        </div>
        <div>
          <h2>CYBERGUARD — Cybersecurity Log Analysis System</h2>
          <p className="hero-subtitle">
            A rule-based intrusion detection and security log audit platform built with Java, Spring Boot, and React.
          </p>
        </div>
      </div>

      {/* Grid of Core Pillars */}
      <div className="about-pillars-grid">
        <div className="panel pillar-card">
          <div className="pillar-header">
            <Cpu size={20} />
            <h3>Project Purpose</h3>
          </div>
          <p>
            CYBERGUARD transforms raw, unstructured system and server logs (<code>.log</code>, <code>.txt</code>) into structured, actionable security intelligence. In real-world enterprise Security Operations Centers (SOCs), deterministic rule-based analysis is essential to flag malicious activities with zero latency and zero hallucination risk.
          </p>
        </div>

        <div className="panel pillar-card">
          <div className="pillar-header">
            <Terminal size={20} />
            <h3>Rule-Based Detection</h3>
          </div>
          <p>
            Rather than relying on unpredictable probabilistic models, CYBERGUARD uses compiled regular expression signatures and deterministic heuristic rules. Each log entry is scanned for indicators of compromise (IOCs) such as SQL injection syntax, script injection tags, port scans, and command-line execution payloads.
          </p>
        </div>

        <div className="panel pillar-card">
          <div className="pillar-header">
            <Server size={20} />
            <h3>Full-Stack Architecture</h3>
          </div>
          <p>
            The system pairs a high-performance Spring Boot REST API with a responsive React dashboard. Logs are uploaded through multipart HTTP requests, analyzed by the Java backend engine, persisted in MySQL database, and visualized via charts and interactive tables.
          </p>
        </div>
      </div>

      {/* OOP Concepts Section */}
      <div className="panel oop-section-panel">
        <div className="panel-header">
          <div className="section-title-group">
            <Code2 size={20} />
            <h3>Object-Oriented Programming (OOP) Architecture</h3>
          </div>
          <span className="oop-badge">Core Java Principles</span>
        </div>

        <div className="oop-grid">
          <div className="oop-card">
            <h4>1. Abstract Class</h4>
            <p>
              <code>LogAnalyzer</code> is defined as an <code>abstract class</code> establishing the abstract contract{' '}
              <code>public abstract ThreatResult analyzeLog(String line, int lineNumber)</code>. It cannot be directly instantiated and defines the template for all analyzer specializations.
            </p>
          </div>

          <div className="oop-card">
            <h4>2. Inheritance</h4>
            <p>
              <code>SystemLogAnalyzer extends LogAnalyzer</code>, inheriting the base analyzer properties and providing concrete regular expression pattern definitions for detecting the 6 core threat types.
            </p>
          </div>

          <div className="oop-card">
            <h4>3. Polymorphism</h4>
            <p>
              Dynamic method dispatch is utilized throughout <code>LogReader</code> and <code>ThreatDetectionService</code>. These services hold a polymorphic reference to <code>LogAnalyzer</code>, allowing seamless substitution of alternative analyzer rules at runtime.
            </p>
          </div>

          <div className="oop-card">
            <h4>4. Encapsulation</h4>
            <p>
              Classes such as <code>ThreatResult</code>, <code>LogEntry</code>, and <code>AnalysisReport</code> encapsulate state with private attributes, ensuring immutability, controlled accessor methods, and data validation.
            </p>
          </div>

          <div className="oop-card">
            <h4>5. Interfaces</h4>
            <p>
              The <code>ThreatDetectionEngine</code> interface defines the high-level contract for batch log analysis, decoupling the controller and service layers from the underlying thread pool execution strategy.
            </p>
          </div>

          <div className="oop-card">
            <h4>6. Java Collections Framework</h4>
            <p>
              Extensive use of <code>List&lt;ThreatResult&gt;</code>, <code>Map&lt;String, Long&gt;</code>, <code>LinkedHashMap</code> (for preserving severity ordering), <code>TreeMap</code> (for sorted category counts), and <code>Set</code> for deduplication.
            </p>
          </div>

          <div className="oop-card">
            <h4>7. Java I/O Streams</h4>
            <p>
              Log processing leverages <code>BufferedReader</code>, <code>InputStreamReader</code>, <code>StandardCharsets.UTF_8</code>, and Java NIO <code>Files.lines()</code> to achieve scalable, memory-efficient stream parsing. <code>ReportGenerator</code> uses <code>PrintWriter</code> to emit CSV and formatted text reports.
            </p>
          </div>

          <div className="oop-card">
            <h4>8. Exception Handling</h4>
            <p>
              Robust validation and error boundaries via custom exceptions and Spring's <code>@RestControllerAdvice</code> (<code>GlobalExceptionHandler</code>) to handle corrupt, empty, or unsupported files with structured JSON error responses.
            </p>
          </div>
        </div>
      </div>

      {/* Supported Threat Types Table */}
      <div className="panel threat-signatures-panel">
        <div className="panel-header">
          <div className="section-title-group">
            <Lock size={20} />
            <h3>Supported Threat Types &amp; Detection Rules</h3>
          </div>
          <span className="rule-count-badge">6 Active Signatures</span>
        </div>

        <div className="table-responsive">
          <table className="signature-table">
            <thead>
              <tr>
                <th>THREAT TYPE</th>
                <th>SEVERITY</th>
                <th>REGEX PATTERN / DETECTION CRITERIA</th>
                <th>RECOMMENDED MITIGATION</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>SQL Injection</strong>
                </td>
                <td>
                  <span className="severity-badge badge-critical">
                    <AlertOctagon size={13} /> CRITICAL
                  </span>
                </td>
                <td>
                  <code>(union\s+select|or\s+1\s*=\\s*1|drop\s+table|insert\s+into|select\s+.*\\s+from)</code>
                </td>
                <td>Enforce parameterized queries (PreparedStatements), sanitize user inputs, and isolate the offending session.</td>
              </tr>

              <tr>
                <td>
                  <strong>Cross-Site Scripting (XSS)</strong>
                </td>
                <td>
                  <span className="severity-badge badge-high">
                    <AlertTriangle size={13} /> HIGH
                  </span>
                </td>
                <td>
                  <code>(&lt;script|javascript:|onerror\s*=|onload\s*=)</code>
                </td>
                <td>HTML-encode dynamic outputs, enforce strict Content Security Policy (CSP), and audit DOM injection points.</td>
              </tr>

              <tr>
                <td>
                  <strong>Suspicious Command</strong>
                </td>
                <td>
                  <span className="severity-badge badge-high">
                    <AlertTriangle size={13} /> HIGH
                  </span>
                </td>
                <td>
                  <code>(cmd\.exe|powershell|/bin/bash|wget\s+http|curl\s+http|rm\s+-rf)</code>
                </td>
                <td>Quarantine host system, inspect process execution tree, check persistence mechanisms, and block outbound C2 channels.</td>
              </tr>

              <tr>
                <td>
                  <strong>Unauthorized Access</strong>
                </td>
                <td>
                  <span className="severity-badge badge-high">
                    <AlertTriangle size={13} /> HIGH
                  </span>
                </td>
                <td>
                  <code>(unauthorized|access\s+denied|permission\s+denied|forbidden)</code>
                </td>
                <td>Verify Role-Based Access Control (RBAC), revoke compromised session tokens, and inspect authorization logs.</td>
              </tr>

              <tr>
                <td>
                  <strong>Port Scanning</strong>
                </td>
                <td>
                  <span className="severity-badge badge-medium">
                    <Info size={13} /> MEDIUM
                  </span>
                </td>
                <td>
                  <code>(port\s+scan|nmap|multiple\s+ports|scan\s+detected)</code>
                </td>
                <td>Add offending IP to perimeter firewall blocklist, audit exposed ports, and close unnecessary open services.</td>
              </tr>

              <tr>
                <td>
                  <strong>Failed Login</strong>
                </td>
                <td>
                  <span className="severity-badge badge-medium">
                    <Info size={13} /> MEDIUM
                  </span>
                </td>
                <td>
                  <code>(failed\s+(login|log-in)|authentication\s+failed|invalid\s+password)</code>
                </td>
                <td>Enforce account lockout thresholds, enable Multi-Factor Authentication (MFA), and rate-limit authentication endpoints.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Technology Stack Details */}
      <div className="panel tech-stack-panel">
        <div className="panel-header">
          <div className="section-title-group">
            <Layers size={20} />
            <h3>Technology Stack</h3>
          </div>
        </div>

        <div className="stack-grid">
          <div className="stack-card">
            <h4>Backend Engineering</h4>
            <ul>
              <li><strong>Language:</strong> Java 21 / OpenJDK 25</li>
              <li><strong>Framework:</strong> Spring Boot 3.4.5 (Web, Validation, Data JPA)</li>
              <li><strong>Persistence:</strong> MySQL Database (Local MySQL Server 9.2 / H2 for tests)</li>
              <li><strong>Build Tool:</strong> Apache Maven 3.9.9</li>
              <li><strong>Testing:</strong> JUnit 5, MockMvc, AssertJ</li>
            </ul>
          </div>

          <div className="stack-card">
            <h4>Frontend Engineering</h4>
            <ul>
              <li><strong>Library:</strong> React 18.3 (Component-based architecture)</li>
              <li><strong>Bundler:</strong> Vite 6 (Lightning-fast HMR)</li>
              <li><strong>Networking:</strong> Axios (REST API communication)</li>
              <li><strong>Visualizations:</strong> Recharts (Pie charts, Bar charts, Donut plots)</li>
              <li><strong>Icons:</strong> Lucide React</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

