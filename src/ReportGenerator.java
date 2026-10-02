import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.text.SimpleDateFormat;
import java.util.*;

public class ReportGenerator {
    public static void exportCsv(File file, List<ThreatResult> results) throws IOException {
        try (PrintWriter out = new PrintWriter(Files.newBufferedWriter(file.toPath(), StandardCharsets.UTF_8))) {
            out.println("Line Number,Threat Type,Severity,Description,Log Line");
            for (ThreatResult r : results) {
                out.printf("%d,%s,%s,%s,%s%n", r.getLineNumber(), csv(r.getThreatType()),
                        csv(r.getSeverity()), csv(r.getDescription()), csv(r.getLogLine()));
            }
        }
    }

    public static void exportText(File file, File source, long totalLines, List<ThreatResult> results) throws IOException {
        Map<String, Integer> severity = new LinkedHashMap<>();
        severity.put("CRITICAL", 0); severity.put("HIGH", 0); severity.put("MEDIUM", 0); severity.put("LOW", 0);
        Map<String, Integer> types = new TreeMap<>();
        for (ThreatResult r : results) {
            severity.put(r.getSeverity(), severity.getOrDefault(r.getSeverity(), 0) + 1);
            types.put(r.getThreatType(), types.getOrDefault(r.getThreatType(), 0) + 1);
        }
        try (PrintWriter out = new PrintWriter(Files.newBufferedWriter(file.toPath(), StandardCharsets.UTF_8))) {
            out.println("CYBERSECURITY LOG ANALYZER - SUMMARY REPORT");
            out.println("Generated: " + new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
            out.println("Source: " + source.getAbsolutePath());
            out.println("Total log lines: " + totalLines);
            out.println("Threats detected: " + results.size());
            out.println();
            out.println("SEVERITY SUMMARY");
            severity.forEach((k, v) -> out.println(k + ": " + v));
            out.println();
            out.println("THREAT TYPE SUMMARY");
            types.forEach((k, v) -> out.println(k + ": " + v));
            out.println();
            out.println("DETECTED EVENTS");
            for (ThreatResult r : results) {
                out.printf("Line %d | %s | %s | %s%n", r.getLineNumber(), r.getSeverity(), r.getThreatType(), r.getLogLine());
            }
        }
    }

    private static String csv(String value) {
        if (value == null) return "\"\"";
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }
}
