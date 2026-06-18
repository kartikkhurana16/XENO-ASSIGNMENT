const { getJob } = require("../services/jobStore");

exports.getJobStatus = (req, res) => {
    const jobId = req.params.jobId;

    const job = getJob(jobId);

    if (!job) {
        return res.status(404).json({
            success: false,
            message: "Job not found"
        });
    }

    return res.status(200).json({
        success: true,
        job
    });
};