const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const path = require("path");

const splitCSV = async (data, chunkSize = 1000) => {
    const files = [];

    for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);

        const filePath = path.join(
            "outputs",
            `split-${Date.now()}-${i}.csv`
        );

        const headers = Object.keys(chunk[0]).map((key) => ({
            id: key,
            title: key.toUpperCase()
        }));

        const csvWriter = createCsvWriter({
            path: filePath,
            header: headers
        });

        await csvWriter.writeRecords(chunk);

        files.push(filePath);
    }

    return files;
};

module.exports = splitCSV;