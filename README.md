> [\!NOTE]
> This repository is a working example of the concept described below. It may not yet include all recommended security hardening measures. My newer repositories now have robust security at both frontend and backend layers — rate limiting, SQL validation, concurrency controls, error sanitization, and more. You can use this repo to understand the core concept, but please apply security best practices before deploying to production. See my [80+ item Security Checklist](https://tigzig.com/security) and [live hardened examples](https://tigzig.com/security-examples) for reference.

# MF Portfolio File Converter

This application automates the processing of mutual fund portfolio disclosure files from India. It uses AI-powered schema detection to extract holdings data from Excel files, validates results across multiple AI models, and generates standardized text files with ISIN mappings and symbol enrichment. The tool handles various file formats, provides manual override options, and includes advanced features like file appending, data transposition, and cross-model validation for data integrity.

Built by Amar Harolikar // More tools at [app.tigzig.com](https://app.tigzig.com) // [LinkedIn Profile](https://www.linkedin.com/in/amarharolikar)

# Usage Guide

## Key Features

🎯 **AI-Powered Processing**: Automated schema detection and data extraction using OpenAI and Google Gemini models

📊 **Validation Diagnostics**: Real-time validation checks with visual indicators for data integrity

🔄 **Manual Override**: Flexible schema configuration for cases where AI detection needs adjustment

📝 **File Appender**: Utility to combine multiple text files while maintaining data structure

📋 **Data Preview**: Interactive table view with sorting and filtering capabilities

🔍 **Detailed Logging**: Comprehensive processing logs for transparency and debugging

## Basic Usage

1. **File Upload and Configuration**
   - Click the Upload button to select your Excel file
   - Enter the sheet name containing the portfolio data
   - Provide a descriptive scheme name
   - Select the month-end date
   - Choose output delimiter (Pipe, Comma, or Tab)
   - Click "Process - AI" to start automated processing

2. **Manual Override (If Needed)**
   - If AI schema detection isn't accurate, click "Manual Override"
   - Enter the data start row number
   - Specify column letters for:
     - ISIN
     - Instrument Name
     - Market Value
     - Quantity
   - Click Submit to process with manual schema

3. **Model Configuration**
   - Click "Models" to configure AI models
   - Select primary and validation models for structure analysis
   - Choose models for market value detection
   - Available models: OpenAI GPT, Google Gemini, Anthropic Claude
   - Changes apply immediately to new processing

4. **File Appender**
   - Click "Append" to combine multiple text files
   - Select files in desired order
   - First file's header is retained
   - Subsequent files' headers are automatically skipped
   - View file sizes and remove individual files
   - Click "Append Files" to create consolidated file

5. **File Transposer**
   - Click "Transpose" to pivot holdings data
   - Select processed text file for transposition
   - Choose input and output delimiters
   - Data is reorganized by NSE symbol across schemes and dates
   - Creates matrix view of holdings across time periods

6. **Validation Diagnostics**
   - Monitor the validation table for key metrics:
     - T-NAV comparisons between AI models
     - Record counts
     - Schema validations
     - Cash/Derivatives calculations
   - Orange highlights indicate validation issues
   - Warning icons show model discrepancies
   - Click "Legend" for detailed explanation of metrics

7. **Processing Logs**
   - View detailed processing steps
   - Track API calls and responses
   - Monitor data extraction progress
   - Click expand icon for full-screen view
   - Useful for troubleshooting issues

8. **Data Table**
   - Automatically populated after processing
   - Quick preview of extracted data
   - Sort columns by clicking headers
   - Filter data using search box
   - Right-click column headers for statistics and sorting options
   - Right-click table rows to view instrument details
   - Expand view for detailed analysis

9. **Download**
   - Click "Download" for processed file
   - File includes all extracted data with ISIN mappings
   - Additional balancing row (ISIN: IN9999999999) for cash/derivatives
   - File format: configurable delimiter (pipe, comma, or tab)

## Data Processing Features

**ISIN Mapping**: Automatically enriches data with BSE/NSE symbols and standardized company names using built-in mapping file.

**Cross-Model Validation**: Compares results from different AI models and highlights discrepancies with visual indicators.

**Error Handling**: Comprehensive logging and error recovery throughout the process.

**Mobile Support**: Responsive design that adapts to mobile devices.

**Keyboard Shortcuts**: Press ESC to close any open modal.

## Tips
- Always verify schema detection in validation table
- Use manual override if AI schema detection is incorrect
- Monitor orange warning indicators for potential issues
- Check processing logs for detailed operation flow
- Use legend button to understand validation metrics
- Right-click table elements for additional options
- Configure models based on your processing needs

## App Architecture & Build Instructions

### Frontend Components
- **HTML/CSS/JavaScript**: Single-page application with modular JavaScript architecture
- **Libraries**: Tailwind CSS, XLSX.js, SQL.js, jsPDF
- **Modules**: File processing, API communication, table handling, file operations
- **Responsive Design**: Mobile-optimized with adaptive UI elements

### Backend Requirements
- **FastAPI Server**: Required for AI model API calls
- **Proxy Server**: [OpenAI Realtime FastAPI Ephemeral](https://github.com/amararun/shared-openai-realtime-fastapi-ephemeral)
- **API Endpoints**: OpenRouter integration for multiple AI providers

### Data Processing Flow
1. Excel file upload and sheet selection
2. AI-powered schema detection using dual models
3. Data extraction with ISIN mapping enrichment
4. Cross-model validation and discrepancy highlighting
5. File generation with configurable delimiters

### Build Instructions
1. Clone this repository
2. Deploy the FastAPI proxy server from the linked repository
3. Update the `RT_ENDPOINT` in `assets/js/config.js` to point to your proxy server
4. Serve the frontend files from any web server
5. No environment variables required - all configuration is in `config.js`

### Deployment
- Frontend can be deployed to any static hosting service
- Backend requires Python FastAPI server deployment
- No database dependencies - uses in-memory processing 
## Author

Built by [Amar Harolikar](https://www.linkedin.com/in/amarharolikar/)

Explore 30+ open source AI tools for analytics, databases & automation at [tigzig.com](https://tigzig.com)
