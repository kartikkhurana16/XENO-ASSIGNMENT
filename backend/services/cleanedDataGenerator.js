const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const path = require("path");
const fs = require("fs");

const generateCleanedCSV = async (validRows) => {
    if (!validRows || validRows.length === 0) {
        return null;
    }

    // Ensure outputs directory exists
    const outputDir = "outputs";
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const filePath = path.join(outputDir, `cleaned-${Date.now()}.csv`);

    // Get all field names from the first row
    const firstRow = validRows[0];
    const headers = Object.keys(firstRow)
        .filter(key => !key.startsWith('_')) // Exclude internal fields
        .map((key) => ({
            id: key,
            title: key.toUpperCase()
        }));

    const csvWriter = createCsvWriter({
        path: filePath,
        header: headers
    });

    // Prepare records (exclude internal fields)
    const records = validRows.map(row => {
        const record = {};
        Object.keys(row).forEach(key => {
            if (!key.startsWith('_')) {
                record[key] = row[key];
            }
        });
        return record;
    });

    await csvWriter.writeRecords(records);

    return filePath;
};

module.exports = generateCleanedCSV;
