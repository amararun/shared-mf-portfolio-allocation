/**
 * Table Handlers Module
 * Contains functions for table creation, sorting, filtering and context menus
 */

/**
 * Displays data in a sortable, filterable HTML table
 * @param {Array} rows - Array of delimiter-separated strings to display as table rows
 */
function displayInTable(rows) {
    const outputContainer = document.getElementById('outputContainer');
    const delimiter = document.getElementById('delimiterInput').value;
    // Convert the string "\t" to an actual tab character if tab is selected
    const actualDelimiter = delimiter === '\\t' ? '\t' : delimiter;

    // Create table
    const table = document.createElement('table');
    table.className = 'data-table';

    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = rows[0].split(actualDelimiter);

    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.className = 'sortable';
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create body
    const tbody = document.createElement('tbody');
    for (let i = 1; i < rows.length; i++) {
        const row = document.createElement('tr');
        const cells = rows[i].split(actualDelimiter);

        cells.forEach((cell, index) => {
            const td = document.createElement('td');
            if (index === 4 || index === 5) {  // Market Value or Quantity columns
                const numValue = parseFloat(cell.replace(/[^\d.-]/g, ''));
                td.textContent = numValue.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                });
                td.style.textAlign = 'right';
            } else {
                td.textContent = cell;
                td.style.textAlign = 'left';
            }
            row.appendChild(td);
        });
        tbody.appendChild(row);
    }
    table.appendChild(tbody);

    // Clear and add the new table
    outputContainer.innerHTML = '';
    outputContainer.appendChild(table);

    // Add expand button
    const expandButton = document.getElementById('expandTableBtn');
    expandButton.classList.add('active');

    // Setup table functionality
    setupSortableTable(table);
    setupTableFilter(table);
    setupContextMenu(table);
    setupBankNameContext(table);

    // Setup expand button functionality
    setupExpandButton(table);
}

/**
 * Sets up the expand button functionality for a table
 * @param {HTMLElement} table - The table element to expand
 */
function setupExpandButton(table) {
    const expandButton = document.getElementById('expandTableBtn');
    expandButton.onclick = function () {
        const modal = document.getElementById('tableModal');
        const modalContainer = modal.querySelector('.modal-table-container');

        const tableClone = table.cloneNode(true);
        modalContainer.innerHTML = '';
        modalContainer.appendChild(tableClone);

        // Setup sorting and filtering for the cloned table
        setupSortableTable(tableClone);
        setupTableFilter(tableClone);
        setupContextMenu(tableClone);
        setupBankNameContext(tableClone);

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    };
}

/**
 * Adds a filter input to a table for quick searching
 * @param {HTMLElement} table - The table element to add filtering to
 */
function setupTableFilter(table) {
    // Remove any existing filter container
    const existingFilter = table.parentElement.querySelector('.filter-container');
    if (existingFilter) {
        existingFilter.remove();
    }

    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container';

    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.className = 'filter-input';
    filterInput.placeholder = 'Quick Filter (type to search across all columns)...';

    filterContainer.appendChild(filterInput);
    table.parentElement.insertBefore(filterContainer, table);

    filterInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = table.querySelectorAll('tbody tr');

        rows.forEach(row => {
            const text = Array.from(row.cells)
                .map(cell => cell.textContent)
                .join(' ')
                .toLowerCase();

            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}

/**
 * Makes a table sortable by clicking on column headers
 * @param {HTMLElement} table - The table element to make sortable
 */
function setupSortableTable(table) {
    const headers = table.querySelectorAll('th');
    headers.forEach((header, index) => {
        header.classList.add('sortable');
        header.addEventListener('click', () => {
            const isAsc = header.classList.contains('asc');
            // Remove sort classes from all headers
            headers.forEach(h => {
                h.classList.remove('asc', 'desc');
            });
            // Add appropriate sort class
            header.classList.add(isAsc ? 'desc' : 'asc');

            // Sort the table
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));

            rows.sort((a, b) => {
                const aValue = a.cells[index].textContent;
                const bValue = b.cells[index].textContent;

                // Check if the values are numbers
                const aNum = parseFloat(aValue.replace(/,/g, ''));
                const bNum = parseFloat(bValue.replace(/,/g, ''));

                if (!isNaN(aNum) && !isNaN(bNum)) {
                    return isAsc ? bNum - aNum : aNum - bNum;
                }

                return isAsc ?
                    bValue.localeCompare(aValue) :
                    aValue.localeCompare(bValue);
            });

            // Reorder the rows
            rows.forEach(row => tbody.appendChild(row));
        });
    });
}

