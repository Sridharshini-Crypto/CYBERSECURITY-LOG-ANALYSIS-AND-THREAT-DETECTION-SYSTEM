package com.cyberguard.config;

import com.cyberguard.analyzer.LogAnalyzer;
import com.cyberguard.analyzer.SystemLogAnalyzer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AnalyzerConfiguration {
    @Bean
    LogAnalyzer logAnalyzer() {
        return new SystemLogAnalyzer();
    }
}
