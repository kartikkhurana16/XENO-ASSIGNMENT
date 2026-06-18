import { useState, useEffect } from "react";
import Upload from "./components/Upload";
import JobStatus from "./components/JobStatus";
import "./App.css";
import { io } from "socket.io-client";
import { API_BASE_URL } from "./api";

export default function App() {
    const getStatusColor = (status) => {
        switch (status) {
            case "processing":
                return "orange";
            case "done":
                return "green";
            case "failed":
                return "red";
            default:
                return "gray";
        }
    };

    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);

    useEffect(() => {
        const socket = io(API_BASE_URL);

        socket.on("job-update", (data) => {
            setJobs((prev) =>
                prev.map((job) =>
                    job.jobId === data.jobId
                        ? { ...job, status: data.status }
                        : job
                )
            );
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const addJob = (jobId) => {
        const newJob = {
            jobId,
            status: "processing",
            createdAt: new Date().toLocaleTimeString()
        };

        setJobs((prev) => [newJob, ...prev]);
        setSelectedJob(jobId);
    };

    return (
        <div className="app">

            {/* MAIN CONTENT */}
            <main className="app-main">
                <div className="container">
                    {/* UPLOAD CARD */}
                    <section className="card upload-card">
                        <Upload addJob={addJob} />
                    </section>

                    {/* JOB HISTORY */}
                    {jobs.length > 0 && (
                        <section className="card history-card">
                            <h2>Processing</h2>
                            <div className="jobs-list">
                                {jobs.map((job) => (
                                    <div
                                        key={job.jobId}
                                        className={`job-item ${selectedJob === job.jobId ? 'active' : ''}`}
                                        onClick={() => setSelectedJob(job.jobId)}
                                    >
                                        <div className="job-info">
                                            <div className="job-id">{job.jobId.substring(0, 8)}...</div>
                                            <div className="job-time">{job.createdAt}</div>
                                        </div>
                                        <span
                                            className="job-status"
                                            style={{ color: getStatusColor(job.status) }}
                                        >
                                            {job.status.toUpperCase()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ACTIVE JOB VIEW */}
                    {selectedJob && (
                        <section className="card details-card">
                            <div className="details-header">
                                <h2>Job Details</h2>
                                <button
                                    className="close-btn"
                                    onClick={() => setSelectedJob(null)}
                                    title="Close details"
                                >
                                    ✕
                                </button>
                            </div>
                            <JobStatus jobId={selectedJob} />
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}
