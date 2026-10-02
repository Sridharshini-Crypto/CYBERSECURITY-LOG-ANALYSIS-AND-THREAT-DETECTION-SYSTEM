package com.cyberguard.repository;

import com.cyberguard.model.LogEntry;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LogEntryRepository extends JpaRepository<LogEntry, Long> {
    List<LogEntry> findByReport_IdOrderByLineNumberAsc(Long reportId);
}
