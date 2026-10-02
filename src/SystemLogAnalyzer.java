import java.util.Locale;
import java.util.regex.Pattern;

public class SystemLogAnalyzer extends LogAnalyzer {
    private static final Pattern FAILED_LOGIN = Pattern.compile("failed\\s+(login|log-in)|authentication\\s+failed|invalid\\s+password", Pattern.CASE_INSENSITIVE);
    private static final Pattern UNAUTHORIZED = Pattern.compile("unauthorized|access\\s+denied|permission\\s+denied|forbidden", Pattern.CASE_INSENSITIVE);
    private static final Pattern SQLI = Pattern.compile("(union\\s+select|or\\s+1\\s*=\\s*1|drop\\s+table|insert\\s+into|select\\s+.*\\s+from|sql\\s+injection)", Pattern.CASE_INSENSITIVE);
    private static final Pattern XSS = Pattern.compile("(<script|javascript:|onerror\\s*=|onload\\s*=)", Pattern.CASE_INSENSITIVE);
    private static final Pattern PORT_SCAN = Pattern.compile("(port\\s+scan|nmap|multiple\\s+ports|scan\\s+detected)", Pattern.CASE_INSENSITIVE);
    private static final Pattern SUSPICIOUS_CMD = Pattern.compile("(cmd\\.exe|powershell|/bin/bash|wget\\s+http|curl\\s+http|rm\\s+-rf)", Pattern.CASE_INSENSITIVE);

    @Override
    public ThreatResult analyzeLog(String line, int lineNumber) {
        if (line == null || line.isBlank()) return null;
        String lower = line.toLowerCase(Locale.ROOT);

        if (SQLI.matcher(line).find())
            return new ThreatResult(lineNumber, line, "SQL Injection", "CRITICAL", "Possible SQL injection pattern detected.");
        if (XSS.matcher(line).find())
            return new ThreatResult(lineNumber, line, "Cross-Site Scripting (XSS)", "HIGH", "Possible XSS payload detected.");
        if (SUSPICIOUS_CMD.matcher(line).find())
            return new ThreatResult(lineNumber, line, "Suspicious Command", "HIGH", "Potentially dangerous command or download detected.");
        if (PORT_SCAN.matcher(line).find())
            return new ThreatResult(lineNumber, line, "Port Scanning", "MEDIUM", "Possible network/port scanning activity detected.");
        if (FAILED_LOGIN.matcher(line).find())
            return new ThreatResult(lineNumber, line, "Failed Login", "MEDIUM", "Authentication failure detected.");
        if (UNAUTHORIZED.matcher(line).find())
            return new ThreatResult(lineNumber, line, "Unauthorized Access", "HIGH", "Unauthorized or denied access detected.");

        return null;
    }
}
