package com.cyberguard.analyzer;

public record ThreatResult(
        int lineNumber,
        String logLine,
        String threatType,
        String severity,
        String description) {
}
