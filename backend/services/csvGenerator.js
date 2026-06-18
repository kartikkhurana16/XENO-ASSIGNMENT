const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const path = require("path");

const generateErrorCSV = async (invalidRows) => {
    const filePath = path.join(
        "outputs",
        `errors-${Date.now()}.csv`
    );

    const csvWriter = createCsvWriter({
        path: filePath,
        header: [
            { id: "rowNumber", title: "ROW_NUMBER" },
            { id: "name", title: "NAME" },
            { id: "age", title: "AGE" },
            { id: "city", title: "CITY" },
            { id: "error", title: "ERROR" }
        ]
    });

    const records = invalidRows.map((row) => ({
        rowNumber: row.rowNumber,
        name: row.data.name,
        age: row.data.age,
        city: row.data.city,
        error: row.errors.join(", ")
    }));

    await csvWriter.writeRecords(records);

    return filePath;
};

module.exports = generateErrorCSV;