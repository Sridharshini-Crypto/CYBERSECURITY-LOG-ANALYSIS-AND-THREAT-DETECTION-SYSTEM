package com.cyberguard.service;

import com.cyberguard.analyzer.ReportGenerator;
import com.cyberguard.analyzer.ThreatResult;
import com.cyberguard.dto.AnalysisResponse;
import com.cyberguard.dto.LogEntryDto;
import com.cyberguard.dto.ReportSummary;
import com.cyberguard.dto.StatisticsResponse;
import com.cyberguard.model.AnalysisReport;
import com.cyberguard.repository.AnalysisReportRepository;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service managing report listing, retrieval, and document generation (CSV and Text).
 * Reuses the ReportGenerator class from the base project.
 */
@Service
public class ReportService {
    private final AnalysisReportRepository reportRepository;
    private final LogProcessingService logProcessingService;

    public ReportService(AnalysisReportRepository reportRepository, LogProcessingService logProcessingService) {
        this.reportRepository = reportRepository;
        this.logProcessingService = logProcessingService;
    }

    @Transactional(readOnly = true)
    public List<ReportSummary> listReports() {
        return reportRepository.findAllByOrderByAnalyzedAtDesc().stream()
                .map(report -> new ReportSummary(report.getId(), report.getFileName(), report.getTotalLines(),
                        report.getThreats().size(), report.getProcessingTimeMs(), report.getAnalyzedAt()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LogEntryDto> getLogs(Long reportId) {
        AnalysisReport report = find(reportId);
        return report.getLogEntries().stream()
                .map(line -> new LogEntryDto(line.getLineNumber(), line.getContent(), line.isSuspicious()))
                .toList();
    }

    @Transactional(readOnly = true)
    public StatisticsResponse statistics(Long reportId) {
        AnalysisResponse response = logProcessingService.get(reportId);
        long critical = response.criticalCount();
        long high = response.highCount();
        long medium = response.mediumCount();
        return new StatisticsResponse(response.totalLines(), response.totalThreats(), critical, high, medium,
                response.safeLines(), response.suspiciousLines(),
                response.processingTimeMs(), response.threatsBySeverity(), response.threatsByType());
    }

    @Transactional(readOnly = true)
    public byte[] csv(Long reportId) {
        AnalysisResponse response = logProcessingService.get(reportId);
        List<ThreatResult> findings = response.threats().stream()
                .map(t -> new ThreatResult(t.lineNumber(), t.logLine(), t.threatType(), t.severity(), t.description(), t.recommendedAction()))
                .toList();
        StringWriter sw = new StringWriter();
        try (PrintWriter pw = new PrintWriter(sw)) {
            ReportGenerator.writeCsv(pw, findings);
        }
        return sw.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Transactional(readOnly = true)
    public byte[] summary(Long reportId) {
        AnalysisResponse response = logProcessingService.get(reportId);
        List<ThreatResult> findings = response.threats().stream()
                .map(t -> new ThreatResult(t.lineNumber(), t.logLine(), t.threatType(), t.severity(), t.description(), t.recommendedAction()))
                .toList();
        StringWriter sw = new StringWriter();
        try (PrintWriter pw = new PrintWriter(sw)) {
            ReportGenerator.writeText(pw, response.fileName(), response.totalLines(), findings);
        }
        return sw.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Transactional(readOnly = true)
    public Long latestId() {
        return reportRepository.findAllByOrderByAnalyzedAtDesc().stream()
                .findFirst().map(AnalysisReport::getId)
                .orElseThrow(() -> new IllegalArgumentException("No analyses have been uploaded yet."));
    }

    @Transactional(readOnly = true)
    public AnalysisResponse latestReport() {
        return logProcessingService.get(latestId());
    }

    private AnalysisReport find(Long reportId) {
        return reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Analysis report " + reportId + " was not found."));
    }
}
