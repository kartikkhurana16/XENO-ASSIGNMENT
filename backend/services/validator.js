const fs = require("fs");
const path = require("path");

const rules = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../config/rules.json"), "utf-8")
);

// ==================== VALIDATORS ====================

// 1. REQUIRED FIELDS VALIDATION
const validateRequiredFields = (row, requiredFields) => {
    const errors = [];
    requiredFields.forEach((field) => {
        if (!row[field] || row[field].toString().trim() === "") {
            errors.push(`${field} is required`);
        }
    });
    return errors;
};

// 2. EMAIL VALIDATION
const validateEmail = (email) => {
    if (!email) return { valid: false, error: "Email is required" };
    const emailPattern = new RegExp(rules.commonRules.emailPattern);
    if (!emailPattern.test(email)) {
        return { valid: false, error: "Invalid email format" };
    }
    return { valid: true };
};

// 3. PHONE VALIDATION (Country-specific with format)
const validatePhone = (phone, country) => {
    if (!phone) return { valid: false, error: "Phone is required" };
    if (!country) return { valid: false, error: "Country is required" };

    const rule = rules.phoneRules[country];
    if (!rule) {
        return { valid: false, error: `Unsupported country code: ${country}` };
    }

    const phoneStr = phone.toString().trim();
    
    // Check pattern
    if (!new RegExp(rule.pattern).test(phoneStr)) {
        return { 
            valid: false, 
            error: `Phone must be ${rule.length} digits for ${country}` 
        };
    }
    
    return { valid: true };
};

// 4. DATE VALIDATION (Multiple formats supported)
const validateDate = (dateStr) => {
    if (!dateStr) return { valid: false, error: "Date is required" };

    const dateString = dateStr.toString().trim();
    
    // Check each supported format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$|^\d{2}-\d{2}-\d{4}$|^\d{2}\/\d{2}\/\d{4}$|^\d{4}\/\d{2}\/\d{2}$/;
    
    if (!dateRegex.test(dateString)) {
        return {
            valid: false,
            error: `Date must be in one of these formats: ${rules.dateFormats.join(", ")}`
        };
    }

    // Validate actual date
    let date;
    if (dateString.includes("-") && dateString.match(/^\d{4}/)) {
        date = new Date(dateString);
    } else if (dateString.includes("-")) {
        const parts = dateString.split("-");
        date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    } else {
        const parts = dateString.split(/[-/]/);
        date = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
    }

    if (isNaN(date.getTime())) {
        return { valid: false, error: "Invalid date value" };
    }

    return { valid: true };
};

// 5. TIME VALIDATION
const validateTime = (timeStr) => {
    if (!timeStr) return { valid: false, error: "Time is required" };

    const timeString = timeStr.toString().trim();
    const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?$/;

    if (!timeRegex.test(timeString)) {
        return {
            valid: false,
            error: `Time must be in format HH:mm or HH:mm:ss`
        };
    }

    return { valid: true };
};

// 6. PAYMENT MODE VALIDATION
const validatePaymentMode = (mode) => {
    if (!mode) return { valid: false, error: "Payment mode is required" };

    const modeStr = mode.toString().trim().toUpperCase();
    if (!rules.paymentModes.includes(modeStr)) {
        return {
            valid: false,
            error: `Invalid payment mode. Allowed: ${rules.paymentModes.join(", ")}`
        };
    }

    return { valid: true };
};

// 7. AMOUNT VALIDATION
const validateAmount = (amount) => {
    if (amount === undefined || amount === null || amount === "") {
        return { valid: false, error: "Amount is required" };
    }

    const amountStr = amount.toString().trim();
    if (!new RegExp(rules.commonRules.amountPattern).test(amountStr)) {
        return {
            valid: false,
            error: "Amount must be a valid number (e.g., 100 or 100.50)"
        };
    }

    const numAmount = parseFloat(amountStr);
    if (numAmount < 0) {
        return { valid: false, error: "Amount cannot be negative" };
    }

    return { valid: true };
};

// 8. NUMERIC FIELD VALIDATION
const validateNumeric = (value, fieldName) => {
    if (value === undefined || value === null || value === "") {
        return { valid: false, error: `${fieldName} is required` };
    }

    if (isNaN(parseFloat(value))) {
        return { valid: false, error: `${fieldName} must be numeric` };
    }

    if (fieldName.toLowerCase().includes("quantity") && parseInt(value) <= 0) {
        return { valid: false, error: `${fieldName} must be greater than 0` };
    }

    return { valid: true };
};

// 9. ENUM VALIDATION
const validateEnum = (value, allowedValues, fieldName) => {
    if (!value) return { valid: false, error: `${fieldName} is required` };

    const valueStr = value.toString().trim().toUpperCase();
    if (!allowedValues.includes(valueStr)) {
        return {
            valid: false,
            error: `${fieldName} must be one of: ${allowedValues.join(", ")}`
        };
    }

    return { valid: true };
};

