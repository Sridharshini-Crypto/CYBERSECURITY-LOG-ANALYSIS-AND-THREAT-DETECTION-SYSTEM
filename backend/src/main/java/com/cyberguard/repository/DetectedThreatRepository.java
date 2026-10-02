package com.cyberguard.repository;

import com.cyberguard.model.DetectedThreat;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DetectedThreatRepository extends JpaRepository<DetectedThreat, Long> {
    List<DetectedThreat> findByReport_IdOrderByLineNumberAsc(Long reportId);
}
