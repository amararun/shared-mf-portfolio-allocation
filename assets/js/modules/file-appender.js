// File Appender Functionality
const FileAppender = {
    selectedFiles: [],
    appendedContent: null,

    // Initialize the file appender
    init() {
        console.log('FileAppender: Initializing...');
        this.setupModal();
        this.setupEventListeners();
        console.log('FileAppender: Initialization complete');
    },

    // Setup the modal HTML
    setupModal() {
        // Remove any existing modal first
        const existingModal = document.getElementById('fileAppenderModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'fileAppenderModal';
        modal.className = 'modal-overlay';
        modal.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000;';
        
        modal.innerHTML = `
            <div style="
                background: white;
                max-width: 480px;
                margin: 40px auto;
                padding: 16px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h3 style="margin: 0; font-size: 1.25rem; color: #1e1b4b;">Append Files</h3>
                    <div style="display: flex; gap: 8px;">
                        <button id="cancelAppend" class="control-button" style="padding: 4px 12px; font-size: 13px;">Cancel</button>
                        <button id="processAppend" class="control-button" style="padding: 4px 12px; font-size: 13px;">Process</button>
                        <button id="downloadAppendedBtn" class="control-button" disabled style="padding: 4px 12px; font-size: 13px;">Download</button>
                    </div>
                </div>

                <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
                    <button id="addFilesBtn" class="control-button" style="
                        display: inline-flex;
                        align-items: center;
                        gap: 4px;
                        padding: 4px 12px;
                        font-size: 13px;
                    ">
                        <span class="material-icons" style="font-size: 16px;">add</span>
                        Add Files
                    </button>
                    <input type="file" id="appendFileInput" multiple accept=".txt,.csv" style="display: none;">
                    <div id="selectedFilesCount" style="color: #666; font-size: 13px;"></div>
                </div>

                <div id="appendProgress" style="display: none; margin: 8px 0;">
                    <div style="height: 2px; width: 100%; background-color: #e5e7eb;">
                        <div style="height: 100%; width: 0%; background-color: #4f46e5; transition: width 0.3s;"></div>
                    </div>
                </div>

                <div id="appendFileList" style="
                    min-height: 40px;
                    max-height: 160px;
                    overflow-y: auto;
                    border: 1px solid #e5e7eb;
                    border-radius: 4px;
                    background-color: #f9fafb;
                ">
                    <div style="text-align: center; color: #6B7280; padding: 10px; font-size: 13px;">No files selected</div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    // Setup event listeners
    setupEventListeners() {
        console.log('FileAppender: Setting up event listeners');
        
        // Add Files button handler
        const addFilesBtn = document.getElementById('addFilesBtn');
        const fileInput = document.getElementById('appendFileInput');
        
        if (addFilesBtn && fileInput) {
            addFilesBtn.addEventListener('click', () => {
                fileInput.click();
            });
        }

        // File input change handler
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                const validFiles = files.filter(file => {
                    const ext = file.name.toLowerCase().split('.').pop();
                    return ['txt', 'csv'].includes(ext);
                });

                if (validFiles.length !== files.length) {
                    alert('Only .txt and .csv files are allowed.');
                }

                this.selectedFiles.push(...validFiles);
                this.updateFileList();
                this.updateButtonStates();
                
                // Reset the file input value so it can be used again
                e.target.value = '';
            });
        }

        // Cancel button handler
        const cancelButton = document.getElementById('cancelAppend');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Close button (X) handler
        const closeButton = document.querySelector('.modal-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Process append button handler
        const processButton = document.getElementById('processAppend');
        if (processButton) {
            processButton.addEventListener('click', () => {
                if (this.selectedFiles.length < 2) {
                    alert('Please select at least 2 files to append.');
                    return;
                }
                this.appendFiles();
            });
        }

        // Download button handler
        const downloadButton = document.getElementById('downloadAppendedBtn');
        if (downloadButton) {
            downloadButton.addEventListener('click', () => {
                if (this.appendedContent) {
                    const blob = new Blob([this.appendedContent], { type: 'text/plain' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'appended_file.txt';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    this.closeModal();
                }
            });
        }

        // Close modal when clicking outside
        const modal = document.getElementById('fileAppenderModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'fileAppenderModal') {
                    this.closeModal();
                }
            });
        }
        
        // Add escape key handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('fileAppenderModal');
                if (modal && modal.style.display === 'block') {
                    this.closeModal();
                    e.stopPropagation();
                }
            }
        });
    },

    // Update button states based on current state
    updateButtonStates() {
        const processButton = document.getElementById('processAppend');
        const downloadButton = document.getElementById('downloadAppendedBtn');

        if (processButton) {
            processButton.disabled = this.selectedFiles.length < 2;
            processButton.style.backgroundColor = this.selectedFiles.length < 2 ? '#6B7280' : '#1e40af';
            processButton.style.cursor = this.selectedFiles.length < 2 ? 'not-allowed' : 'pointer';
        }

        if (downloadButton) {
            downloadButton.disabled = !this.appendedContent;
            downloadButton.style.backgroundColor = !this.appendedContent ? '#6B7280' : '#16a34a';
            downloadButton.style.cursor = !this.appendedContent ? 'not-allowed' : 'pointer';
        }

        // Update selected files count
        const countDisplay = document.getElementById('selectedFilesCount');
        if (countDisplay) {
            countDisplay.textContent = this.selectedFiles.length > 0 
                ? `${this.selectedFiles.length} file${this.selectedFiles.length > 1 ? 's' : ''} selected`
                : '';
        }
    },

    // Update the list of selected files
    updateFileList() {
        const container = document.getElementById('appendFileList');
        if (!container) return;

        if (this.selectedFiles.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: #6B7280; padding: 10px; font-size: 13px;">No files selected</div>';
            return;
        }
        
        container.innerHTML = this.selectedFiles.map((file, index) => `
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 6px 8px;
                border-bottom: 1px solid #e5e7eb;
                font-size: 13px;
            ">
                <span style="color: #1f2937;">${file.name}</span>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="color: #6B7280;">${(file.size / 1024).toFixed(1)} KB</span>
                    <button onclick="FileAppender.removeFile(${index})" style="
                        border: none;
                        background: none;
                        padding: 2px;
                        cursor: pointer;
                        color: #ef4444;
                        display: flex;
                        align-items: center;
                    ">
                        <span class="material-icons" style="font-size: 16px;">close</span>
                    </button>
                </div>
            </div>
        `).join('');
    },

    // Remove a file from the list
    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        this.appendedContent = null; // Reset appended content when files change
        this.updateFileList();
        this.updateButtonStates();
    },

    // Show the modal
    showModal() {
        // Ensure modal is properly set up
        this.setupModal();
        this.setupEventListeners();
        
        const modal = document.getElementById('fileAppenderModal');
        if (modal) {
            modal.style.display = 'block';
            this.selectedFiles = [];
            this.appendedContent = null;
            this.updateFileList();
            this.updateButtonStates();
        }
    },

    // Close the modal
    closeModal() {
        const modal = document.getElementById('fileAppenderModal');
        if (modal) {
            modal.style.display = 'none';
            this.selectedFiles = [];
            this.appendedContent = null;
            this.updateFileList();
            this.updateButtonStates();
            modal.remove(); // Remove the modal from DOM when closed
        }
    },

    // Append the selected files
    async appendFiles() {
        const progressDiv = document.getElementById('appendProgress');
        const processButton = document.getElementById('processAppend');
        
        if (!progressDiv || !processButton) return;

        progressDiv.style.display = 'block';
        processButton.disabled = true;
        processButton.style.backgroundColor = '#6B7280';
        processButton.style.cursor = 'not-allowed';

        try {
            const contents = await Promise.all(this.selectedFiles.map(async (file, index) => {
                const text = await file.text();
                const lines = text.split('\n').filter(line => line.trim());
                // Skip header for all files except the first one
                return index === 0 ? lines : lines.slice(1);
            }));

            this.appendedContent = contents.flat().join('\n');
            progressDiv.style.display = 'none';
            this.updateButtonStates();
        } catch (error) {
            alert('Error appending files: ' + error.message);
            progressDiv.style.display = 'none';
            if (processButton) {
                processButton.disabled = false;
                processButton.style.backgroundColor = '#1e40af';
                processButton.style.cursor = 'pointer';
            }
        }
    }
};

// Export the FileAppender object
export default FileAppender; 