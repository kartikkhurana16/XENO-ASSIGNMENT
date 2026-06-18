import { useState } from "react";
import { uploadCSV } from "../api";
import "../styles/Upload.css";

export default function Upload({ addJob }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const validateFile = (f) => {
        if (!f) return false;
        if (f.type !== "text/csv" && !f.name.endsWith(".csv")) {
            alert("❌ Only CSV files are allowed!");
            return false;
        }
        if (f.size > 5 * 1024 * 1024) {
            alert("❌ File size must be less than 5MB!");
            return false;
        }
        return true;
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles && droppedFiles[0]) {
            const droppedFile = droppedFiles[0];
            if (validateFile(droppedFile)) {
                setFile(droppedFile);
            }
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && validateFile(selectedFile)) {
            setFile(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert("❌ Please select a CSV file first!");
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append("csvFile", file);

        try {
            const res = await uploadCSV(formData);
            addJob(res.data.jobId);
            setFile(null);
        } catch (error) {
            alert("❌ Upload failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload-container">
            <h2>Upload CSV FILE</h2>

            <div
                className={`drag-drop-zone ${dragActive ? "active" : ""} ${file ? "has-file" : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="csvInput"
                    accept=".csv"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="file-input"
                />

                <label htmlFor="csvInput" className="drag-drop-label">
                    {file ? (
                        <div className="file-info">
                            <div className="file-name">{file.name}</div>
                        </div>
                    ) : (
                        <div className="drag-drop-content">
                            <div className="drag-text">Upload CSV File</div>
                        </div>
                    )}
                </label>
            </div>

            <div className="upload-info">
                <p>✓ Validates: Phone numbers, Dates, Times, Email, Amounts, Payment modes</p>
                <p>✓ Auto-detects: Transaction type (Order, Product, Payment)</p>
                <p>✓ Generates: Cleaned data & Error reports</p>
            </div>

            <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="upload-btn"
            >
                {loading ? (
                    <>
                        <span className="spinner-small"></span>
                        Uploading...
                    </>
                ) : (
                    "Submit"
                )}
            </button>
        </div>
    );
}