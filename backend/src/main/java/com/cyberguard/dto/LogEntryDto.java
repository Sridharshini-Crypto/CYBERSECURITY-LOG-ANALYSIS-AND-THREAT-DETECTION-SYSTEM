package com.cyberguard.dto;

public record LogEntryDto(int lineNumber, String content, boolean suspicious) {
}
