// FileTransposer class for handling file transposition
class FileTransposer {
    static modal = null;
    static sqlPromise = null;
    static transposedContent = null;

    static async initSqlJs() {
        if (!this.sqlPromise) {
            try {
                // Explicitly check if initSqlJs is defined in the global scope
                if (typeof initSqlJs === 'undefined') {
                    console.error('initSqlJs is not defined. Make sure SQL.js is properly loaded.');
                    throw new Error('SQL.js library not loaded properly. Please check your internet connection and try again.');
                }
                
                this.sqlPromise = initSqlJs({
                    locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
                });
                await this.sqlPromise; // Test the initialization
                console.log('SQL.js initialized successfully');
            } catch (error) {
                console.error('Failed to initialize SQL.js:', error);
                alert('Failed to initialize SQL.js. Please check your internet connection and try again later.');
                throw error;
            }
        }
        return this.sqlPromise;
    }

    static updateFileName(input) {
        const fileNameSpan = document.getElementById('fileNameSpan');
        if (fileNameSpan) {
            fileNameSpan.textContent = input.files[0] ? input.files[0].name : 'No file chosen';
        } else {
            console.error('fileNameSpan element not found');
        }
    }

    static async showModal() {
        try {
            // Initialize SQL.js first
            await this.initSqlJs();
            
            if (!this.modal) {
                this.createModal();
            }
            this.modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Set default delimiter values from main app
            const mainDelimiter = document.getElementById('delimiterInput').value;
            document.getElementById('inputDelimiter').value = mainDelimiter;
            document.getElementById('outputDelimiter').value = mainDelimiter;
        } catch (error) {
            console.error('Error showing modal:', error);
            alert('Failed to initialize transposer: ' + error.message);
        }
    }

