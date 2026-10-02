package com.cyberguard.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AnalysisRequest(@NotNull @Positive Long reportId) {
}
