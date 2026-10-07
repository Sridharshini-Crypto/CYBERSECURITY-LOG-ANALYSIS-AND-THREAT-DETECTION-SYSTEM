package com.cyberguard.service;

import com.cyberguard.analyzer.ThreatResult;
import java.util.List;

/**
 * Interface defining the contract for threat detection engines.
 * Demonstrates OOP Interface design separating detection contract from execution strategy.
 */
public interface ThreatDetectionEngine {
    /**
     * Analyzes a list of log lines and returns detected security threats.
     *
     * @param lines raw log lines
     * @return list of detected threat results
     */
    List<ThreatResult> analyze(List<String> lines);
}

