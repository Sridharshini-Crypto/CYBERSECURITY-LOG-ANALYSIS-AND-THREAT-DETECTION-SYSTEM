package com.cyberguard.dto;

import java.time.Instant;

public record ReportSummary(Long id, String fileName, long totalLines, int totalThreats, long processingTimeMs, Instant analyzedAt) {
}