/**
 * Adds a right-click context menu to table headers for additional operations
 * @param {HTMLElement} table - The table element to add context menu to
 */
function setupContextMenu(table) {
    let currentContextMenu = null;

    function createContextMenu(header, columnIndex, x, y) {
        if (currentContextMenu) {
            currentContextMenu.remove();
        }

        const menu = document.createElement('div');
        menu.className = 'context-menu';
        
        // Get the header's position relative to the viewport
        const headerRect = header.getBoundingClientRect();
        
        // Calculate position relative to viewport
        menu.style.position = 'fixed';  // Change to fixed positioning
        menu.style.left = `${headerRect.left}px`;
        menu.style.top = `${headerRect.bottom}px`;

        // Determine if column is numeric (Market Value or Quantity)
        const isNumeric = columnIndex === 4 || columnIndex === 5;  // Market Value or Quantity columns

        if (isNumeric) {
            menu.innerHTML = `
                <div class="context-menu-item" data-action="sort-asc">Sort Ascending</div>
                <div class="context-menu-item" data-action="sort-desc">Sort Descending</div>
                <div class="context-menu-separator"></div>
                <div class="context-menu-item" data-action="stats">Show Statistics</div>
            `;
        } else {
            menu.innerHTML = `
                <div class="context-menu-item" data-action="sort-asc">Sort Ascending</div>
                <div class="context-menu-item" data-action="sort-desc">Sort Descending</div>
                <div class="context-menu-separator"></div>
                <div class="context-menu-item" data-action="unique">Show Unique Values</div>
            `;
        }

        document.body.appendChild(menu);
        currentContextMenu = menu;

        // Handle menu item clicks
        menu.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (!action) return;

            const rows = Array.from(table.querySelectorAll('tbody tr'));
            const values = rows.map(row => row.cells[columnIndex].textContent);

            switch (action) {
                case 'sort-asc':
                case 'sort-desc':
                    header.click(); // Use existing sort functionality
                    break;
                case 'stats':
                    const nums = values.map(v => parseFloat(v.replace(/,/g, '')));
                    const sum = nums.reduce((a, b) => a + b, 0);
                    const avg = sum / nums.length;
                    const min = Math.min(...nums);
                    const max = Math.max(...nums);
                    alert(`Statistics for ${header.textContent}:
                        \nAverage: ${avg.toLocaleString('en-IN')}
                        \nMinimum: ${min.toLocaleString('en-IN')}
                        \nMaximum: ${max.toLocaleString('en-IN')}
                        \nTotal: ${sum.toLocaleString('en-IN')}`);
                    break;
                case 'unique':
                    const unique = [...new Set(values)].sort();
                    alert(`Unique values in ${header.textContent}:\n\n${unique.join('\n')}`);
                    break;
            }
            menu.remove();
        });
    }

    // Add context menu event listener to table headers
    table.querySelectorAll('th').forEach((th, index) => {
        th.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            createContextMenu(th, index, e.pageX, e.pageY);
        });
    });

    // Close context menu when clicking outside
    document.addEventListener('click', (e) => {
        if (currentContextMenu && !currentContextMenu.contains(e.target)) {
            currentContextMenu.remove();
        }
    });
}

/**
 * Adds a right-click context menu to table rows to show instrument details
 * @param {HTMLElement} table - The table element to add context menu to
 */
function setupBankNameContext(table) {
    // For mutual fund data, we'll adapt this to show instrument details
    table.querySelectorAll('tbody tr').forEach(row => {
        row.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const isin = row.cells[0].textContent;
            const name = row.cells[1].textContent;
            const value = row.cells[2].textContent;

            alert(`Instrument Details:
                \nISIN: ${isin}
                \nName: ${name}
                \nMarket Value: ${value}`);
        });
    });
}

// Export all functions
export {
    displayInTable,
    setupExpandButton,
    setupTableFilter,
    setupSortableTable,
    setupContextMenu,
    setupBankNameContext
}; 