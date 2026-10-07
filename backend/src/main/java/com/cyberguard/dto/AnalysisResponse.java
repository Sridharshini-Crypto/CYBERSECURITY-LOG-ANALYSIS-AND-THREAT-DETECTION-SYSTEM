package com.cyberguard.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Complete analysis result DTO returned by the log analysis endpoints.
 */
public record AnalysisResponse(
        Long reportId,
        String fileName,
        long totalLines,
        long totalThreats,
        long criticalCount,
        long highCount,
        long mediumCount,
        long safeLines,
        String securityStatus,
        long processingTimeMs,
        Instant analyzedAt,
        Map<String, Long> threatsBySeverity,
        Map<String, Long> threatsByType,
        long suspiciousLines,
        long duplicateLines,
        List<ThreatDto> threats) {

    // Overloaded constructor for backward compatibility
    public AnalysisResponse(
            Long reportId,
            String fileName,
            long totalLines,
            long totalThreats,
            long processingTimeMs,
            Instant analyzedAt,
            Map<String, Long> threatsBySeverity,
            Map<String, Long> threatsByType,
            long suspiciousLines,
            long duplicateLines,
            List<ThreatDto> threats) {
        this(
                reportId,
                fileName,
                totalLines,
                totalThreats,
                threatsBySeverity.getOrDefault("CRITICAL", 0L),
                threatsBySeverity.getOrDefault("HIGH", 0L),
                threatsBySeverity.getOrDefault("MEDIUM", 0L),
                Math.max(0, totalLines - suspiciousLines),
                calculateSecurityStatus(threatsBySeverity.getOrDefault("CRITICAL", 0L),
                        threatsBySeverity.getOrDefault("HIGH", 0L),
                        threatsBySeverity.getOrDefault("MEDIUM", 0L),
                        totalThreats),
                processingTimeMs,
                analyzedAt,
                threatsBySeverity,
                threatsByType,
                suspiciousLines,
                duplicateLines,
                threats
        );
    }

    public static String calculateSecurityStatus(long critical, long high, long medium, long totalThreats) {
        if (critical > 0) {
            return "CRITICAL RISK";
        }
        if (high > 0) {
            return "HIGH RISK";
        }
        if (medium > 0) {
            return "MODERATE RISK";
        }
        if (totalThreats > 0) {
            return "LOW RISK";
        }
        return "SECURE";
    }
}
