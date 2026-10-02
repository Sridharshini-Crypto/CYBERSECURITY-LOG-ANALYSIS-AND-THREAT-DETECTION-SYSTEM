package com.cyberguard.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record AnalysisResponse(
        Long reportId,
        String fileName,
        long totalLines,
        int totalThreats,
        long processingTimeMs,
        Instant analyzedAt,
        Map<String, Long> threatsBySeverity,
        Map<String, Long> threatsByType,
        long suspiciousLines,
        long duplicateLines,
        List<ThreatDto> threats) {
}
