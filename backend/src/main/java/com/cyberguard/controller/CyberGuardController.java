package com.cyberguard.controller;

import com.cyberguard.dto.AnalysisRequest;
import com.cyberguard.dto.AnalysisResponse;
import com.cyberguard.dto.HealthResponse;
import com.cyberguard.dto.LogEntryDto;
import com.cyberguard.dto.ReportSummary;
import com.cyberguard.dto.StatisticsResponse;
import com.cyberguard.dto.ThreatDto;
import com.cyberguard.service.LogProcessingService;
import com.cyberguard.service.ReportService;
import jakarta.validation.Valid;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * REST API controller exposing endpoints for log analysis, report retrieval, and health status.
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://127.0.0.1:5173"})
public class CyberGuardController {
    private final LogProcessingService logProcessingService;
    private final ReportService reportService;

    public CyberGuardController(LogProcessingService logProcessingService, ReportService reportService) {
        this.logProcessingService = logProcessingService;
        this.reportService = reportService;
    }

    /**
     * Health check endpoint.
     */
    @GetMapping("/health")
    public HealthResponse health() {
        return new HealthResponse();
    }

    /**
     * Primary log analysis endpoint accepting MultipartFile upload.
     */
    @PostMapping(value = "/logs/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AnalysisResponse> analyzeUpload(@RequestParam("file") MultipartFile file) {
        AnalysisResponse response = logProcessingService.process(file);
        return ResponseEntity.status(201).body(response);
    }

    /**
     * JSON analysis request by existing report ID.
     */
    @PostMapping(value = "/logs/analyze", consumes = MediaType.APPLICATION_JSON_VALUE)
    public AnalysisResponse analyzeJson(@Valid @RequestBody AnalysisRequest request) {
        return logProcessingService.get(request.reportId());
    }

    /**
     * Backward-compatible alias for log file upload.
     */
    @PostMapping(value = "/logs/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AnalysisResponse> upload(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(201).body(logProcessingService.process(file));
    }

    /**
     * Loads and analyzes the built-in samplelog.txt.
     */
    @PostMapping("/logs/sample")
    public ResponseEntity<AnalysisResponse> analyzeSample() throws IOException {
        ClassPathResource resource = new ClassPathResource("samplelog.txt");
        try (InputStream is = resource.getInputStream()) {
            String content = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            return ResponseEntity.status(201).body(logProcessingService.processContent("samplelog.txt", content));
        }
    }

    /**
     * Returns raw text content of samplelog.txt.
     */
    @GetMapping(value = "/logs/sample", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> getSampleLogText() throws IOException {
        ClassPathResource resource = new ClassPathResource("samplelog.txt");
        try (InputStream is = resource.getInputStream()) {
            String content = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            return ResponseEntity.ok(content);
        }
    }

    /**
     * Returns the latest analysis report if one exists.
     */
    @GetMapping("/reports/latest")
    public ResponseEntity<AnalysisResponse> latestReport() {
        try {
            Long latestId = reportService.latestId();
            return ResponseEntity.ok(logProcessingService.get(latestId));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.noContent().build();
        }
    }

    @GetMapping("/logs")
    public List<LogEntryDto> logs(@RequestParam(required = false) Long reportId) {
        return reportService.getLogs(reportId == null ? reportService.latestId() : reportId);
    }

    @GetMapping("/threats")
    public List<ThreatDto> threats(@RequestParam(required = false) Long reportId) {
        return logProcessingService.get(reportId == null ? reportService.latestId() : reportId).threats();
    }

    @GetMapping("/statistics")
    public StatisticsResponse statistics(@RequestParam(required = false) Long reportId) {
        return reportService.statistics(reportId == null ? reportService.latestId() : reportId);
    }

    @GetMapping("/reports")
    public List<ReportSummary> reports() {
        return reportService.listReports();
    }

    @GetMapping("/reports/{id}")
    public AnalysisResponse report(@PathVariable Long id) {
        return logProcessingService.get(id);
    }

    @GetMapping("/reports/{id}/csv")
    public ResponseEntity<ByteArrayResource> csv(@PathVariable Long id) {
        return download(reportService.csv(id), "cyberguard-report-" + id + ".csv", "text/csv");
    }

    @GetMapping({"/reports/{id}/summary", "/reports/{id}/text"})
    public ResponseEntity<ByteArrayResource> summary(@PathVariable Long id) {
        return download(reportService.summary(id), "cyberguard-summary-" + id + ".txt", "text/plain");
    }

    private ResponseEntity<ByteArrayResource> download(byte[] content, String fileName, String type) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(type));
        headers.setContentDisposition(ContentDisposition.attachment().filename(fileName).build());
        return ResponseEntity.ok().headers(headers).contentLength(content.length).body(new ByteArrayResource(content));
    }
}
