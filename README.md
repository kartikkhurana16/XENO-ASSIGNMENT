# XENO-ASSIGNMENT
4. AI Empowerment
Build a web-based platform for transaction data validation and processing.
The platform should accept transaction datasets containing:
●
●
●
Order-level details
Product-level details
Payment mode information
It must perform comprehensive data validation, including:
●
●
●
Phone number validation based on country-specific rules (e.g., Singapore: 8 digits,
India: 10 digits), driven by configurable country codes
Date and time validation against predefined formats
General data integrity and format checks across all fields
Post-validation, the system should:
●
●
Generate a cleaned and validated output file available for download
Automatically split large CSV files into smaller, manageable chunks for efficient
handling
The solution should be scalable, user-friendly, and capable of handling diverse international
data formats.