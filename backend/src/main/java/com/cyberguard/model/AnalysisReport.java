package com.cyberguard.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
public class AnalysisReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fileName;
    private long totalLines;
    private long processingTimeMs;
    private Instant analyzedAt;

    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("lineNumber ASC")
    private List<LogEntry> logEntries = new ArrayList<>();

    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("lineNumber ASC")
    private List<DetectedThreat> threats = new ArrayList<>();

    protected AnalysisReport() {
    }

    public AnalysisReport(String fileName, long totalLines, long processingTimeMs, Instant analyzedAt) {
        this.fileName = fileName;
        this.totalLines = totalLines;
        this.processingTimeMs = processingTimeMs;
        this.analyzedAt = analyzedAt;
    }

    public void addLogEntry(LogEntry entry) {
        logEntries.add(entry);
        entry.setReport(this);
    }

    public void addThreat(DetectedThreat threat) {
        threats.add(threat);
        threat.setReport(this);
    }

    public Long getId() { return id; }
    public String getFileName() { return fileName; }
    public long getTotalLines() { return totalLines; }
    public long getProcessingTimeMs() { return processingTimeMs; }
    public Instant getAnalyzedAt() { return analyzedAt; }
    public List<LogEntry> getLogEntries() { return logEntries; }
    public List<DetectedThreat> getThreats() { return threats; }
}
