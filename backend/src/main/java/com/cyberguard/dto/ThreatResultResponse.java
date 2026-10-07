package com.cyberguard.dto;

/**
 * DTO matching prompt specification for threat result responses.
 */
public record ThreatResultResponse(
        int lineNumber,
        String logLine,
        String threatType,
        String severity,
        String description,
        String recommendedAction) {
}