// 10. DETECT TRANSACTION TYPE
const detectTransactionType = (row) => {
    const keys = Object.keys(row);
    
    if (keys.includes("order_id") && keys.includes("customer_name")) return "order";
    if (keys.includes("product_id") && keys.includes("product_name")) return "product";
    if (keys.includes("transaction_id") && keys.includes("payment_mode")) return "payment";
    
    return null;
};

// 11. VALIDATE TRANSACTION (MAIN VALIDATOR)
const validateTransaction = (row, transactionType) => {
    const errors = [];
    const typeRules = rules.transactionTypes[transactionType];

    if (!typeRules) {
        return {
            errors: [`Unknown transaction type: ${transactionType}`]
        };
    }

    // Check required fields
    const requiredErrors = validateRequiredFields(row, typeRules.requiredFields);
    errors.push(...requiredErrors);

    // Validate numeric fields
    if (typeRules.numericFields) {
        typeRules.numericFields.forEach((field) => {
            if (row[field]) {
                const check = validateNumeric(row[field], field);
                if (!check.valid) errors.push(check.error);
            }
        });
    }

    // Transaction-type specific validations
    if (transactionType === "order") {
        if (row.customer_phone) {
            const phoneCheck = validatePhone(row.customer_phone, row.customer_country);
            if (!phoneCheck.valid) errors.push(phoneCheck.error);
        }
        if (row.customer_email) {
            const emailCheck = validateEmail(row.customer_email);
            if (!emailCheck.valid) errors.push(emailCheck.error);
        }
        if (row.order_date) {
            const dateCheck = validateDate(row.order_date);
            if (!dateCheck.valid) errors.push(dateCheck.error);
        }
        if (row.order_time) {
            const timeCheck = validateTime(row.order_time);
            if (!timeCheck.valid) errors.push(timeCheck.error);
        }
        if (row.payment_mode) {
            const modeCheck = validatePaymentMode(row.payment_mode);
            if (!modeCheck.valid) errors.push(modeCheck.error);
        }
        if (row.total_amount) {
            const amountCheck = validateAmount(row.total_amount);
            if (!amountCheck.valid) errors.push(amountCheck.error);
        }
    } else if (transactionType === "product") {
        if (row.sku) {
            if (!new RegExp(rules.commonRules.skuPattern).test(row.sku.toString().trim())) {
                errors.push("SKU must be 5-20 characters (alphanumeric and hyphen only)");
            }
        }
    } else if (transactionType === "payment") {
        if (row.payment_mode) {
            const modeCheck = validatePaymentMode(row.payment_mode);
            if (!modeCheck.valid) errors.push(modeCheck.error);
        }
        if (row.amount) {
            const amountCheck = validateAmount(row.amount);
            if (!amountCheck.valid) errors.push(amountCheck.error);
        }
        if (row.status) {
            const statusCheck = validateEnum(row.status, ["SUCCESS", "FAILED", "PENDING"], "status");
            if (!statusCheck.valid) errors.push(statusCheck.error);
        }
        if (row.payment_date) {
            const dateCheck = validateDate(row.payment_date);
            if (!dateCheck.valid) errors.push(dateCheck.error);
        }
    }

    return { errors };
};

// ==================== MAIN CSV VALIDATOR ====================
const validateCSVData = (data) => {
    const validRows = [];
    const invalidRows = [];
    const summary = {
        totalRows: data.length,
        validRows: 0,
        invalidRows: 0,
        byType: {}
    };
    if (!Array.isArray(data)) {
        console.error("Invalid CSV data format:", data);

        throw new Error("CSV parser did not return an array");
    }
    data.forEach((row, index) => {
        const transactionType = detectTransactionType(row);

        if (!transactionType) {
            invalidRows.push({
                rowNumber: index + 1,
                data: row,
                errors: ["Cannot determine transaction type from row data"],
                type: "unknown"
            });
            summary.invalidRows++;
            return;
        }

        // Initialize type counter
        if (!summary.byType[transactionType]) {
            summary.byType[transactionType] = { valid: 0, invalid: 0 };
        }

        const validation = validateTransaction(row, transactionType);

        if (validation.errors.length > 0) {
            invalidRows.push({
                rowNumber: index + 1,
                data: row,
                errors: validation.errors,
                type: transactionType
            });
            summary.invalidRows++;
            summary.byType[transactionType].invalid++;
        } else {
            validRows.push({ ...row, _type: transactionType });
            summary.validRows++;
            summary.byType[transactionType].valid++;
        }
    });

    return {
        success: true,
        summary,
        validRows,
        invalidRows
    };
};

module.exports = validateCSVData;
