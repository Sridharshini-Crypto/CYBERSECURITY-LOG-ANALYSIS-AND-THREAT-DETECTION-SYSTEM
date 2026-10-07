package com.cyberguard.analyzer;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * ReportGenerator produces formatted security reports.
 * Demonstrates:
 * - Java I/O (PrintWriter, Files, UTF-8 charset)
 * - Java Collections (LinkedHashMap for ordered severity, TreeMap for sorted types)
 * - Formatted output generation for CSV and text reports
 */
public class ReportGenerator {

    public static void exportCsv(File file, List<ThreatResult> results) throws IOException {
        try (PrintWriter out = new PrintWriter(Files.newBufferedWriter(file.toPath(), StandardCharsets.UTF_8))) {
            writeCsv(out, results);
        }
    }

    public static String generateCsvString(List<ThreatResult> results) {
        StringWriter sw = new StringWriter();
        try (PrintWriter out = new PrintWriter(sw)) {
            writeCsv(out, results);
        }
        return sw.toString();
    }

    public static void writeCsv(PrintWriter out, List<ThreatResult> results) {
        out.println("Line Number,Threat Type,Severity,Description,Log Line,Recommended Action");
        for (ThreatResult r : results) {
            out.printf("%d,%s,%s,%s,%s,%s%n",
                    r.lineNumber(),
                    csv(r.threatType()),
                    csv(r.severity()),
                    csv(r.description()),
                    csv(r.logLine()),
                    csv(r.recommendedAction()));
        }
    }

    public static void exportText(File file, String sourceName, long totalLines, List<ThreatResult> results) throws IOException {
        try (PrintWriter out = new PrintWriter(Files.newBufferedWriter(file.toPath(), StandardCharsets.UTF_8))) {
            writeText(out, sourceName, totalLines, results);
        }
    }

    public static String generateTextString(String sourceName, long totalLines, List<ThreatResult> results) {
        StringWriter sw = new StringWriter();
        try (PrintWriter out = new PrintWriter(sw)) {
            writeText(out, sourceName, totalLines, results);
        }
        return sw.toString();
    }

    public static void writeText(PrintWriter out, String sourceName, long totalLines, List<ThreatResult> results) {
        Map<String, Integer> severity = new LinkedHashMap<>();
        severity.put("CRITICAL", 0);
        severity.put("HIGH", 0);
        severity.put("MEDIUM", 0);
        severity.put("LOW", 0);

        Map<String, Integer> types = new TreeMap<>();
        for (ThreatResult r : results) {
            severity.put(r.severity(), severity.getOrDefault(r.severity(), 0) + 1);
            types.put(r.threatType(), types.getOrDefault(r.threatType(), 0) + 1);
        }

        out.println("================================================================================");
        out.println("       CYBERGUARD - LOG ANALYSIS AND THREAT DETECTION REPORT                    ");
        out.println("================================================================================");
        out.println("Generated:      " + new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
        out.println("Source:         " + (sourceName == null ? "N/A" : sourceName));
        out.println("Total log lines: " + totalLines);
        out.println("Threats detected: " + results.size());
        long safeCount = Math.max(0, totalLines - results.size());
        out.println("Safe entries:   " + safeCount);
        out.println();
        out.println("THREATS BY SEVERITY");
        severity.forEach((k, v) -> out.println(k + ": " + v));
        out.println();
        out.println("THREATS BY TYPE");
        if (types.isEmpty()) {
            out.println("No threat categories detected.");
        } else {
            types.forEach((k, v) -> out.println(k + ": " + v));
        }
        out.println();
        out.println("DETECTED EVENTS");
        if (results.isEmpty()) {
            out.println("No security threats detected in the processed logs.");
        } else {
            for (ThreatResult r : results) {
                out.printf("Line %d | %s | %s | %s%n",
                        r.lineNumber(), r.severity(), r.threatType(), r.logLine());
                out.printf("  Reason:         %s%n", r.description());
                out.printf("  Recommendation: %s%n", r.recommendedAction());
            }
        }
        out.println("================================================================================");
        out.println("                  END OF CYBERGUARD ANALYSIS REPORT                             ");
        out.println("================================================================================");
    }

    private static String csv(String value) {
        if (value == null) return "\"\"";
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }
}

