const { v4: uuidv4 } = require("uuid");
const runJob = require("../services/asyncProcessor");
const { createJob } = require("../services/jobStore");

exports.uploadCSV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No CSV file uploaded"
            });
        }

        // 1. create job id
        const jobId = uuidv4();

        // 2. register job
        createJob(jobId);

        // 3. get io instance
        const io = req.app.get("io");

        // 4. start async processing (DO NOT await)
        runJob(jobId, req.file.path, io);

        // 5. respond immediately (NO result here)
        return res.status(200).json({
            success: true,
            message: "File uploaded successfully. Processing started.",
            jobId
        });

    } catch (error) {
        console.error("Upload Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
