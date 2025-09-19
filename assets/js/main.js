// Main.js - Entry point for MF Portfolio Automation
console.log('Loading main.js...');

// Import table handler functions
import {
    displayInTable,
    setupExpandButton,
    setupTableFilter,
    setupSortableTable,
    setupContextMenu,
    setupBankNameContext
} from './modules/table-handlers.js';
console.log('Imported table handlers');

// Import file processing functions
import { processFullFile, extractInitialRows } from './modules/file-processor.js';
console.log('Imported file processor');

// Import API processing functions
import { analyzeWithAI, setCompareFunctions } from './modules/api-processor.js';
console.log('Imported API processor');

// Import file handling modules
import FileAppender from './modules/file-appender.js';
import FileTransposer from './modules/file-transposer.js';
console.log('Imported FileAppender and FileTransposer');

// Import event handler functions
import { initAllEventHandlers } from './modules/event-handlers.js';
console.log('Imported event handlers');

// Make the FileAppender and FileTransposer available in global scope
window.FileAppender = FileAppender;
window.FileTransposer = FileTransposer;
console.log('Set FileAppender and FileTransposer in global scope');

// Initialize FileAppender
FileAppender.init();
console.log('FileAppender initialized');

function isMobileDevice() {
    return (
        // Screen size checks
        (window.innerWidth <= 768 || window.screen.width <= 768) ||
        
        // User Agent checks
        /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        
        // Platform check
        /iPhone|iPod|Android/.test(navigator.platform) ||
        
        // Screen orientation capability
        ('orientation' in window)
    );
}

// Function to apply mobile styles
function applyMobileStyles() {
    const buttons = document.querySelectorAll('.control-button');
    const buttonTexts = document.querySelectorAll('.button-text');
    const sheetNameInput = document.getElementById('sheetNameInput');
    const schemeNameInput = document.getElementById('schemeNameInput');
    const monthEndInput = document.getElementById('monthEndInput');
    const fileControls = document.querySelector('.file-controls');
    const statsContainer = document.querySelector('.stats-container');
    const statsTable = document.querySelector('.stats-table');
    
    if (isMobileDevice()) {
        // Button styles
        buttons.forEach(button => {
            button.style.padding = '8px';
        });
        buttonTexts.forEach(text => {
            text.style.display = 'none';
        });

        // Input field styles for mobile
        if (sheetNameInput) {
            sheetNameInput.style.width = '80px';
        }
        if (schemeNameInput) {
            schemeNameInput.style.width = '100px';
        }
        if (monthEndInput) {
            monthEndInput.style.width = '100px';
        }
        if (fileControls) {
            fileControls.style.flexWrap = 'wrap';
            fileControls.style.gap = '8px';
            fileControls.style.justifyContent = 'flex-start';
        }

        // Stats table styles for mobile
        if (statsContainer) {
            statsContainer.style.width = '90%';
            statsContainer.style.padding = '2px 0';
            statsContainer.style.overflowX = 'auto';
            statsContainer.style.webkitOverflowScrolling = 'touch';
        }
        if (statsTable) {
            statsTable.style.minWidth = '600px';
            const cells = statsTable.querySelectorAll('td');
            cells.forEach(cell => {
                cell.style.whiteSpace = 'nowrap';
                cell.style.padding = '2px 6px';
            });
        }
    } else {
        // Reset styles for desktop
        buttons.forEach(button => {
            button.style.padding = '';
        });
        buttonTexts.forEach(text => {
            text.style.display = 'inline';
        });

        // Reset input field styles
        if (sheetNameInput) {
            sheetNameInput.style.width = '';
        }
        if (schemeNameInput) {
            schemeNameInput.style.width = '';
        }
        if (monthEndInput) {
            monthEndInput.style.width = '';
        }
        if (fileControls) {
            fileControls.style.flexWrap = '';
            fileControls.style.gap = '';
            fileControls.style.justifyContent = '';
        }

        // Reset stats table styles
        if (statsContainer) {
            statsContainer.style.width = '';
            statsContainer.style.padding = '';
            statsContainer.style.overflowX = '';
            statsContainer.style.webkitOverflowScrolling = '';
        }
        if (statsTable) {
            statsTable.style.minWidth = '';
            const cells = statsTable.querySelectorAll('td');
            cells.forEach(cell => {
                cell.style.whiteSpace = '';
                cell.style.padding = '';
            });
        }
    }
}

// Apply mobile styles on load and resize
window.addEventListener('load', applyMobileStyles);
window.addEventListener('resize', applyMobileStyles);

const jsPDF = window.jspdf.jsPDF;