    static closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            console.log('FileTransposer modal closed');
        }
    }

    static createModal() {
        const modalHtml = `
            <div id="transposerModal" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; overflow-y: auto;">
                <div class="modal-content" style="background: white; max-width: 500px; margin: 40px auto; padding: 16px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); width: 90%; max-height: fit-content;">
                    <h3 style="margin: 0 0 6px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 18px;">File Transposer</h3>
                    <p style="margin: 0 0 10px 0; font-size: 12px; color: #666;">
                        Transpose mutual fund holdings data by NSE symbol across schemes and dates.
                    </p>
                    <form id="transposerForm" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 0;">
                        <div class="form-group" style="margin-bottom: 8px;">
                            <label for="fileInput" style="display: block; margin-bottom: 4px; font-weight: 500; color: #333; font-size: 13px;">Select File to Transpose</label>
                            <div class="file-input-container" style="position: relative;">
                                <label for="fileInput" class="control-button" style="
                                    display: inline-flex;
                                    align-items: center;
                                    gap: 6px;
                                    padding: 6px 16px;
                                    border: 1.5px solid #4f46e5;
                                    border-radius: 6px;
                                    font-weight: 500;
                                    background-color: transparent;
                                    color: #4f46e5;
                                    font-size: 13px;
                                    height: 32px;
                                    cursor: pointer;
                                    margin: 0;
                                ">
                                    <span class="material-icons" style="font-size: 18px;">upload_file</span>
                                    Choose File
                                </label>
                                <input type="file" id="fileInput" accept=".txt" required 
                                    style="position: absolute; left: -9999px; opacity: 0;">
                                <span id="fileNameSpan" style="margin-left: 10px; font-size: 13px; color: #1e40af; font-weight: 600; font-style: italic;">No file chosen</span>
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom: 8px;">
                            <label for="inputDelimiter" style="display: block; margin-bottom: 4px; font-weight: 500; color: #333; font-size: 13px;">Input File Delimiter</label>
                            <select id="inputDelimiter" class="form-select" style="width: 100%; padding: 6px 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 13px; height: 32px;">
                                <option value="|">Pipe (|)</option>
                                <option value=",">Comma (,)</option>
                                <option value="\\t">Tab</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: 8px;">
                            <label for="outputDelimiter" style="display: block; margin-bottom: 4px; font-weight: 500; color: #333; font-size: 13px;">Output File Delimiter</label>
                            <select id="outputDelimiter" class="form-select" style="width: 100%; padding: 6px 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 13px; height: 32px;">
                                <option value="|">Pipe (|)</option>
                                <option value=",">Comma (,)</option>
                                <option value="\\t">Tab</option>
                            </select>
                        </div>
                        <div class="form-buttons" style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px; margin-bottom: 0;">
                            <button type="button" id="cancelTranspose" class="control-button" style="
                                padding: 6px 16px;
                                background-color: transparent;
                                color: #4f46e5;
                                border: 1.5px solid #4f46e5;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 13px;
                                height: 32px;
                                display: inline-flex;
                                align-items: center;
                                gap: 6px;
                            ">Cancel</button>
                            <button type="submit" class="control-button" style="
                                padding: 6px 16px;
                                background-color: transparent;
                                color: #4f46e5;
                                border: 1.5px solid #4f46e5;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 13px;
                                height: 32px;
                                display: inline-flex;
                                align-items: center;
                                gap: 6px;
                            ">
                                <span class="material-icons" style="font-size: 18px;">merge_type</span>
                                Transpose
                            </button>
                            <button type="button" id="downloadTransposed" class="control-button" disabled style="
                                padding: 6px 16px;
                                background-color: transparent;
                                color: #4f46e5;
                                border: 1.5px solid #4f46e5;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 13px;
                                height: 32px;
                                display: inline-flex;
                                align-items: center;
                                gap: 6px;
                            ">
                                <span class="material-icons" style="font-size: 18px;">download</span>
                                Download
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const modalElement = document.createElement('div');
        modalElement.innerHTML = modalHtml;
        document.body.appendChild(modalElement);
        this.modal = document.getElementById('transposerModal');

        // Add event listeners
        document.getElementById('cancelTranspose').addEventListener('click', () => {
            this.modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });

        document.getElementById('transposerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleTransposition();
        });
        
        // Add event listener for file input change
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.updateFileName(e.target);
        });

        // Add escape key handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.modal && this.modal.style.display === 'block') {
                    this.closeModal();
                    e.stopPropagation(); // Prevent event from bubbling up
                }
            }
        });
    }

    static async handleTransposition() {
        const fileInput = document.getElementById('fileInput');
        const inputDelimiter = document.getElementById('inputDelimiter').value;
        const outputDelimiter = document.getElementById('outputDelimiter').value;
        const downloadBtn = document.getElementById('downloadTransposed');
        const submitBtn = document.querySelector('#transposerForm button[type="submit"]');

        if (!fileInput.files[0]) {
            alert('Please select a file to transpose');
            return;
        }

        try {
            // Disable submit button and show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="material-icons" style="animation: spin 1s linear infinite;">sync</span> Processing...';
            downloadBtn.disabled = true;

            const fileContent = await this.readFile(fileInput.files[0]);
            const transposedData = await this.transposeData(fileContent, inputDelimiter, outputDelimiter);

            // Store the transposed data for download
            this.transposedContent = transposedData;

            // Enable download button
            downloadBtn.disabled = false;
            downloadBtn.style.backgroundColor = '#16a34a';
            downloadBtn.style.cursor = 'pointer';

            // Add download handler
            downloadBtn.onclick = () => this.downloadTransposedFile();

        } catch (error) {
            console.error('Transposition error:', error);
            alert('Error during transposition: ' + error.message);
        } finally {
            // Reset submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Transpose';
        }
    }

    static async readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('File reading failed'));
            reader.readAsText(file);
        });
    }

    static async transposeData(content, inputDelimiter, outputDelimiter) {
        let db = null;
        try {
            const SQL = await this.sqlPromise;
            if (!SQL) {
                throw new Error('SQL.js not initialized');
            }
            
            db = new SQL.Database();
            console.log('Created SQL database instance');

            // Log the first few lines of content for debugging
            console.log('First few lines of content:', content.split('\n').slice(0, 3));

            // Create temporary table for raw data
            db.run(`CREATE TABLE mf_data (
                SCHEME_NAME TEXT,
                MONTH_END TEXT,
                ISIN TEXT,
                INSTRUMENT_NAME TEXT,
                MARKET_VALUE REAL,
                QUANTITY INTEGER,
                BSE_SYMBOL TEXT,
                NSE_SYMBOL TEXT,
                COMPANY_NAME_STD TEXT
            )`);
            console.log('Created main table structure');

            // Parse and insert data
            const rows = content.trim().split('\n').slice(1); // Skip header
            const stmt = db.prepare(`INSERT INTO mf_data VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            
            console.log('Processing', rows.length, 'rows');
            rows.forEach((row, index) => {
                try {
                    const cols = row.split(inputDelimiter === '\\t' ? '\t' : inputDelimiter);
                    if (cols.length !== 9) {
                        console.warn(`Row ${index + 1} has ${cols.length} columns instead of 9:`, row);
                        return; // Skip invalid rows
                    }
                    // Clean and validate the data
                    const cleanedCols = cols.map(col => col.trim().replace(/['"]/g, '')); // Remove quotes and trim
                    stmt.run(cleanedCols);
                } catch (e) {
                    console.error(`Error processing row ${index + 1}:`, e);
                    console.error('Row data:', row);
                    throw new Error(`Error processing row ${index + 1}: ${e.message}`);
                }
            });
            console.log('Data inserted successfully');

            // Step 1: Create temporary name matching table with distinct ISIN-INSTRUMENT_NAME combinations
            console.log('Creating temporary name matching table - Step 1');
            db.run(`
                CREATE TABLE temp_name_matching_step1 AS
                SELECT DISTINCT ISIN, INSTRUMENT_NAME
                FROM mf_data
                WHERE ISIN IS NOT NULL
                  AND INSTRUMENT_NAME IS NOT NULL
                  AND INSTRUMENT_NAME != ''
            `);

            // Step 2: Create final name matching table with unique ISINs (keeping first occurrence)
            console.log('Creating final name matching table - Step 2');
            db.run(`
                CREATE TABLE temp_name_matching AS
                SELECT ISIN, MIN(INSTRUMENT_NAME) as INSTRUMENT_NAME
                FROM temp_name_matching_step1
                GROUP BY ISIN
            `);

            // Get unique schemes and dates for dynamic pivot
            const schemeDatesQuery = `
                SELECT DISTINCT SCHEME_NAME || '_' || MONTH_END as SCHEME_DATE
                FROM mf_data
                ORDER BY SCHEME_NAME, MONTH_END
            `;
            console.log('Executing scheme dates query:', schemeDatesQuery);
            
            const schemeDatesResult = db.exec(schemeDatesQuery);
            if (!schemeDatesResult || !schemeDatesResult[0]) {
                throw new Error('No data found in the input file');
            }
            
            const schemeDates = schemeDatesResult[0].values.flat();
            console.log('Found scheme dates:', schemeDates);

            // Build dynamic pivot query with proper escaping
            const pivotColumns = schemeDates.map(schemeDate => {
                const escapedSchemeDate = schemeDate.replace(/'/g, "''");
                return `
                    MAX(CASE WHEN SCHEME_NAME || '_' || MONTH_END = '${escapedSchemeDate}' 
                        THEN MARKET_VALUE END) as "${schemeDate}_MARKET_VALUE",
                    MAX(CASE WHEN SCHEME_NAME || '_' || MONTH_END = '${escapedSchemeDate}' 
                        THEN QUANTITY END) as "${schemeDate}_QUANTITY"
                `;
            }).join(',\n');

            // Create transposed view with initial data
            const createTransposedViewQuery = `
                CREATE TABLE transposed_data AS
                SELECT 
                    NSE_SYMBOL,
                    BSE_SYMBOL,
                    COMPANY_NAME_STD,
                    t1.ISIN,
                    ${pivotColumns}
                FROM mf_data t1
                GROUP BY NSE_SYMBOL, BSE_SYMBOL, COMPANY_NAME_STD, t1.ISIN
                ORDER BY NSE_SYMBOL
            `;
            console.log('Creating transposed view');
            db.run(createTransposedViewQuery);

            // Update COMPANY_NAME_STD with INSTRUMENT_NAME where it's blank
            console.log('Updating blank company names with instrument names');
            db.run(`
                UPDATE transposed_data
                SET COMPANY_NAME_STD = (
                    SELECT m.INSTRUMENT_NAME
                    FROM temp_name_matching m
                    WHERE m.ISIN = transposed_data.ISIN
                )
                WHERE (COMPANY_NAME_STD IS NULL OR TRIM(COMPANY_NAME_STD) = '')
                  AND ISIN IN (SELECT ISIN FROM temp_name_matching)
            `);

            // Get final results
            const finalQuery = `
                SELECT *
                FROM transposed_data
                ORDER BY 
                    CASE 
                        WHEN NSE_SYMBOL IS NULL OR TRIM(NSE_SYMBOL) = '' THEN 2
                        ELSE 1
                    END,
                    NSE_SYMBOL
            `;
            console.log('Executing final query with modified ordering');
            const result = db.exec(finalQuery)[0];
            if (!result) {
                throw new Error('No results in final query');
            }
            
            const headers = ['NSE_SYMBOL', 'BSE_SYMBOL', 'COMPANY_NAME_STD', 'ISIN', ...schemeDates.flatMap(sd => 
                [`${sd}_MARKET_VALUE`, `${sd}_QUANTITY`]
            )];

            // Format output
            const outputRows = [headers.join(outputDelimiter === '\\t' ? '\t' : outputDelimiter)];
            result.values.forEach(row => {
                outputRows.push(row.join(outputDelimiter === '\\t' ? '\t' : outputDelimiter));
            });
            
            console.log('Transposition and name population completed successfully');
            return outputRows.join('\n');

        } catch (error) {
            console.error('Error in transposeData:', error);
            console.error('SQL Error Details:', error.message);
            throw new Error(`Transposition failed: ${error.message}`);
        } finally {
            if (db) {
                try {
                    db.close();
                    console.log('Database connection closed');
                } catch (e) {
                    console.error('Error closing database:', e);
                }
            }
        }
    }

    static downloadTransposedFile() {
        if (!this.transposedContent) return;

        const blob = new Blob([this.transposedContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mutual_fund_transposed.txt';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
}

// Make FileTransposer available globally
window.FileTransposer = FileTransposer;

// Export the FileTransposer class
export default FileTransposer; 