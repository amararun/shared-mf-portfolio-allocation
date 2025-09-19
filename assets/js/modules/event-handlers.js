// Event Handler Module - Contains all application event handlers

// Import necessary modules and functions
import { processFullFile, extractInitialRows } from './file-processor.js';
import { analyzeWithAI } from './api-processor.js';

// Don't destructure from window, access properties directly when needed

/**
 * Initialize the file input event handlers
 */
export function initFileHandlers() {
    const fileInput = document.getElementById('mfFileInput');
    const uploadButton = document.getElementById('uploadButton');
    const selectedFileName = document.getElementById('selectedFileName');

    if (!fileInput || !uploadButton || !selectedFileName) {
        console.error('Required elements for file handling not found');
        return;
    }

    uploadButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            selectedFileName.textContent = file.name;
            // Additional file handling logic here
        }
    });
}

/**
 * Initialize the process button event handler
 */
export function initProcessButton() {
    // Process button handler for mutual fund processing
    document.getElementById('mfProcessButton').addEventListener('click', async function () {
        const fileInput = document.getElementById('mfFileInput');
        const sheetNameInput = document.getElementById('sheetNameInput');
        const schemeNameInput = document.getElementById('schemeNameInput');
        const monthEndInput = document.getElementById('monthEndInput');
        const sheetName = sheetNameInput.value.trim();

        if (!fileInput.files[0]) {
            alert("Please select a file first!");
            return;
        }

        if (!sheetName) {
            alert("Please enter a sheet name!");
            return;
        }

        if (!schemeNameInput.value.trim()) {
            alert("Please enter the scheme name!");
            return;
        }

        if (!monthEndInput.value) {
            alert("Please select the month end date!");
            return;
        }

        try {
            // Clear all display values before starting
            document.getElementById('totalValueDisplay').textContent = 'Waiting ...';
            document.getElementById('recordCountDisplay').textContent = 'Waiting ...';
            document.getElementById('totalQuantityDisplay').textContent = 'Waiting ...';
            document.getElementById('schemaAnalysisDisplay').textContent = 'Waiting...';
            document.getElementById('geminiSchemaDisplay').textContent = 'Waiting...';
            document.getElementById('geminiTotalValueDisplay').textContent = 'Waiting...';
            document.getElementById('openAITotalValueDisplay').textContent = 'Waiting...';
            document.getElementById('diffAmtDisplay').textContent = 'Waiting...';
            document.getElementById('performanceScoreDisplay').textContent = '';
            document.getElementById('investmentStyleDisplay').textContent = '';

            // Clear any background colors
            document.getElementById('schemaAnalysisDisplay').style.backgroundColor = '';
            document.getElementById('geminiSchemaDisplay').style.backgroundColor = '';
            document.getElementById('geminiTotalValueDisplay').style.backgroundColor = '';
            document.getElementById('openAITotalValueDisplay').style.backgroundColor = '';
            document.getElementById('diffAmtDisplay').style.backgroundColor = '';

            // Clear the data table
            document.getElementById('outputContainer').innerHTML = '';

            // Clear previous console output
            document.getElementById('mfConsoleOutput').innerHTML = '';

            // Reset download button state
            const downloadBtn = document.getElementById('downloadButton2');
            downloadBtn.disabled = true;
            downloadBtn.classList.remove('active');
            downloadBtn.classList.add('disabled');
            downloadBtn.setAttribute('disabled', 'disabled');
            window._modifiedFileContent = null;
            window._modifiedFileName = null;

            // Disable the process button while processing
            this.disabled = true;
            this.innerHTML = `
                <span class="button-icon">
                    <span class="material-icons" style="animation: spin 1s linear infinite;">hourglass_empty</span>
                </span>
                <span class="button-text">Processing...</span>
            `;

            const analysis = await analyzeMutualFundFile(fileInput.files[0], sheetName);

            // Activate the Data Table tab
            const dataTabButton = document.querySelector('[data-tab="data"]');
            if (dataTabButton) {
                const tabPanes = document.querySelectorAll('.tab-pane');
                const tabButtons = document.querySelectorAll('.tab-button');

                // Remove active class from all buttons and panes
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));

                // Add active class to data tab button and pane
                dataTabButton.classList.add('active');
                const dataPane = document.getElementById('data');
                if (dataPane) {
                    dataPane.classList.add('active');
                }
            }

        } catch (error) {
            window.logToConsole(`Processing failed: ${error.message}`, true);
            alert('Processing failed. Please check the console for details.');
        } finally {
            // Re-enable the process button
            this.disabled = false;
            this.innerHTML = `
                <span class="button-icon">
                    <span class="material-icons">play_circle</span>
                </span>
                <span class="button-text">Process</span>
            `;
        }
    });
}