// Function to log messages to the console
function logToConsole(message, isError = false) {
    const consoleOutput = document.getElementById('mfConsoleOutput');
    const logEntry = document.createElement('div');
    logEntry.style.color = isError ? '#dc3545' : '#333';
    logEntry.style.marginBottom = '5px';
    logEntry.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
    consoleOutput.appendChild(logEntry);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Export logToConsole function for use in other modules
window.logToConsole = logToConsole;

// Set up event handlers
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    try {
        // Initialize all event handlers from the event-handlers module
        initAllEventHandlers();
        
        // Initialize the compare functions in the api-processor module
        console.log('Setting compare functions in api-processor.js...');
        setCompareFunctions(compareAndHighlightSchemas, compareAndHighlightTNAV);
        console.log('Compare functions set successfully');
        
        // Set model names in labels
        document.getElementById('geminiModelLabel').textContent = `T-MV-Validation/${CONFIG.OPENROUTER_MODEL_MARKET_VALUE.split('/')[1]}`;
        document.getElementById('openaiModelLabel').textContent = `T-MV-Main/${CONFIG.getDisplayName(CONFIG.PRIMARY_MODEL_MARKET_VALUE)}`;
        document.getElementById('schemaModelLabel').textContent = `Schema-Main/${CONFIG.getDisplayName(CONFIG.PRIMARY_MODEL_STRUCTURE)}`;
        document.getElementById('geminiSchemaLabel').textContent = `Schema-Validation/${CONFIG.OPENROUTER_MODEL_STRUCTURE.split('/')[1]}`;
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

// Add CSS for the spinning animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

function compareAndHighlightSchemas(openaiSchema, geminiSchema) {
    const openaiDisplay = document.getElementById('schemaAnalysisDisplay');
    const geminiDisplay = document.getElementById('geminiSchemaDisplay');
    
    if (openaiSchema === geminiSchema) {
        // Schemas match - reset background colors and remove icons
        openaiDisplay.style.backgroundColor = '';
        geminiDisplay.style.backgroundColor = '';
        openaiDisplay.innerHTML = openaiSchema;
        geminiDisplay.innerHTML = geminiSchema;
    } else {
        // Schemas don't match - highlight with more noticeable orange warning color
        const warningColor = '#FFCC80';  // More saturated orange
        openaiDisplay.style.backgroundColor = warningColor;
        geminiDisplay.style.backgroundColor = warningColor;
        
        // Add warning icon
        const warningIcon = '<span class="material-icons" style="font-size: 14px; color: #e65100; vertical-align: middle; margin-right: 4px;">warning</span>';
        openaiDisplay.innerHTML = warningIcon + openaiSchema;
        geminiDisplay.innerHTML = warningIcon + geminiSchema;
        
        // Log the mismatch for debugging
        logToConsole(`Schema mismatch detected:\nOpenAI: ${openaiSchema}\nGemini: ${geminiSchema}`, true);
    }
}

// Add this new function for T-NAV comparison
function compareAndHighlightTNAV(openaiValue, geminiValue) {
    const openaiDisplay = document.getElementById('openAITotalValueDisplay');
    const geminiDisplay = document.getElementById('geminiTotalValueDisplay');
    
    // Convert string values to numbers for comparison
    const openaiNum = parseFloat(openaiValue.replace(/,/g, ''));
    const geminiNum = parseFloat(geminiValue.replace(/,/g, ''));
    
    if (openaiNum === geminiNum) {
        // Values match - reset background colors and remove icons
        openaiDisplay.style.backgroundColor = '';
        geminiDisplay.style.backgroundColor = '';
        openaiDisplay.innerHTML = openaiValue;
        geminiDisplay.innerHTML = geminiValue;
    } else {
        // Values don't match - highlight with warning color
        const warningColor = '#FFCC80';  // Same orange as schema comparison
        openaiDisplay.style.backgroundColor = warningColor;
        geminiDisplay.style.backgroundColor = warningColor;
        
        // Add warning icon
        const warningIcon = '<span class="material-icons" style="font-size: 14px; color: #e65100; vertical-align: middle; margin-right: 4px;">warning</span>';
        openaiDisplay.innerHTML = warningIcon + openaiValue;
        geminiDisplay.innerHTML = warningIcon + geminiValue;
        
        // Log the mismatch for debugging
        logToConsole(`T-NAV mismatch detected:\nOpenAI: ${openaiValue}\nGemini: ${geminiValue}`, true);
    }
}

// Export the highlight functions for use in other modules
export { compareAndHighlightSchemas, compareAndHighlightTNAV }; 