package com.cyberguard.service;

import com.cyberguard.analyzer.LogAnalyzer;
import com.cyberguard.analyzer.ThreatResult;
import jakarta.annotation.PreDestroy;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ThreatDetectionService {
    private static final Pattern FAILED_LOGIN = Pattern.compile("failed\\s+(login|log-in)|authentication\\s+failed|invalid\\s+password", Pattern.CASE_INSENSITIVE);
    private static final Pattern IP_ADDRESS = Pattern.compile("(?<![\\d.])(?:\\d{1,3}\\.){3}\\d{1,3}(?![\\d.])");
    private static final Pattern USER = Pattern.compile("(?:user(?:name)?|account)\\s*[=:]\\s*([\\w.@-]+)", Pattern.CASE_INSENSITIVE);

    private final LogAnalyzer analyzer;
    private final ExecutorService executor;
    private final int bruteForceThreshold;

    public ThreatDetectionService(LogAnalyzer analyzer,
                                  @Value("${cyberguard.analysis.threads:4}") int threadCount,
                                  @Value("${cyberguard.brute-force.threshold:5}") int bruteForceThreshold) {
        this.analyzer = analyzer;
        this.executor = Executors.newFixedThreadPool(Math.max(1, threadCount));
        this.bruteForceThreshold = Math.max(2, bruteForceThreshold);
    }

    public List<ThreatResult> analyze(List<String> lines) {
        if (lines.isEmpty()) {
            return List.of();
        }
        int partitions = Math.min(Math.max(1, Runtime.getRuntime().availableProcessors()), lines.size());
        int chunkSize = (lines.size() + partitions - 1) / partitions;
        List<CompletableFuture<List<ThreatResult>>> jobs = new ArrayList<>();
        for (int start = 0; start < lines.size(); start += chunkSize) {
            int from = start;
            int to = Math.min(lines.size(), start + chunkSize);
            jobs.add(CompletableFuture.supplyAsync(() -> {
                List<ThreatResult> matches = new ArrayList<>();
                for (int index = from; index < to; index++) {
                    ThreatResult match = analyzer.analyzeLog(lines.get(index), index + 1);
                    if (match != null) {
                        matches.add(match);
                    }
                }
                return matches;
            }, executor));
        }
        List<ThreatResult> results = new ArrayList<>();
        for (CompletableFuture<List<ThreatResult>> job : jobs) {
            results.addAll(job.join());
        }
        addBruteForceFindings(lines, results);
        results.sort(Comparator.comparingInt(ThreatResult::lineNumber).thenComparing(ThreatResult::threatType));
        return results;
    }

    private void addBruteForceFindings(List<String> lines, List<ThreatResult> results) {
        java.util.Map<String, Integer> attempts = new java.util.HashMap<>();
        for (int index = 0; index < lines.size(); index++) {
            String line = lines.get(index);
            if (!FAILED_LOGIN.matcher(line).find()) {
                continue;
            }
            String identity = extractIdentity(line);
            if (identity == null) {
                continue;
            }
            int count = attempts.merge(identity, 1, Integer::sum);
            if (count == bruteForceThreshold) {
                results.add(new ThreatResult(index + 1, line, "Brute Force", "HIGH",
                        "Repeated failed logins reached the configured threshold for " + identity + "."));
            }
        }
    }

    private String extractIdentity(String line) {
        Matcher ipMatcher = IP_ADDRESS.matcher(line);
        Matcher userMatcher = USER.matcher(line);
        String ip = ipMatcher.find() ? ipMatcher.group() : null;
        String user = userMatcher.find() ? userMatcher.group(1) : null;
        if (ip == null && user == null) {
            return null;
        }
        return (ip == null ? "" : ip) + (user == null ? "" : ":" + user.toLowerCase(java.util.Locale.ROOT));
    }

    @PreDestroy
    public void shutdown() {
        executor.shutdown();
    }
}
