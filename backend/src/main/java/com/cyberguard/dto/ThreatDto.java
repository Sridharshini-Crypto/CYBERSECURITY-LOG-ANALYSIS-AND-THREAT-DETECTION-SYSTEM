package com.cyberguard.dto;

public record ThreatDto(int lineNumber, String logLine, String threatType, String severity, String description) {
}
