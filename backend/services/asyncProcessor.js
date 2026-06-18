const processCSV = require("./csvProcessor");
const validateCSVData = require("./validator");
const generateErrorCSV = require("./csvGenerator");
const generateCleanedCSV = require("./cleanedDataGenerator");
const { updateJob } = require("./jobStore");

const runJob = async (jobId, filePath, io) => {
    try {
        // 1. mark processing
        updateJob(jobId, { status: "processing" });

        if (io) {
            io.emit("job-update", { jobId, status: "processing" });
        }

        // 2. process file
        const data = await processCSV(filePath);
        const result = validateCSVData(data);

        // 3. generate error file if needed
        let errorFile = null;
        if (result.invalidRows.length > 0) {
            errorFile = await generateErrorCSV(result.invalidRows);
        }

        // 4. generate cleaned output file
        let cleanedFile = null;
        if (result.validRows.length > 0) {
            cleanedFile = await generateCleanedCSV(result.validRows);
        }

        // 5. final result
        const finalResult = {
            summary: result.summary,
            validRows: result.validRows,
            invalidRows: result.invalidRows,
            files: {
                errorFile,
                cleanedFile
            }
        };

        // 6. update store
        updateJob(jobId, {
            status: "done",
            result: finalResult
        });

        if (io) {
            io.emit("job-update", {
                jobId,
                status: "done",
                result: finalResult
            });
        }

    } catch (error) {
        console.error("Job error:", error);
        updateJob(jobId, {
            status: "failed",
            error: error.message
        });

        if (io) {
            io.emit("job-update", {
                jobId,
                status: "failed",
                error: error.message
            });
        }
    }
};

module.exports = runJob;
