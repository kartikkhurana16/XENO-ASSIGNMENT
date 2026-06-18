import { useEffect, useState } from "react";
import { getJobStatus, triggerDownload } from "../api";
import "../styles/JobStatus.css";

export default function JobStatus({ jobId }) {
    const [job, setJob] = useState(null);
    const [expandedSection, setExpandedSection] = useState(null);

    useEffect(() => {
        let interval;

        const fetchJob = async () => {
            try {
                const res = await getJobStatus(jobId);
                const data = res.data.job;

                setJob(data);

                // stop polling when done
                if (data?.status === "done") {
                    clearInterval(interval);
                }
            } catch (err) {
                console.error("Failed to fetch job status:", err);
            }
        };

        // initial call immediately (better UX)
        fetchJob();

        // polling
        interval = setInterval(fetchJob, 2000);

        return () => clearInterval(interval);
    }, [jobId]);

    const handleDownload = async (filePath, filename) => {
        try {
            await triggerDownload(filePath, filename);
        } catch (error) {
            alert("Download failed: " + error.message);
        }
    };

    // loading state
    if (!job) {
        return <p>Fetching latest job status...</p>;
    }

    // Failed state
    if (job.status === "failed") {
        return (
            <div className="status-container error">
                <h3>Status: <span style={{ color: "red", fontWeight: "bold" }}>Failed</span></h3>
                <p style={{ color: "red" }}>{job.error || "Processing failed"}</p>
            </div>
        );
    }

    // Processing state
    if (job.status === "processing") {
        return (
            <div className="status-container processing">
                <h3>Status: <span style={{ color: "orange", fontWeight: "bold" }}>Processing</span></h3>
                <p>Processing your transaction data... Please wait.</p>
                <div className="spinner"></div>
            </div>
        );
    }

    // Done state
    if (job.status === "done" && job.result) {
        const { summary, validRows, invalidRows, files } = job.result;

        return (
            <div className="status-container done">
                <h3>Status: <span style={{ color: "green", fontWeight: "bold" }}>Done</span></h3>

                {/* SUMMARY STATISTICS */}
                <section className="summary-section">
                    <h4>📊 Processing Summary</h4>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value">{summary.totalRows}</div>
                            <div className="stat-label">Total Rows</div>
                        </div>
                        <div className="stat-card success">
                            <div className="stat-value">{summary.validRows}</div>
                            <div className="stat-label">Valid</div>
                        </div>
                        <div className="stat-card error">
                            <div className="stat-value">{summary.invalidRows}</div>
                            <div className="stat-label">Invalid</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">
                                {summary.totalRows > 0 
                                    ? ((summary.validRows / summary.totalRows) * 100).toFixed(1)
                                    : 0
                                }%
                            </div>
                            <div className="stat-label">Success Rate</div>
                        </div>
                    </div>

                    {/* TRANSACTION TYPE BREAKDOWN */}
                    {summary.byType && Object.keys(summary.byType).length > 0 && (
                        <div style={{ marginTop: "15px" }}>
                            <h5>By Transaction Type:</h5>
                            <table className="type-breakdown">
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Valid</th>
                                        <th>Invalid</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(summary.byType).map(([type, counts]) => (
                                        <tr key={type}>
                                            <td><strong>{type}</strong></td>
                                            <td className="success">{counts.valid}</td>
                                            <td className="error">{counts.invalid}</td>
                                            <td>{counts.valid + counts.invalid}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* FILE DOWNLOADS */}
                <section className="downloads-section">
                    <h4>📥 Downloads</h4>
                    <div className="download-buttons">
                        {files?.cleanedFile && (
                            <button
                                className="btn btn-success"
                                onClick={() => handleDownload(files.cleanedFile, "cleaned-data.csv")}
                                title="Download validated and cleaned data"
                            >
                                ✓ Cleaned Data ({validRows?.length || 0} rows)
                            </button>
                        )}

                        {files?.errorFile && (
                            <button
                                className="btn btn-error"
                                onClick={() => handleDownload(files.errorFile, "errors.csv")}
                                title="Download rows with validation errors"
                            >
                                ✗ Error Report ({invalidRows?.length || 0} rows)
                            </button>
                        )}
                    </div>
                </section>

                {/* VALID ROWS PREVIEW */}
                {validRows && validRows.length > 0 && (
                    <section className="preview-section">
                        <div
                            className="section-header"
                            onClick={() =>
                                setExpandedSection(
                                    expandedSection === "valid" ? null : "valid"
                                )
                            }
                            style={{ cursor: "pointer" }}
                        >
                            <h4>✓ Valid Rows ({validRows.length})</h4>
                            <span>{expandedSection === "valid" ? "▼" : "▶"}</span>
                        </div>

                        {expandedSection === "valid" && (
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Type</th>
                                            {Object.keys(validRows[0])
                                                .filter(key => !key.startsWith('_'))
                                                .slice(0, 5)
                                                .map(key => (
                                                    <th key={key}>{key}</th>
                                                ))}
                                            <th>...</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {validRows.slice(0, 10).map((row, i) => (
                                            <tr key={i}>
                                                <td>{i + 1}</td>
                                                <td><span className="badge">{row._type}</span></td>
                                                {Object.entries(row)
                                                    .filter(([key]) => !key.startsWith('_'))
                                                    .slice(0, 5)
                                                    .map(([key, value]) => (
                                                        <td key={key}>{String(value).substring(0, 30)}</td>
                                                    ))}
                                                <td className="more-indicator">...</td>
                                            </tr>
                                        ))}
                                        {validRows.length > 10 && (
                                            <tr className="more-rows">
                                                <td colSpan="100">
                                                    ... and {validRows.length - 10} more rows
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}

                {/* INVALID ROWS DETAILS */}
                {invalidRows && invalidRows.length > 0 && (
                    <section className="preview-section errors">
                        <div
                            className="section-header"
                            onClick={() =>
                                setExpandedSection(
                                    expandedSection === "invalid" ? null : "invalid"
                                )
                            }
                            style={{ cursor: "pointer" }}
                        >
                            <h4>✗ Invalid Rows ({invalidRows.length})</h4>
                            <span>{expandedSection === "invalid" ? "▼" : "▶"}</span>
                        </div>

                        {expandedSection === "invalid" && (
                            <div className="errors-list">
                                {invalidRows.slice(0, 20).map((row, i) => (
                                    <div key={i} className="error-item">
                                        <div className="error-header">
                                            <strong>Row {row.rowNumber}</strong>
                                            <span className="badge error-type">{row.type}</span>
                                        </div>
                                        <div className="error-details">
                                            <div className="error-messages">
                                                {row.errors.map((err, j) => (
                                                    <div key={j} className="error-message">
                                                        • {err}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {invalidRows.length > 20 && (
                                    <div className="more-errors">
                                        ... and {invalidRows.length - 20} more errors
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                )}
            </div>
        );
    }

    return null;
}
