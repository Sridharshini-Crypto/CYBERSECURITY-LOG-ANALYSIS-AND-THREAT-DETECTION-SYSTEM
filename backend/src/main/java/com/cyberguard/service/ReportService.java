package com.cyberguard.service;

import com.cyberguard.dto.AnalysisResponse;
import com.cyberguard.dto.LogEntryDto;
import com.cyberguard.dto.ReportSummary;
import com.cyberguard.dto.StatisticsResponse;
import com.cyberguard.model.AnalysisReport;
import com.cyberguard.repository.AnalysisReportRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        long critical = response.threatsBySeverity().getOrDefault("CRITICAL", 0L);
        long high = response.threatsBySeverity().getOrDefault("HIGH", 0L);
        long medium = response.threatsBySeverity().getOrDefault("MEDIUM", 0L);
        return new StatisticsResponse(response.totalLines(), response.totalThreats(), critical, high, medium,
                Math.max(0, response.totalLines() - response.suspiciousLines()), response.suspiciousLines(),
                response.processingTimeMs(), response.threatsBySeverity(), response.threatsByType());
    }

    @Transactional(readOnly = true)
    public byte[] csv(Long reportId) {
        AnalysisResponse response = logProcessingService.get(reportId);
        StringBuilder output = new StringBuilder("Line Number,Threat Type,Severity,Description,Log Entry\r\n");
        for (var threat : response.threats()) {
            output.append(threat.lineNumber()).append(',')
                    .append(quote(threat.threatType())).append(',')
                    .append(quote(threat.severity())).append(',')
                    .append(quote(threat.description())).append(',')
                    .append(quote(threat.logLine())).append("\r\n");
        }
        return output.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    @Transactional(readOnly = true)
    public byte[] summary(Long reportId) {
        AnalysisResponse response = logProcessingService.get(reportId);
        StringBuilder output = new StringBuilder("CYBERGUARD SECURITY ANALYSIS REPORT\n")
                .append("Generated: ").append(response.analyzedAt()).append('\n')
                .append("Source: ").append(response.fileName()).append('\n')
                .append("Total log entries: ").append(response.totalLines()).append('\n')
                .append("Total threats: ").append(response.totalThreats()).append('\n')
                .append("Processing time (ms): ").append(response.processingTimeMs()).append("\n\n")
                .append("THREATS BY SEVERITY\n");
        response.threatsBySeverity().forEach((name, count) -> output.append(name).append(": ").append(count).append('\n'));
        output.append("\nTHREATS BY TYPE\n");
        response.threatsByType().forEach((name, count) -> output.append(name).append(": ").append(count).append('\n'));
        output.append("\nDETECTED EVENTS\n");
        response.threats().forEach(threat -> output.append("Line ").append(threat.lineNumber()).append(" | ")
                .append(threat.severity()).append(" | ").append(threat.threatType()).append(" | ")
                .append(threat.logLine()).append('\n'));
        return output.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    @Transactional(readOnly = true)
    public Long latestId() {
        return reportRepository.findAllByOrderByAnalyzedAtDesc().stream()
                .findFirst().map(AnalysisReport::getId)
                .orElseThrow(() -> new IllegalArgumentException("No analyses have been uploaded yet."));
    }

    private AnalysisReport find(Long reportId) {
        return reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Analysis report " + reportId + " was not found."));
    }

    private String quote(String value) {
        return "\"" + (value == null ? "" : value.replace("\"", "\"\"")) + "\"";
    }
}
