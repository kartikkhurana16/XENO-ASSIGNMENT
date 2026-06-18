const express = require("express");
const router = express.Router();

const upload = require("../middleware/multerConfig");
const { uploadCSV } = require("../controllers/uploadController");
const { downloadFile, downloadByPath, listOutputFiles } = require("../controllers/downloadController");
const { getJobStatus } = require("../controllers/jobController");

router.get("/job/:jobId", getJobStatus);
router.post("/upload", upload.single("csvFile"), uploadCSV);
router.get("/download/:filename", downloadFile);
router.get("/download-file", downloadByPath);
router.get("/files", listOutputFiles);

module.exports = router;
