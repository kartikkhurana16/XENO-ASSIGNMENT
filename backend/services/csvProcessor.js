const parseCSV = require("./csvParser");
const validateCSVData = require("./validator");
const generateErrorCSV = require("./csvGenerator");
const splitCSV = require("./csvSplitter");
const fs = require("fs");

const processCSV = async (filePath) => {
    const data = await parseCSV(filePath);

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
    fs.unlinkSync(filePath);

    return {
        totalRows: data.length,
        validRows: result.validRows,
        invalidRows: result.invalidRows,
        errorFile,
        splitFiles
    };
};

module.exports = processCSV;