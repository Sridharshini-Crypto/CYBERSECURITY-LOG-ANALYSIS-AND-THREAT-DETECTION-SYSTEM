import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class Main extends JFrame {
    private final LogReader reader = new LogReader(new SystemLogAnalyzer());
    private final JTable table;
    private final DefaultTableModel model;
    private final JLabel fileLabel = new JLabel("No log file selected");
    private final JLabel totalLabel = new JLabel("0");
    private final JLabel threatLabel = new JLabel("0");
    private final JLabel criticalLabel = new JLabel("0");
    private final JLabel highLabel = new JLabel("0");
    private final JLabel mediumLabel = new JLabel("0");
    private List<ThreatResult> results = new ArrayList<>();
    private File currentFile;
    private long totalLines;

    public Main() {
        setTitle("CyberSecurity Log Analyzer Using Java");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1100, 700);
        setLocationRelativeTo(null);

        JPanel root = new JPanel(new BorderLayout(10, 10));
        root.setBorder(new EmptyBorder(12, 12, 12, 12));
        setContentPane(root);

        JPanel top = new JPanel(new BorderLayout(10, 10));
        JLabel title = new JLabel("CyberSecurity Log Analyzer");
        title.setFont(new Font("SansSerif", Font.BOLD, 24));
        top.add(title, BorderLayout.NORTH);
        top.add(fileLabel, BorderLayout.CENTER);

        JPanel buttons = new JPanel(new FlowLayout(FlowLayout.LEFT));
        JButton open = new JButton("Open Log File");
        JButton analyze = new JButton("Analyze");
        JButton csv = new JButton("Export CSV");
        JButton report = new JButton("Generate Report");
        JButton sample = new JButton("Load Sample");
        buttons.add(open); buttons.add(analyze); buttons.add(csv); buttons.add(report); buttons.add(sample);
        top.add(buttons, BorderLayout.SOUTH);
        root.add(top, BorderLayout.NORTH);

        JPanel stats = new JPanel(new GridLayout(1, 5, 8, 8));
        stats.add(card("LOG LINES", totalLabel));
        stats.add(card("THREATS", threatLabel));
        stats.add(card("CRITICAL", criticalLabel));
        stats.add(card("HIGH", highLabel));
        stats.add(card("MEDIUM", mediumLabel));
        root.add(stats, BorderLayout.SOUTH);

        model = new DefaultTableModel(new Object[]{"Line", "Threat Type", "Severity", "Description", "Log Entry"}, 0) {
            @Override public boolean isCellEditable(int row, int column) { return false; }
        };
        table = new JTable(model);
        table.setRowHeight(28);
        table.setAutoCreateRowSorter(true);
        table.getColumnModel().getColumn(0).setPreferredWidth(50);
        table.getColumnModel().getColumn(1).setPreferredWidth(180);
        table.getColumnModel().getColumn(2).setPreferredWidth(80);
        table.getColumnModel().getColumn(3).setPreferredWidth(280);
        table.getColumnModel().getColumn(4).setPreferredWidth(450);
        root.add(new JScrollPane(table), BorderLayout.CENTER);

        open.addActionListener(e -> chooseFile());
        analyze.addActionListener(e -> analyzeCurrentFile());
        csv.addActionListener(e -> exportCsv());
        report.addActionListener(e -> generateReport());
        sample.addActionListener(e -> loadSample());
    }

    private JPanel card(String name, JLabel value) {
        JPanel p = new JPanel(new BorderLayout());
        p.setBorder(BorderFactory.createTitledBorder(name));
        value.setHorizontalAlignment(SwingConstants.CENTER);
        value.setFont(new Font("SansSerif", Font.BOLD, 20));
        p.add(value, BorderLayout.CENTER);
        return p;
    }

    private void chooseFile() {
        JFileChooser chooser = new JFileChooser();
        if (chooser.showOpenDialog(this) == JFileChooser.APPROVE_OPTION) {
            currentFile = chooser.getSelectedFile();
            fileLabel.setText("Selected: " + currentFile.getAbsolutePath());
            analyzeCurrentFile();
        }
    }

    private void analyzeCurrentFile() {
        if (currentFile == null) {
            JOptionPane.showMessageDialog(this, "Select a log file first.");
            return;
        }
        try {
            results = reader.analyzeFile(currentFile);
            totalLines = reader.countLines(currentFile);
            refreshTable();
            updateStats();
        } catch (Exception ex) {
            JOptionPane.showMessageDialog(this, "Could not analyze file: " + ex.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void refreshTable() {
        model.setRowCount(0);
        for (ThreatResult r : results) {
            model.addRow(new Object[]{r.getLineNumber(), r.getThreatType(), r.getSeverity(), r.getDescription(), r.getLogLine()});
        }
    }

    private void updateStats() {
        int critical = 0, high = 0, medium = 0;
        for (ThreatResult r : results) {
            switch (r.getSeverity()) {
                case "CRITICAL" -> critical++;
                case "HIGH" -> high++;
                case "MEDIUM" -> medium++;
            }
        }
        totalLabel.setText(String.valueOf(totalLines));
        threatLabel.setText(String.valueOf(results.size()));
        criticalLabel.setText(String.valueOf(critical));
        highLabel.setText(String.valueOf(high));
        mediumLabel.setText(String.valueOf(medium));
    }

    private void exportCsv() {
        if (results.isEmpty()) {
            JOptionPane.showMessageDialog(this, "No detected threats to export.");
            return;
        }
        JFileChooser chooser = new JFileChooser();
        chooser.setSelectedFile(new File("threat_report.csv"));
        if (chooser.showSaveDialog(this) == JFileChooser.APPROVE_OPTION) {
            try {
                ReportGenerator.exportCsv(chooser.getSelectedFile(), results);
                JOptionPane.showMessageDialog(this, "CSV report exported successfully.");
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, ex.getMessage(), "Export Error", JOptionPane.ERROR_MESSAGE);
            }
        }
    }

    private void generateReport() {
        if (currentFile == null) {
            JOptionPane.showMessageDialog(this, "Analyze a log file first.");
            return;
        }
        JFileChooser chooser = new JFileChooser();
        chooser.setSelectedFile(new File("security_summary.txt"));
        if (chooser.showSaveDialog(this) == JFileChooser.APPROVE_OPTION) {
            try {
                ReportGenerator.exportText(chooser.getSelectedFile(), currentFile, totalLines, results);
                JOptionPane.showMessageDialog(this, "Summary report generated successfully.");
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, ex.getMessage(), "Report Error", JOptionPane.ERROR_MESSAGE);
            }
        }
    }

    private void loadSample() {
        currentFile = new File("samplelog.txt");
        if (!currentFile.exists()) {
            JOptionPane.showMessageDialog(this, "samplelog.txt was not found. Run the program from the project folder.");
            return;
        }
        fileLabel.setText("Selected: " + currentFile.getAbsolutePath());
        analyzeCurrentFile();
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new Main().setVisible(true));
    }
}
