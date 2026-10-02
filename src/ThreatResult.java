public class ThreatResult {
    private final int lineNumber;
    private final String logLine;
    private final String threatType;
    private final String severity;
    private final String description;

    public ThreatResult(int lineNumber, String logLine, String threatType,
                        String severity, String description) {
        this.lineNumber = lineNumber;
        this.logLine = logLine;
        this.threatType = threatType;
        this.severity = severity;
        this.description = description;
    }

    public int getLineNumber() { return lineNumber; }
    public String getLogLine() { return logLine; }
    public String getThreatType() { return threatType; }
    public String getSeverity() { return severity; }
    public String getDescription() { return description; }
}
