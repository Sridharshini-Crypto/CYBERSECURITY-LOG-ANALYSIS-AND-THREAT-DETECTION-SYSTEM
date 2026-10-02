package com.cyberguard;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.hasItem;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class CyberGuardApiTest {
    @Autowired
    private MockMvc mockMvc;
        @Autowired
        private ObjectMapper objectMapper;

    @Test
    void uploadsPersistsAndExposesAnAnalysis() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.log", "text/plain",
                "GET /home 200\nFailed login user=alice from 192.0.2.1\nSELECT * FROM users WHERE id=' OR 1=1".getBytes());

        mockMvc.perform(multipart("/api/logs/upload").file(file))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.totalLines").value(3))
                .andExpect(jsonPath("$.totalThreats").value(2))
                .andExpect(jsonPath("$.reportId").isNumber());

        mockMvc.perform(get("/api/reports"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].fileName").value("test.log"));
    }

    @Test
    void rejectsUnsupportedFileTypesWithStructuredError() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "input.csv", "text/csv", "data".getBytes());
        mockMvc.perform(multipart("/api/logs/upload").file(file))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.details[0]").value("Only .log and .txt files are supported."));
    }

    @Test
    void rejectsEmptyFilesWithStructuredError() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "empty.log", "text/plain", new byte[0]);
        mockMvc.perform(multipart("/api/logs/upload").file(file))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details[0]").value("Upload a non-empty .log or .txt file."));
    }

    @Test
    void flagsBruteForceAndDownloadsBothReportFormats() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "attempts.log", "text/plain",
                ("Failed login user=alice from 192.0.2.10\n".repeat(3)).getBytes());
        String response = mockMvc.perform(multipart("/api/logs/upload").file(file))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.totalThreats").value(4))
                .andExpect(jsonPath("$.threats[*].threatType", hasItem("Brute Force")))
                .andReturn().getResponse().getContentAsString();
        long reportId = objectMapper.readTree(response).get("reportId").asLong();

        mockMvc.perform(get("/api/reports/{id}/csv", reportId))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("text/csv"))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Brute Force")));
        mockMvc.perform(get("/api/reports/{id}/summary", reportId))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("text/plain"))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("THREATS BY SEVERITY")));
    }

    @Test
    void rejectsWhitespaceOnlyFilesAndInvalidAnalysisRequests() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "blank.txt", "text/plain", "  \n\t\n".getBytes());
        mockMvc.perform(multipart("/api/logs/upload").file(file))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details[0]").value("The log file contains no records."));

        mockMvc.perform(post("/api/logs/analyze").contentType("application/json").content("{\"reportId\":0}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }
}
