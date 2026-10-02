import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

public class LogReader {
    private final LogAnalyzer analyzer;

    public LogReader(LogAnalyzer analyzer) {
        this.analyzer = analyzer;
    }

    public List<ThreatResult> analyzeFile(File file) throws IOException {
        List<ThreatResult> results = new ArrayList<>();
        int lineNumber = 0;
        try (BufferedReader reader = Files.newBufferedReader(file.toPath(), StandardCharsets.UTF_8)) {
            String line;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                ThreatResult result = analyzer.analyzeLog(line, lineNumber);
                if (result != null) results.add(result);
            }
        }
        return results;
    }

    public long countLines(File file) throws IOException {
        try (var stream = Files.lines(file.toPath(), StandardCharsets.UTF_8)) {
            return stream.count();
        }
    }
}
