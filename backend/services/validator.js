const fs = require("fs");
const path = require("path");

const rules = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../config/rules.json"), "utf-8")
);

// REQUIRED FIELDS
const validateRequiredFields = (row) => {
    const errors = [];

    rules.requiredFields.forEach((field) => {
        if (!row[field] || row[field].toString().trim() === "") {
            errors.push(`${field} is required`);
        }
    });

    return errors;
};

// DATE VALIDATION
const validateDate = (dateStr) => {
    if (!dateStr) return { valid: false, error: "Date is required" };

    const regex = /^\d{4}-\d{2}-\d{2}$/;

    if (!regex.test(dateStr)) {
        return {
            valid: false,
            error: "Date must be in YYYY-MM-DD format"
        };
    }

    return { valid: true };
};

// PHONE VALIDATION
const validatePhone = (phone, country) => {
    const rule = rules.phoneRules[country];

    if (!rule) {
        return {
            valid: false,
            error: "Unsupported country code"
        };
    }

    if (!phone || phone.toString().length !== rule) {
        return {
            valid: false,
            error: `Phone must be ${rule} digits for ${country}`
        };
    }

    return { valid: true };
};

// MAIN VALIDATOR (SINGLE SOURCE OF TRUTH)
const validateCSVData = (data) => {
    const validRows = [];
    const invalidRows = [];

    data.forEach((row, index) => {
        let errors = [];

        // 1. required fields (CONFIG DRIVEN)
        errors = errors.concat(validateRequiredFields(row));

        // 2. basic validation
        if (row.age && isNaN(row.age)) {
            errors.push("Age must be a number");
        }

        if (row.city && row.city.trim() === "") {
            errors.push("City is required");
        }

        // 3. phone validation
        const phoneCheck = validatePhone(row.phone, row.country);
        if (!phoneCheck.valid) {
            errors.push(phoneCheck.error);
        }

        // 4. date validation
        const dateCheck = validateDate(row.date);
        if (!dateCheck.valid) {
            errors.push(dateCheck.error);
        }

        // classification
        if (errors.length > 0) {
            invalidRows.push({
                rowNumber: index + 1,
                data: row,
                errors
            });
        } else {
            validRows.push(row);
        }
    });

    return {
    success: true,
    summary: {
        totalRows: validRows.length + invalidRows.length,
        validRows: validRows.length,
        invalidRows: invalidRows.length
    },
    validRows,
    invalidRows,
    files: {
        errorFile: null
    }
};
};

module.exports = validateCSVData;