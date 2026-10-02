package com.cyberguard.model;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;

@Entity
public class DetectedThreat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private int lineNumber;
    @Lob
    private String logLine;
    private String threatType;
    private String severity;
    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private AnalysisReport report;

    protected DetectedThreat() {
    }

    public DetectedThreat(int lineNumber, String logLine, String threatType, String severity, String description) {
        this.lineNumber = lineNumber;
        this.logLine = logLine;
        this.threatType = threatType;
        this.severity = severity;
        this.description = description;
    }

    void setReport(AnalysisReport report) { this.report = report; }
    public int getLineNumber() { return lineNumber; }
    public String getLogLine() { return logLine; }
    public String getThreatType() { return threatType; }
    public String getSeverity() { return severity; }
    public String getDescription() { return description; }
}
