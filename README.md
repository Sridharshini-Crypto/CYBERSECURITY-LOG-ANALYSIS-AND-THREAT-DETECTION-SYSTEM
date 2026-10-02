# CyberGuard Log Intelligence

CyberGuard is the web-application iteration of the original Java Swing log analyzer. The original `src/` Swing implementation and `samplelog.txt` remain as the baseline; the Spring Boot API and React dashboard live in `backend/` and `frontend/`.

## Features

- Upload UTF-8 `.log` and `.txt` files (maximum 25 MB).
- Preserve the original SQL injection, XSS, suspicious command, port scan, failed login, and unauthorized access rules and severity precedence.
- Detect brute force when repeated failed logins reach the configurable threshold for a parsed user/IP identity.
- Analyze file partitions concurrently with a fixed-size `ExecutorService`, then sort findings by original line number.
- Persist reports, source lines, and detections in H2 through Spring Data JPA.
- Browse totals, severity and type counts, duplicate lines, findings, and processing time in the React dashboard.
- Download CSV findings and a text summary report.

## Requirements

- Java 21 or later
- Maven 3.9 or later
- Node.js 20 or later with npm

## Run The Web Application

Start the backend in one terminal:

```powershell
cd backend
mvn spring-boot:run
```

Start the React app in another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The API runs at http://localhost:8080. H2 uses a local file database under `backend/data/`; the H2 console is available at http://localhost:8080/h2-console with JDBC URL `jdbc:h2:file:./data/cyberguard`, username `sa`, and a blank password.

Configure the parallelism and brute-force threshold in `backend/src/main/resources/application.properties` with `cyberguard.analysis.threads` and `cyberguard.brute-force.threshold`.

## REST API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/logs/upload` | Upload and analyze multipart field `file` |
| `POST` | `/api/logs/analyze` | Retrieve a saved analysis by JSON `reportId` |
| `GET` | `/api/logs?reportId={id}` | Retrieve source log lines (latest report by default) |
| `GET` | `/api/threats?reportId={id}` | Retrieve threat findings (latest report by default) |
| `GET` | `/api/statistics?reportId={id}` | Retrieve summary counts (latest report by default) |
| `GET` | `/api/reports` | List saved analysis reports |
| `GET` | `/api/reports/{id}` | Retrieve one analysis and its findings |
| `GET` | `/api/reports/{id}/csv` | Download findings as CSV |
| `GET` | `/api/reports/{id}/summary` | Download a text summary |

Upload errors use structured JSON and appropriate `400`, `413`, or `500` responses. Upload DTO and analysis request validation are enabled.

## Data And Design

- `AnalysisReport`, `LogEntry`, and `DetectedThreat` are the JPA entities.
- `LogAnalyzer` is the analyzer abstraction; `SystemLogAnalyzer` implements the original regex rules.
- `LogProcessingService` handles file validation, concurrent processing orchestration, persistence, and response mapping.
- `ThreatDetectionService` owns the analysis executor and brute-force grouping.
- `ReportService` builds statistics, CSV, and summary downloads.
- `ArrayList` preserves ordered processed lines and findings; `HashSet` identifies duplicate lines and suspicious line numbers; `HashMap` aggregates brute-force identities and threat counts.
- React components are in `frontend/src/App.jsx`; Axios is used for API calls and Recharts renders the distributions.

## Test And Build

```powershell
cd backend
mvn test
cd ..\frontend
npm run build
```

The backend tests cover the six baseline rules, brute-force escalation, API upload and persistence, validation errors, empty/blank/unsupported files, and report downloads.

## Run The Original Swing Baseline

From the repository root, with Java 17 or later:

```powershell
javac -d out src\*.java
java -cp out Main
```
