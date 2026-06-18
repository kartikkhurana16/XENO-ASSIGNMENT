const processCSV = require("./csvProcessor");
const generateCleanedCSV = require("./cleanedDataGenerator");
const { updateJob } = require("./jobStore");

const runJob = async (jobId, filePath, io) => {
    try {
        // 1. mark processing
        updateJob(jobId, { status: "processing" });

        if (io) {
            io.emit("job-update", { jobId, status: "processing" });
        }

        // 2. process file (returns validated result + generated errorFile)
        const result = await processCSV(filePath);

        // 3. generate cleaned output file if needed
        let cleanedFile = null;
        if (result.validRows && result.validRows.length > 0) {
            cleanedFile = await generateCleanedCSV(result.validRows);
        }

        // use errorFile returned by processCSV (if any)
        const errorFile = result.errorFile || null;

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
