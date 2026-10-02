package com.cyberguard.dto;

import java.util.Map;

public record StatisticsResponse(
        long totalLines,
        long totalThreats,
        long criticalThreats,
        long highThreats,
        long mediumThreats,
        long safeLines,
        long suspiciousLines,
        long processingTimeMs,
        Map<String, Long> threatsBySeverity,
        Map<String, Long> threatsByType) {
}
