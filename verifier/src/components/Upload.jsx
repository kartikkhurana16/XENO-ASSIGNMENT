import { useState } from "react";
import { uploadCSV } from "../api";

export default function Upload({ addJob }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);

        const formData = new FormData();
        formData.append("csvFile", file);

        const res = await uploadCSV(formData);

        addJob(res.data.jobId);

        setLoading(false);
    };

return (
    <div>
        <h2>Upload CSV</h2>

        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        <br /><br />

        <button onClick={handleUpload} disabled={loading}>
            {loading ? "Uploading..." : "Upload"}
        </button>
    </div>
);
}