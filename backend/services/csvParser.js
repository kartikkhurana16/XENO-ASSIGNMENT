const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

// header alias map
let headerAliases = {};
try {
    headerAliases = require(path.join(__dirname, "..", "config", "headerAliases.json"));
} catch (e) {
    // no aliases configured
    headerAliases = {};
}

const parseCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => {
                // Normalize headers to snake_case lowercase and trim values
                const normalized = {};
                Object.keys(row).forEach((key) => {
                    if (!key) return;
                    const newKey = key
                        .toString()
                        .trim()
                        .toLowerCase()
                        .replace(/\uFEFF/g, '') // remove BOM if present
                        .replace(/\s+/g, "_")
                        .replace(/[^a-z0-9_]/g, "");

                    const val = row[key];
                    // apply alias mapping if exists
                    const mappedKey = headerAliases[newKey] || newKey;

                    // if mapped key already exists, keep the first non-empty value
                    if (normalized[mappedKey] === undefined || normalized[mappedKey] === "") {
                        normalized[mappedKey] = typeof val === 'string' ? val.trim() : val;
                    }
                });

                results.push(normalized);
            })
            .on("end", () => {
                resolve(results);
            })
            .on("error", (error) => {
                reject(error);
            });
    });
};

module.exports = parseCSV;