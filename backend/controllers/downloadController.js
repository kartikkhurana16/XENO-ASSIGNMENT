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

exports.downloadByPath = async (req, res) => {
    try {
        const { filePath } = req.query;

        if (!filePath) {
            return res.status(400).json({
                success: false,
                message: "File path is required"
            });
        }

        // Security: prevent directory traversal attacks
        const normalizedPath = path.normalize(filePath);
        if (normalizedPath.includes("..")) {
            return res.status(400).json({
                success: false,
                message: "Invalid file path"
            });
        }

        const fullPath = path.join(__dirname, "..", normalizedPath);

        // Check if file exists
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({
                success: false,
                message: "File not found"
            });
        }

        // Determine filename for download
        const filename = path.basename(filePath);

        // Set response headers
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

        // Stream file to response
        const fileStream = fs.createReadStream(fullPath);
        fileStream.pipe(res);

        fileStream.on("error", (err) => {
            console.error("File stream error:", err);
            res.status(500).json({
                success: false,
                message: "Error downloading file"
            });
        });

    } catch (error) {
        console.error("Download error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.listOutputFiles = async (req, res) => {
    try {
        const outputDir = path.join(__dirname, "..", "outputs");

        if (!fs.existsSync(outputDir)) {
            return res.status(200).json({
                success: true,
                files: []
            });
        }

        const files = fs.readdirSync(outputDir).map(filename => {
            const filePath = path.join(outputDir, filename);
            const stats = fs.statSync(filePath);

            return {
                filename,
                path: `outputs/${filename}`,
                size: stats.size,
                createdAt: stats.birthtimeMs
            };
        });

        res.json({
            success: true,
            files: files.sort((a, b) => b.createdAt - a.createdAt)
        });

    } catch (error) {
        console.error("List files error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};