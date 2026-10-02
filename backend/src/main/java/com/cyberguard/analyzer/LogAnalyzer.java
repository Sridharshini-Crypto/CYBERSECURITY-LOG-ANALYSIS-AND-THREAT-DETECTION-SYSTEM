package com.cyberguard.analyzer;

public abstract class LogAnalyzer {
    public abstract ThreatResult analyzeLog(String line, int lineNumber);
}
