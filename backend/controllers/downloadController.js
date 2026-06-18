const path = require("path");
const fs = require("fs");

exports.downloadFile = (req, res) => {
    try {
        const fileName = req.params.filename;

        // 1. basic validation
        if (!fileName || typeof fileName !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid filename"
            });
        }

        // 2. allow only CSV files
        if (!fileName.endsWith(".csv")) {
            return res.status(400).json({
                success: false,
                message: "Only CSV files allowed"
            });
        }

        const outputDir = path.join(__dirname, "../outputs");
        const filePath = path.join(outputDir, fileName);

        // 3. prevent path traversal attack
        const normalized = path.normalize(filePath);
        if (!normalized.startsWith(outputDir)) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        // 4. check file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: "File not found"
            });
        }

        // 5. send file
        return res.download(filePath);

    } catch (error) {
        console.error("Download Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};