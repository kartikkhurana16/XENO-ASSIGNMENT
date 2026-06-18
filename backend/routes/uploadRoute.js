const express = require("express");
const router = express.Router();

const upload = require("../middleware/multerConfig");
const { uploadCSV } = require("../controllers/uploadController");
const { downloadFile } = require("../controllers/downloadController");
const { getJobStatus } = require("../controllers/jobController");

router.get("/job/:jobId", getJobStatus);
router.post("/upload", upload.single("file"), uploadCSV);
router.get("/download/:filename", downloadFile);

module.exports = router;