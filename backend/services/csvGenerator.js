const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const path = require("path");
const fs = require("fs");

const generateErrorCSV = async (invalidRows) => {
    if (!invalidRows || invalidRows.length === 0) {
        return null;
    }

    // Ensure outputs directory exists
    const outputDir = "outputs";
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const filePath = path.join(outputDir, `errors-${Date.now()}.csv`);

    // Determine headers based on transaction type
    const firstRow = invalidRows[0];
    const dataKeys = Object.keys(firstRow.data);

    // Standard error report columns
    const headers = [
        { id: "rowNumber", title: "ROW_NUMBER" },
        { id: "type", title: "TRANSACTION_TYPE" },
        { id: "error", title: "ERRORS" },
        ...dataKeys.map(key => ({
            id: `data_${key}`,
            title: `DATA_${key.toUpperCase()}`
        }))
    ];

    const csvWriter = createCsvWriter({
        path: filePath,
        header: headers
    });

    // Prepare records
    const records = invalidRows.map((row) => {
        const record = {
            rowNumber: row.rowNumber,
            type: row.type || "unknown",
            error: row.errors.join("; ")
        };

        // Add all data fields
        Object.keys(row.data).forEach(key => {
            record[`data_${key}`] = row.data[key];
        });

        return record;
    });

    await csvWriter.writeRecords(records);

    return filePath;
};

module.exports = generateErrorCSV;
