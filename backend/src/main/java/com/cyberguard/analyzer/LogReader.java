package com.cyberguard.analyzer;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;

/**
 * LogReader handles log file ingestion and stream parsing.
 * Demonstrates:
 * - Java I/O (BufferedReader, Files, Streams, StandardCharsets)
 * - Polymorphism (delegating analysis to any LogAnalyzer subclass)
 * - Collections (List, ArrayList)
 */
public class LogReader {
    private final LogAnalyzer analyzer;

    public LogReader(LogAnalyzer analyzer) {
        if (analyzer == null) {
            throw new IllegalArgumentException("LogAnalyzer cannot be null.");
        }
        this.analyzer = analyzer;
    }

    /**
     * Reads a File and executes log analysis line by line.
     */
    public List<ThreatResult> analyzeFile(File file) throws IOException {
        try (BufferedReader reader = Files.newBufferedReader(file.toPath(), StandardCharsets.UTF_8)) {
            return analyzeReader(reader);
        }
    }

    /**
     * Reads an InputStream (e.g. from uploaded MultipartFile).
     */
    public List<ThreatResult> analyzeInputStream(InputStream inputStream) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            return analyzeReader(reader);
        }
    }

    /**
     * Analyzes an in-memory list of log lines.
     */
    public List<ThreatResult> analyzeLines(List<String> lines) {
        List<ThreatResult> results = new ArrayList<>();
        int lineNumber = 0;
        for (String line : lines) {
            lineNumber++;
            ThreatResult result = analyzer.analyzeLog(line, lineNumber);
            if (result != null) {
                results.add(result);
            }
        }
        return results;
    }

    /**
     * Analyzes lines from a BufferedReader using Java I/O.
     */
    public List<ThreatResult> analyzeReader(BufferedReader reader) throws IOException {
        List<ThreatResult> results = new ArrayList<>();
        String line;
        int lineNumber = 0;
        while ((line = reader.readLine()) != null) {
            lineNumber++;
            ThreatResult result = analyzer.analyzeLog(line, lineNumber);
            if (result != null) {
                results.add(result);
            }
        }
        return results;
    }

    /**
     * Counts the total number of lines in a file using Java NIO.
     */
    public long countLines(File file) throws IOException {
        try (var stream = Files.lines(file.toPath(), StandardCharsets.UTF_8)) {
            return stream.count();
        }
    }

    public LogAnalyzer getAnalyzer() {
        return analyzer;
    }
}

