const parseCSV = require("./csvParser");
const validateCSVData = require("./validator");
const generateErrorCSV = require("./csvGenerator");
const splitCSV = require("./csvSplitter");
const fs = require("fs");

const processCSV = async (filePath) => {
    const data = await parseCSV(filePath);

    // validate and get structured result
    const result = validateCSVData(data);

    let errorFile = null;

    if (result.invalidRows.length > 0) {
        errorFile = await generateErrorCSV(result.invalidRows);
    }

    let splitFiles = [];

    if (data.length > 1000) {
        splitFiles = await splitCSV(data);
    }

    // Remove temporary uploaded file
    try {
        fs.unlinkSync(filePath);
    } catch (e) {
        // log but don't fail
        console.error("Failed to remove temp file:", e.message);
    }

    // Return the full validated result plus generated file info
    return {
        success: result.success,
        summary: result.summary,
        validRows: result.validRows,
        invalidRows: result.invalidRows,
        errorFile,
        splitFiles
    };
};

module.exports = processCSV;