package com.cyberguard.dto;

import java.time.Instant;

/**
 * Health check response DTO.
 */
public record HealthResponse(
        String status,
        String system,
        String version,
        Instant timestamp) {

    public HealthResponse() {
        this("UP", "CYBERGUARD — Cybersecurity Log Analysis System", "1.0.0", Instant.now());
    }
}

