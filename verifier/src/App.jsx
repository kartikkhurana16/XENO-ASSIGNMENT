import { useState, useEffect } from "react";
import Upload from "./components/Upload";
import JobStatus from "./components/JobStatus";
import "./style.css";
import { io } from "socket.io-client";

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
        const socket = io("http://localhost:5001");

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
        <div className="container">
            <h1>CSV Processing System</h1>

            {/* Upload */}
            <div className="card">
                <Upload addJob={addJob} />
            </div>

            {jobs.length > 0 && (
              <div className="card">
                  <h2>Job History</h2>

                  {jobs.map((job) => (
                      <div
                          key={job.jobId}
                          onClick={() => setSelectedJob(job.jobId)}
                          style={{
                              padding: "10px",
                              marginBottom: "8px",
                              border: "1px solid #ddd",
                              cursor: "pointer",
                              background:
                                  selectedJob === job.jobId ? "#e3f2fd" : "white"
                          }}
                      >
                          {/* Job ID */}
                          <b>{job.jobId}</b>

                          {/* Status */}
                          <span style={{ float: "right", color: getStatusColor(job.status) }}>
                              {job.status}
                          </span>

                          <br />

                          {/* Timestamp */}
                          <small>{job.createdAt}</small>
                      </div>
                  ))}
              </div>
          )}

            {/* Active Job View */}
            {selectedJob && (
                <div className="card">
                    <JobStatus jobId={selectedJob} />
                </div>
            )}
        </div>
    );
}
