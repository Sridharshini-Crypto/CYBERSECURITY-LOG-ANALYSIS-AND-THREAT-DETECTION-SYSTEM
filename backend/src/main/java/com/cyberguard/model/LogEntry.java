package com.cyberguard.model;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;

@Entity
public class LogEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private int lineNumber;
    @Lob
    private String content;
    private boolean suspicious;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private AnalysisReport report;

    protected LogEntry() {
    }

    public LogEntry(int lineNumber, String content, boolean suspicious) {
        this.lineNumber = lineNumber;
        this.content = content;
        this.suspicious = suspicious;
    }

    void setReport(AnalysisReport report) { this.report = report; }
    public int getLineNumber() { return lineNumber; }
    public String getContent() { return content; }
    public boolean isSuspicious() { return suspicious; }
}