/**
 * Helper function for analyzing mutual fund files
 */
async function analyzeMutualFundFile(file, sheetName) {
    try {
        window.logToConsole('Reading Excel file...');
        const initialRows = await extractInitialRows(file, sheetName);

        window.logToConsole('Analyzing file structure with AI...');
        const analysis = await analyzeWithAI(initialRows, file, sheetName);

        window.logToConsole('Analysis complete!');
        window.logToConsole(JSON.stringify(analysis, null, 2));

        // Process the full file with the analysis results
        await processFullFile(file, sheetName, analysis);

        return analysis;
    } catch (error) {
        window.logToConsole(`Error: ${error.message}`, true);
        throw error;
    }
}

/**
 * Initialize manual override form handlers
 */
export function initOverrideHandlers() {
    // Handle override form submission
    document.getElementById('overrideForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        // Get the submit button
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonContent = submitButton.innerHTML;

        // Disable the submit button and show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <span class="material-icons" style="animation: spin 1s linear infinite;">sync</span>
            Processing...
        `;

        const fileInput = document.getElementById('mfFileInput');
        const sheetNameInput = document.getElementById('sheetNameInput');
        const schemeNameInput = document.getElementById('schemeNameInput');
        const monthEndInput = document.getElementById('monthEndInput');
        const sheetName = sheetNameInput.value.trim();

        if (!fileInput.files[0]) {
            alert("Please select a file first!");
            // Reset button state
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonContent;
            return;
        }

        if (!sheetName) {
            alert("Please enter a sheet name!");
            // Reset button state
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonContent;
            return;
        }

        if (!schemeNameInput.value.trim()) {
            alert("Please enter the scheme name!");
            // Reset button state
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonContent;
            return;
        }

        if (!monthEndInput.value) {
            alert("Please select the month end date!");
            // Reset button state
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonContent;
            return;
        }

        try {
            // Clear previous console output
            document.getElementById('mfConsoleOutput').innerHTML = '';
            window.logToConsole('Processing with manual schema override...');

            // Create manual schema object
            const manualSchema = {
                dataStartRow: parseInt(document.getElementById('dataStartRow').value),
                columns: {
                    isin: document.getElementById('isinColumn').value.toUpperCase(),
                    instrumentName: document.getElementById('instrumentNameColumn').value.toUpperCase(),
                    marketValue: document.getElementById('marketValueColumn').value.toUpperCase(),
                    quantity: document.getElementById('quantityColumn').value.toUpperCase()
                }
            };
            window.logToConsole('Manual Schema:', JSON.stringify(manualSchema, null, 2));

            // Reset displays
            document.getElementById('totalValueDisplay').textContent = 'Waiting ...';
            document.getElementById('recordCountDisplay').textContent = 'Waiting ...';
            document.getElementById('totalQuantityDisplay').textContent = 'Waiting ...';
            document.getElementById('diffAmtDisplay').textContent = 'Waiting ...';

            // First analyze with AI to get the OpenAI value
            const initialRows = await extractInitialRows(fileInput.files[0], sheetName);
            const aiAnalysis = await analyzeWithAI(initialRows, fileInput.files[0], sheetName);

            window.logToConsole('Starting manual processing with schema:', JSON.stringify(manualSchema, null, 2));

            // Then process with manual schema
            await processFullFile(fileInput.files[0], sheetName, manualSchema);

            // Hide the override modal
            document.getElementById('overrideModal').style.display = 'none';

            // Log success
            window.logToConsole('File processed successfully with manual schema!');

            // Activate the Data Table tab
            const dataTabButton = document.querySelector('[data-tab="data"]');
            const tabPanes = document.querySelectorAll('.tab-pane');
            const tabButtons = document.querySelectorAll('.tab-button');

            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Add active class to data tab button and pane
            dataTabButton.classList.add('active');
            document.getElementById('data').classList.add('active');

        } catch (error) {
            window.logToConsole(`Error processing file: ${error.message}`, true);
            alert('Error processing file. Please check the console for details.');
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonContent;
        }
    });

    // Force uppercase for column inputs
    ['isinColumn', 'instrumentNameColumn', 'marketValueColumn', 'quantityColumn'].forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('input', function () {
            this.value = this.value.toUpperCase();
        });
    });

    // Add override button handlers
    document.getElementById('overrideButton').addEventListener('click', function () {
        document.getElementById('overrideModal').style.display = 'block';
    });

    document.getElementById('cancelOverride').addEventListener('click', function () {
        document.getElementById('overrideModal').style.display = 'none';
    });

    // Close modal when clicking outside
    document.getElementById('overrideModal').addEventListener('click', function (e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });

    // Add event listener for scheme name to auto-uppercase
    document.getElementById('schemeNameInput').addEventListener('input', function () {
        this.value = this.value.toUpperCase();
    });
}

/**
 * Initialize additional feature buttons (append, transpose, logs, etc.)
 */
export function initFeatureButtons() {
    // Add append button handler
    const appendButton = document.getElementById('appendButton');
    if (appendButton) {
        appendButton.addEventListener('click', function() {
            console.log('Append button clicked');
            try {
                if (typeof FileAppender === 'undefined' || !FileAppender.showModal) {
                    console.error('FileAppender not properly loaded');
                    alert('Append functionality is not available. Please refresh the page and try again.');
                    return;
                }
                FileAppender.showModal();
            } catch (error) {
                console.error('Error showing FileAppender modal:', error);
                alert('Could not open the append modal. Please try again later.');
            }
        });
    } else {
        console.error('Append button not found in the DOM');
    }
    
    // Add transpose button handler
    const transposeButton = document.getElementById('transposeButton');
    if (transposeButton) {
        transposeButton.addEventListener('click', function() {
            console.log('Transpose button clicked');
            try {
                if (typeof FileTransposer === 'undefined' || !FileTransposer.showModal) {
                    console.error('FileTransposer not properly loaded');
                    alert('Transpose functionality is not available. Please refresh the page and try again.');
                    return;
                }
                FileTransposer.showModal();
            } catch (error) {
                console.error('Error showing FileTransposer modal:', error);
                alert('Could not open the transpose modal. Please try again later.');
            }
        });
    } else {
        console.error('Transpose button not found in the DOM');
    }

    // Add logs modal functionality
    document.getElementById('expandLogsBtn').addEventListener('click', function() {
        const modal = document.getElementById('logsModal');
        const modalContainer = modal.querySelector('.modal-logs-container');
        const consoleOutput = document.getElementById('mfConsoleOutput');

        // Clone the console output
        modalContainer.innerHTML = consoleOutput.innerHTML;

        // Show the modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

    // Close logs modal when clicking the close button
    document.querySelector('#logsModal .close-modal').addEventListener('click', function() {
        document.getElementById('logsModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    // Close logs modal when clicking outside
    document.getElementById('logsModal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

/**
 * Initialize legend and help related buttons
 */
export function initHelpButtons() {
    // Add legend button functionality
    document.getElementById('legendButton').addEventListener('click', function() {
        document.getElementById('legendModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

    // Close legend modal when clicking the close button
    document.querySelector('#legendModal .close-modal').addEventListener('click', function() {
        document.getElementById('legendModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    // Close legend modal when clicking outside
    document.getElementById('legendModal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

/**
 * Initialize model configuration modal
 */
export function initModelConfig() {
    // Models Modal Functionality
    document.getElementById('placeholderBtn1').addEventListener('click', function() {
        const modal = document.getElementById('modelsModal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Populate dropdowns if not already done
        populateModelDropdowns();

        // Set current values from CONFIG - ensure prefix compatibility
        // For primary structure model
        const primaryStructureModel = window.CONFIG.PRIMARY_MODEL_STRUCTURE.includes('/') ? 
            window.CONFIG.PRIMARY_MODEL_STRUCTURE : 
            (window.CONFIG.PRIMARY_MODEL_STRUCTURE === 'gpt-4o' ? 'openai/gpt-4.1' : `openai/${window.CONFIG.PRIMARY_MODEL_STRUCTURE}`);
        
        // For primary market value model
        const primaryMarketModel = window.CONFIG.PRIMARY_MODEL_MARKET_VALUE.includes('/') ? 
            window.CONFIG.PRIMARY_MODEL_MARKET_VALUE : 
            (window.CONFIG.PRIMARY_MODEL_MARKET_VALUE === 'gpt-4o' ? 'openai/gpt-4.1' : `openai/${window.CONFIG.PRIMARY_MODEL_MARKET_VALUE}`);
        
        document.getElementById('openaiStructure').value = primaryStructureModel;
        document.getElementById('openaiMarketValue').value = primaryMarketModel;
        document.getElementById('openrouterStructure').value = window.CONFIG.OPENROUTER_MODEL_STRUCTURE;
        document.getElementById('openrouterMarketValue').value = window.CONFIG.OPENROUTER_MODEL_MARKET_VALUE;
    });

    // Close models modal when clicking cancel
    document.getElementById('cancelModels').addEventListener('click', function() {
        document.getElementById('modelsModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    // Close models modal when clicking outside
    document.getElementById('modelsModal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Handle models form submission
    document.getElementById('modelsForm').addEventListener('submit', function(e) {
        e.preventDefault();

        // Update CONFIG object with new values - all models now use full paths with provider prefixes
        window.CONFIG.PRIMARY_MODEL_STRUCTURE = document.getElementById('openaiStructure').value;
        window.CONFIG.PRIMARY_MODEL_MARKET_VALUE = document.getElementById('openaiMarketValue').value;
        window.CONFIG.OPENROUTER_MODEL_STRUCTURE = document.getElementById('openrouterStructure').value;
        window.CONFIG.OPENROUTER_MODEL_MARKET_VALUE = document.getElementById('openrouterMarketValue').value;

        // Update model labels in the stats table
        document.getElementById('schemaModelLabel').textContent = `Schema-Main/${window.CONFIG.getDisplayName(window.CONFIG.PRIMARY_MODEL_STRUCTURE)}`;
        document.getElementById('geminiSchemaLabel').textContent = `Schema-Validation/${window.CONFIG.OPENROUTER_MODEL_STRUCTURE.split('/')[1]}`;
        document.getElementById('geminiModelLabel').textContent = `T-MV-Validation/${window.CONFIG.OPENROUTER_MODEL_MARKET_VALUE.split('/')[1]}`;
        document.getElementById('openaiModelLabel').textContent = `T-MV-Main/${window.CONFIG.getDisplayName(window.CONFIG.PRIMARY_MODEL_MARKET_VALUE)}`;

        // Log the changes
        window.logToConsole('\n=== Model Configuration Updated ===');
        window.logToConsole('Primary Structure:', window.CONFIG.PRIMARY_MODEL_STRUCTURE);
        window.logToConsole('Primary Market Value:', window.CONFIG.PRIMARY_MODEL_MARKET_VALUE);
        window.logToConsole('Validation Structure:', window.CONFIG.OPENROUTER_MODEL_STRUCTURE);
        window.logToConsole('Validation Market Value:', window.CONFIG.OPENROUTER_MODEL_MARKET_VALUE);

        // Close the modal
        document.getElementById('modelsModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    });
}

/**
 * Initialize global keyboard handlers
 */
export function initKeyboardHandlers() {
    // Add global ESC key handler to close any open modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close all possible modals
            const modals = [
                document.getElementById('modelsModal'),
                document.getElementById('overrideModal'),
                document.getElementById('logsModal'),
                document.getElementById('legendModal'),
                document.getElementById('tableModal')
            ];
            
            // Try to find the first visible modal and close it
            let modalClosed = false;
            
            // First check FileAppender and FileTransposer since they're special cases
            if (!modalClosed && typeof FileAppender !== 'undefined' && FileAppender.closeModal) {
                const appenderModal = document.getElementById('fileAppenderModal');
                if (appenderModal && appenderModal.style.display === 'block') {
                    FileAppender.closeModal();
                    modalClosed = true;
                }
            }
            
            if (!modalClosed && typeof FileTransposer !== 'undefined' && FileTransposer.closeModal) {
                const transposerModal = document.getElementById('transposerModal');
                if (transposerModal && transposerModal.style.display === 'block') {
                    FileTransposer.closeModal();
                    modalClosed = true;
                }
            }
            
            // If no special modal was closed, check the standard modals
            if (!modalClosed) {
                for (const modal of modals) {
                    if (modal && modal.style.display === 'block') {
                        modal.style.display = 'none';
                        document.body.style.overflow = 'auto';
                        modalClosed = true;
                        break;
                    }
                }
            }
            
            // If we closed a modal, stop the event from propagating
            if (modalClosed) {
                e.stopPropagation();
            }
        }
    });
}

/**
 * Helper function to populate model dropdowns
 * This is needed by the model config initialization
 */
function populateModelDropdowns() {
    console.log('Attempting to populate model dropdowns');
    
    // Get all dropdowns with the model-dropdown class
    const dropdowns = document.querySelectorAll('.model-dropdown');
    
    // For each dropdown, populate with options from CONFIG.AVAILABLE_MODELS
    dropdowns.forEach(dropdown => {
        // Clear existing options
        dropdown.innerHTML = '';
        
        // Add options from CONFIG.AVAILABLE_MODELS
        window.CONFIG.AVAILABLE_MODELS.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = `${model.displayName} (${model.provider})`;
            option.title = model.description;
            
            // Add data attributes for additional filtering/grouping if needed
            option.dataset.provider = model.provider;
            
            dropdown.appendChild(option);
        });
    });
    
    console.log('Model dropdowns populated successfully');
}

/**
 * Initialize all event handlers
 * This is the main function to be called from main.js
 */
export function initAllEventHandlers() {
    console.log('Initializing all event handlers...');
    
    // Initialize all handler groups
    initFileHandlers();
    initProcessButton();
    initOverrideHandlers();
    initFeatureButtons();
    initHelpButtons();
    initModelConfig();
    initKeyboardHandlers();
    
    console.log('All event handlers initialized');
} 