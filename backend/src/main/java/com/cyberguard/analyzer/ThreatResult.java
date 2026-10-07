package com.cyberguard.analyzer;

/**
 * Encapsulates the detection result of a security log entry.
 * Demonstrates OOP Encapsulation with immutability, private fields,
 * and comprehensive cybersecurity remediation recommendations.
 */
public record ThreatResult(
        int lineNumber,
        String logLine,
        String threatType,
        String severity,
        String description,
        String recommendedAction) {

    public ThreatResult(int lineNumber, String logLine, String threatType, String severity, String description) {
        this(lineNumber, logLine, threatType, severity, description, defaultRecommendation(threatType));
    }

    /**
     * Determines incident response mitigation steps based on threat classification.
     */
    public static String defaultRecommendation(String threatType) {
        if (threatType == null) {
            return "Review event in security log.";
        }
        return switch (threatType.trim()) {
            case "SQL Injection" ->
                "Immediately isolate offending IP or session. Use parameterized queries (PreparedStatements) in database calls, enforce input sanitization, and audit database user permissions.";
            case "Cross-Site Scripting (XSS)" ->
                "Sanitize and HTML-encode all dynamic user inputs. Implement a strict Content Security Policy (CSP) header and audit DOM manipulation routines.";
            case "Suspicious Command" ->
                "Quarantine the host system immediately. Inspect process execution tree, check for persistence mechanisms, and block outbound malicious command-and-control (C2) connections.";
            case "Port Scanning" ->
                "Add offending source IP to perimeter firewall blocklist. Review open ports and ensure non-essential network services are disabled or filtered.";
            case "Failed Login" ->
                "Review failed authentication attempts from this IP/account. Enforce account lockout thresholds, enable Multi-Factor Authentication (MFA), and rate-limit authentication endpoints.";
            case "Unauthorized Access" ->
                "Verify Role-Based Access Control (RBAC) rules. Audit authorization interceptors, revoke compromised session tokens, and verify user privilege boundaries.";
            case "Brute Force" ->
                "Block offending IP address immediately. Enforce CAPTCHA on authentication endpoints, implement exponential backoff, and notify targeted account holders.";
            default ->
                "Investigate source IP and inspect system logs for anomalous behavioral patterns.";
        };
    }

    // Java Bean getter methods for backward compatibility with classic Java OOP
    public int getLineNumber() { return lineNumber; }
    public String getLogLine() { return logLine; }
    public String getThreatType() { return threatType; }
    public String getSeverity() { return severity; }
    public String getDescription() { return description; }
    public String getRecommendedAction() { return recommendedAction; }
}
