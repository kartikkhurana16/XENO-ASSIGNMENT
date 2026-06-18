import { useEffect, useState } from "react";
import { getJobStatus } from "../api";

export default function JobStatus({ jobId }) {
    const [job, setJob] = useState(null);

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

    // loading state
    if (!job) {
        return <p>Fetching latest job status...</p>;
    }

    return (
        <div style={{ marginTop: "20px" }}>
            <h3>
                Status:{" "}
                <span
                    style={{
                        color:
                            job.status === "done"
                                ? "green"
                                : "orange",
                        fontWeight: "bold"
                    }}
                >
                    {job.status}
                </span>
            </h3>

            {/* DONE STATE */}
            {job.status === "done" && job.result && (
                <>
                    <h4>Summary</h4>
                    <p>Total Rows: {job.result.totalRows}</p>

                    <h4>Valid Rows</h4>
                    <table border="1" cellPadding="5">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Age</th>
                                <th>City</th>
                            </tr>
                        </thead>
                        <tbody>
                            {job.result.validRows?.map((row, i) => (
                                <tr key={i}>
                                    <td>{row.name}</td>
                                    <td>{row.age}</td>
                                    <td>{row.city}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {job.result?.invalidRows?.length > 0 && (
    <div>
        <h4>Invalid Rows</h4>

        {job.result.invalidRows.map((row, i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
                <b>Row {row.rowNumber}</b>
                <ul>
                    {row.errors.map((err, j) => (
                        <li key={j} style={{ color: "red" }}>
                            {err}
                        </li>
                    ))}
                </ul>
            </div>
        ))}
    </div>
)}

                    {/* DOWNLOAD ERROR FILE */}
                    {job.result.errorFile && (
                        <div style={{ marginTop: "10px" }}>
                            <button
                                onClick={() =>
                                    window.open(
                                        `http://localhost:5001/api/download/${job.result.errorFile
                                            .split("/")
                                            .pop()}`
                                    )
                                }
                            >
                                Download Error CSV
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* PROCESSING STATE */}
            {job.status !== "done" && (
                <p>Processing your CSV file... please wait.</p>
            )}
        </div>
    );
}