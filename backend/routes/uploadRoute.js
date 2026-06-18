const express = require("express");
const router = express.Router();

const upload = require("../middleware/multerConfig");
const { uploadCSV } = require("../controllers/uploadController");
const { downloadFile, downloadByPath, listOutputFiles } = require("../controllers/downloadController");
const { getJobStatus } = require("../controllers/jobController");

router.get("/job/:jobId", getJobStatus);
router.post("/upload", upload.single("csvFile"), uploadCSV);

// Multer error handling middleware
router.use((err, req, res, next) => {
    if (err instanceof require("multer").MulterError) {
        return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`
        });
    } else if (err) {
        return res.status(400).json({
            success: false,
            message: `Error: ${err.message}`
        });
    }
    next();
});

router.get("/download/:filename", downloadFile);
router.get("/download-file", downloadByPath);
router.get("/files", listOutputFiles);

module.exports = router;
