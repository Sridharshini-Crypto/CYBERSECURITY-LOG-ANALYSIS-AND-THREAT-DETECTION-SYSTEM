package com.cyberguard.dto;

import java.util.Map;

/**
 * High-level security posture summary for dashboard and reporting.
 */
public record ThreatSummary(
        long totalLines,
        long totalThreats,
        long criticalCount,
        long highCount,
        long mediumCount,
        long safeLines,
        String securityStatus,
        Map<String, Long> threatsBySeverity,
        Map<String, Long> threatsByType) {
}

