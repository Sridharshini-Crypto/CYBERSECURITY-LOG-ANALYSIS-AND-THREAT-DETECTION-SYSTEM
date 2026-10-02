package com.cyberguard.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import java.util.List;
import org.junit.jupiter.api.Test;
import com.cyberguard.analyzer.SystemLogAnalyzer;

class ThreatDetectionServiceTest {
    @Test
    void flagsRepeatedFailedLoginsForTheSameIdentity() {
        ThreatDetectionService service = new ThreatDetectionService(new SystemLogAnalyzer(), 2, 3);
        try {
            List<String> lines = List.of(
                    "Failed login user=alice from 192.0.2.10",
                    "Failed login user=alice from 192.0.2.10",
                    "Failed login user=alice from 192.0.2.10",
                    "Failed login user=bob from 192.0.2.10");

            var findings = service.analyze(lines);
            var bruteForceFindings = findings.stream().filter(f -> f.threatType().equals("Brute Force")).toList();

            assertEquals(1, bruteForceFindings.size());
            assertEquals(3, bruteForceFindings.getFirst().lineNumber());
        } finally {
            service.shutdown();
        }
    }
}
