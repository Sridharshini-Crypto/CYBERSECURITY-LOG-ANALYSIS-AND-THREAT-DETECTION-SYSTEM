package com.cyberguard.repository;

import com.cyberguard.model.AnalysisReport;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnalysisReportRepository extends JpaRepository<AnalysisReport, Long> {
    List<AnalysisReport> findAllByOrderByAnalyzedAtDesc();
}
