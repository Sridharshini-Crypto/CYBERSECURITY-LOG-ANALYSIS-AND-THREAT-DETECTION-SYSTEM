package com.cyberguard.dto;

/**
 * Data Transfer Object representing a detected threat item in API responses.
 */
public record ThreatDto(
        int lineNumber,
        String logLine,
        String threatType,
        String severity,
        String description,
        String recommendedAction) {

    public ThreatDto(int lineNumber, String logLine, String threatType, String severity, String description) {
        this(lineNumber, logLine, threatType, severity, description, null);
    }
}
