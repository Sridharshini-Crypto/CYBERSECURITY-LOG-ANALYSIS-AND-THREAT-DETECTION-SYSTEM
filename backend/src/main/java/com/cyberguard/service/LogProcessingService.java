package com.cyberguard.service;

import com.cyberguard.analyzer.ThreatResult;
import com.cyberguard.dto.AnalysisResponse;
import com.cyberguard.dto.ThreatDto;
import com.cyberguard.model.AnalysisReport;
import com.cyberguard.model.DetectedThreat;
import com.cyberguard.model.LogEntry;
import com.cyberguard.repository.AnalysisReportRepository;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class LogProcessingService {
    private final ThreatDetectionService threatDetectionService;
    private final AnalysisReportRepository reportRepository;

    public LogProcessingService(ThreatDetectionService threatDetectionService,
                                AnalysisReportRepository reportRepository) {
        this.threatDetectionService = threatDetectionService;
        this.reportRepository = reportRepository;
    }

    @Transactional
    public AnalysisResponse process(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Upload a non-empty .log or .txt file.");
        }
        String fileName = file.getOriginalFilename() == null ? "upload.log" : file.getOriginalFilename();
        String lowerName = fileName.toLowerCase(java.util.Locale.ROOT);
        if (!lowerName.endsWith(".log") && !lowerName.endsWith(".txt")) {
            throw new IllegalArgumentException("Only .log and .txt files are supported.");
        }

        long startedAt = System.nanoTime();
        final String content;
        try {
            content = new String(file.getBytes(), StandardCharsets.UTF_8);
        } catch (IOException exception) {
            throw new IllegalStateException("The uploaded log file could not be read.", exception);
        }
        List<String> lines = new ArrayList<>(Arrays.asList(content.split("\\R", -1)));
        if (!lines.isEmpty() && lines.get(lines.size() - 1).isEmpty() && content.endsWith("\n")) {
            lines.remove(lines.size() - 1);
        }
        if (lines.isEmpty() || lines.stream().allMatch(String::isBlank)) {
            throw new IllegalArgumentException("The log file contains no records.");
        }

        List<ThreatResult> findings = threatDetectionService.analyze(lines);
        long elapsedMs = (System.nanoTime() - startedAt) / 1_000_000;
        AnalysisReport report = new AnalysisReport(fileName, lines.size(), elapsedMs, Instant.now());
        Set<String> uniqueLines = new HashSet<>();
        Set<Integer> suspiciousLineNumbers = new HashSet<>();
        findings.forEach(finding -> suspiciousLineNumbers.add(finding.lineNumber()));
        for (int index = 0; index < lines.size(); index++) {
            String line = lines.get(index);
            report.addLogEntry(new LogEntry(index + 1, line, suspiciousLineNumbers.contains(index + 1)));
            uniqueLines.add(line);
        }
        for (ThreatResult finding : findings) {
            report.addThreat(new DetectedThreat(finding.lineNumber(), finding.logLine(), finding.threatType(),
                    finding.severity(), finding.description()));
        }
        reportRepository.save(report);
        return toResponse(report, lines.size() - uniqueLines.size());
    }

    @Transactional(readOnly = true)
    public AnalysisResponse get(Long reportId) {
        AnalysisReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Analysis report " + reportId + " was not found."));
        long distinctLines = report.getLogEntries().stream().map(LogEntry::getContent).distinct().count();
        return toResponse(report, report.getTotalLines() - distinctLines);
    }

    private AnalysisResponse toResponse(AnalysisReport report, long duplicateLines) {
        Map<String, Long> severityCounts = new LinkedHashMap<>();
        Map<String, Long> typeCounts = new LinkedHashMap<>();
        for (DetectedThreat threat : report.getThreats()) {
            severityCounts.merge(threat.getSeverity(), 1L, Long::sum);
            typeCounts.merge(threat.getThreatType(), 1L, Long::sum);
        }
        List<ThreatDto> threats = report.getThreats().stream()
                .map(t -> new ThreatDto(t.getLineNumber(), t.getLogLine(), t.getThreatType(), t.getSeverity(), t.getDescription()))
                .toList();
        long suspicious = report.getLogEntries().stream().filter(LogEntry::isSuspicious).count();
        return new AnalysisResponse(report.getId(), report.getFileName(), report.getTotalLines(),
                report.getThreats().size(), report.getProcessingTimeMs(), report.getAnalyzedAt(),
                severityCounts, typeCounts, suspicious, duplicateLines, threats);
    }
}
