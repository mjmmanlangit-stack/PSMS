// ==================== Data Management ====================
const STORAGE_KEYS = {
    PARISHIONERS: 'psms_parishioners',
    CONTRIBUTIONS: 'psms_contributions',
    ACTIVITIES: 'psms_activities',
    SERIAL_COUNTER: 'psms_serial_counter'
};

const SERIAL_PREFIX = 'PSMS';
const SERIAL_FORMAT = {
    prefix: 'PSMS',
    padLength: 4,
    separator: '-'
};

// Initialize localStorage if empty
function initializeData() {
    if (!localStorage.getItem(STORAGE_KEYS.PARISHIONERS)) {
        localStorage.setItem(STORAGE_KEYS.PARISHIONERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONTRIBUTIONS)) {
        localStorage.setItem(STORAGE_KEYS.CONTRIBUTIONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify([]));
    }
    
    // Initialize serial counter if not present
    if (!localStorage.getItem(STORAGE_KEYS.SERIAL_COUNTER)) {
        localStorage.setItem(STORAGE_KEYS.SERIAL_COUNTER, JSON.stringify(0));
    }
}

function getParishioners() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PARISHIONERS) || '[]');
}

function saveParishioners(data) {
    localStorage.setItem(STORAGE_KEYS.PARISHIONERS, JSON.stringify(data));
}

function getContributions() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTRIBUTIONS) || '[]');
}

function saveContributions(data) {
    localStorage.setItem(STORAGE_KEYS.CONTRIBUTIONS, JSON.stringify(data));
}

function getActivities() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITIES) || '[]');
}

function saveActivities(data) {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(data));
}

// ==================== Serial Number Management ====================

/**
 * Get the current serial number counter from localStorage
 * @returns {number} Current counter value
 */
function getSerialCounter() {
    const counter = localStorage.getItem(STORAGE_KEYS.SERIAL_COUNTER);
    return counter ? parseInt(counter) : 0;
}

/**
 * Increment and save the serial number counter
 * @returns {number} New counter value
 */
function incrementSerialCounter() {
    const currentCounter = getSerialCounter();
    const newCounter = currentCounter + 1;
    localStorage.setItem(STORAGE_KEYS.SERIAL_COUNTER, JSON.stringify(newCounter));
    return newCounter;
}

/**
 * Format a counter value into a serial number
 * Format: PSMS-0001, PSMS-0002, etc.
 * @param {number} counterValue - The counter value to format
 * @returns {string} Formatted serial number
 */
function formatSerialNumber(counterValue) {
    const paddedNumber = String(counterValue).padStart(SERIAL_FORMAT.padLength, '0');
    return `${SERIAL_FORMAT.prefix}${SERIAL_FORMAT.separator}${paddedNumber}`;
}

/**
 * Generate a new unique serial number
 * Increments the counter and returns a formatted serial number
 * @returns {string} Unique serial number (e.g., PSMS-0001)
 */
function generateSerialNumber() {
    const newCounterValue = incrementSerialCounter();
    return formatSerialNumber(newCounterValue);
}

/**
 * Validate if a serial number exists (for preventing duplicates)
 * @param {string} serialNumber - Serial number to check
 * @returns {boolean} True if serial number already exists
 */
function serialNumberExists(serialNumber) {
    const parishioners = getParishioners();
    return parishioners.some(p => p.serialNumber === serialNumber);
}

/**
 * Initialize serial counter based on existing parishioners
 * Called on app startup to handle existing data
 */
function initializeSerialCounter() {
    const parishioners = getParishioners();
    let maxCounter = getSerialCounter();
    
    // If parishioners already exist, check their serial numbers
    if (parishioners.length > 0) {
        parishioners.forEach(p => {
            if (p.serialNumber) {
                // Extract number from serial (e.g., "PSMS-0001" -> 1)
                const match = p.serialNumber.match(/\d+/);
                if (match) {
                    const num = parseInt(match[0]);
                    if (num > maxCounter) {
                        maxCounter = num;
                    }
                }
            }
        });
        
        // Update counter to prevent duplicates
        if (maxCounter > getSerialCounter()) {
            localStorage.setItem(STORAGE_KEYS.SERIAL_COUNTER, JSON.stringify(maxCounter));
        }
    }
}

function addActivity(message, type = 'info') {
    const activities = getActivities();
    activities.unshift({
        id: Date.now(),
        message: message,
        type: type,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleString()
    });
    
    // Keep only last 50 activities
    if (activities.length > 50) {
        activities.pop();
    }
    
    saveActivities(activities);
}

// ==================== Sidebar Toggle ====================
// Mobile sidebar state management
let isSidebarOpen = false;
let isToggling = false; // Prevent rapid clicking/stacking

function toggleSidebar() {
    // Prevent multiple rapid toggles
    if (isToggling) return;
    isToggling = true;
    
    const isMobile = window.innerWidth <= 768;
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (isMobile) {
        // Mobile: Toggle sidebar visibility with overlay
        if (isSidebarOpen) {
            closeSidebar();
        } else {
            openSidebar();
        }
    } else {
        // Desktop: Toggle collapsed state
        sidebar.classList.toggle('collapsed');
        const mainContent = document.querySelector('.main-content');
        mainContent.classList.toggle('expanded');
    }
    
    // Re-enable toggle after animation completes
    setTimeout(() => {
        isToggling = false;
    }, 300);
}

function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.add('mobile-open');
    overlay.classList.add('active');
    isSidebarOpen = true;
    
    // Prevent body scroll when sidebar is open
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('active');
    isSidebarOpen = false;
    
    // Restore body scroll
    document.body.style.overflow = '';
}

// Handle window resize - close sidebar on desktop view
window.addEventListener('resize', function() {
    if (window.innerWidth > 768 && isSidebarOpen) {
        closeSidebar();
    }
});

// ==================== Dashboard Functions ====================

function updateDashboard() {
    const parishioners = getParishioners();
    const contributions = getContributions();
    const activities = getActivities();
    
    // Update total parishioners
    document.getElementById('totalParishioners').textContent = parishioners.length;
    
    // Calculate total contributions
    const totalContrib = contributions.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
    document.getElementById('totalContributions').textContent = '₱' + totalContrib.toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    
    // Update recent activities count
    document.getElementById('recentActivities').textContent = activities.length;
    
    // Update barangay count
    const uniqueBarangays = new Set(parishioners.map(p => p.barangay));
    document.getElementById('barangayCount').textContent = uniqueBarangays.size;
    
    // Calculate monthly contributions
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyContrib = contributions
        .filter(c => new Date(c.date) >= monthStart)
        .reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
    document.getElementById('monthlyContributions').textContent = '₱' + monthlyContrib.toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    
    // Calculate average contribution
    const avgContrib = contributions.length > 0 ? totalContrib / contributions.length : 0;
    document.getElementById('avgContribution').textContent = '₱' + avgContrib.toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    
    // Update last updated
    const lastActivity = activities[0];
    if (lastActivity) {
        document.getElementById('lastUpdated').textContent = new Date(lastActivity.timestamp).toLocaleDateString('en-PH');
    }
    
    // Display activities
    displayActivities();
}

function displayActivities() {
    const activities = getActivities();
    const activitiesList = document.getElementById('activitiesList');
    
    if (activities.length === 0) {
        activitiesList.innerHTML = '<div class="text-muted text-center py-5">No activities yet. Start by adding parishioners or recording contributions.</div>';
        return;
    }
    
    activitiesList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <span class="activity-text">${activity.message}</span>
            <span class="activity-time">${new Date(activity.timestamp).toLocaleDateString('en-PH')}</span>
        </div>
    `).join('');
}

// ==================== Parishioner Functions ====================

function addParishioner(event) {
    event.preventDefault();
    
    const name = document.getElementById('parishionerName').value;
    const barangay = document.getElementById('parishionerBarangay').value;
    const street = document.getElementById('parishionerStreet').value;
    const contact = document.getElementById('parishionerContact').value;
    const notes = document.getElementById('parishionerNotes').value;
    
    if (!name || !barangay || !street) {
        alert('Please fill in all required fields');
        return;
    }
    
    const parishioners = getParishioners();
    const newParishioner = {
        id: Date.now(),
        serialNumber: generateSerialNumber(),
        name: name,
        barangay: barangay,
        street: street,
        contact: contact,
        notes: notes,
        dateAdded: new Date().toISOString()
    };
    
    parishioners.push(newParishioner);
    saveParishioners(parishioners);
    
    addActivity(`Added parishioner: ${name} (${newParishioner.serialNumber})`, 'add');
    
    // Reset form
    document.getElementById('parishionerForm').reset();
    
    // Update table
    displayParishioners();
    updateBarangayFilter();
}

function displayParishioners() {
    const parishioners = getParishioners();
    const tableBody = document.getElementById('parishionerTableBody');
    
    if (parishioners.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-muted text-center py-5"><i class="bi bi-inbox"></i> No parishioners added yet.</td></tr>';
        document.getElementById('parishionerCount').textContent = 0;
        return;
    }
    
    tableBody.innerHTML = parishioners.map(p => `
        <tr>
            <td>${p.serialNumber || '-'}</td>
            <td>${p.name}</td>
            <td>${p.barangay}</td>
            <td>${p.street}</td>
            <td>${p.contact || '-'}</td>
            <td>${new Date(p.dateAdded).toLocaleDateString('en-PH')}</td>
            <td>
                <button class="btn btn-sm btn-outline-secondary" onclick="editParishioner(${p.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteParishioner(${p.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    document.getElementById('parishionerCount').textContent = parishioners.length;
}

function filterParishioners() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const selectedBarangay = document.getElementById('barangayFilter').value;
    
    let parishioners = getParishioners();
    
    parishioners = parishioners.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm) || 
                            (p.serialNumber && p.serialNumber.toLowerCase().includes(searchTerm));
        const matchesBarangay = !selectedBarangay || p.barangay === selectedBarangay;
        return matchesSearch && matchesBarangay;
    });
    
    const tableBody = document.getElementById('parishionerTableBody');
    
    if (parishioners.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-muted text-center py-5">No parishioners found.</td></tr>';
        return;
    }
    
    tableBody.innerHTML = parishioners.map(p => `
        <tr>
            <td>${p.serialNumber || '-'}</td>
            <td>${p.name}</td>
            <td>${p.barangay}</td>
            <td>${p.street}</td>
            <td>${p.contact || '-'}</td>
            <td>${new Date(p.dateAdded).toLocaleDateString('en-PH')}</td>
            <td>
                <button class="btn btn-sm btn-outline-secondary" onclick="editParishioner(${p.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteParishioner(${p.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function updateBarangayFilter() {
    const parishioners = getParishioners();
    const barangays = [...new Set(parishioners.map(p => p.barangay))].sort();
    
    const filterSelect = document.getElementById('barangayFilter');
    if (filterSelect) {
        const currentValue = filterSelect.value;
        filterSelect.innerHTML = '<option value="">All Barangays</option>' +
            barangays.map(b => `<option value="${b}">${b}</option>`).join('');
        filterSelect.value = currentValue;
    }
}

function editParishioner(id) {
    const parishioners = getParishioners();
    const parishioner = parishioners.find(p => p.id === id);
    
    if (parishioner) {
        document.getElementById('editParishionerId').value = id;
        document.getElementById('editName').value = parishioner.name;
        document.getElementById('editBarangay').value = parishioner.barangay;
        document.getElementById('editStreet').value = parishioner.street;
        document.getElementById('editContact').value = parishioner.contact || '';
        document.getElementById('editNotes').value = parishioner.notes || '';
        
        const modal = new bootstrap.Modal(document.getElementById('editModal'));
        modal.show();
    }
}

function saveParishioner() {
    const id = parseInt(document.getElementById('editParishionerId').value);
    const name = document.getElementById('editName').value;
    const barangay = document.getElementById('editBarangay').value;
    const street = document.getElementById('editStreet').value;
    const contact = document.getElementById('editContact').value;
    const notes = document.getElementById('editNotes').value;
    
    if (!name || !barangay || !street) {
        alert('Please fill in all required fields');
        return;
    }
    
    const parishioners = getParishioners();
    const index = parishioners.findIndex(p => p.id === id);
    
    if (index !== -1) {
        parishioners[index] = {
            ...parishioners[index],
            name, barangay, street, contact, notes
        };
        
        saveParishioners(parishioners);
        addActivity(`Updated parishioner: ${name}`, 'edit');
        
        displayParishioners();
        updateBarangayFilter();
        
        bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
    }
}

function deleteParishioner(id) {
    if (confirm('Are you sure you want to delete this parishioner?')) {
        const parishioners = getParishioners();
        const parishioner = parishioners.find(p => p.id === id);
        
        const updatedParishioners = parishioners.filter(p => p.id !== id);
        saveParishioners(updatedParishioners);
        
        addActivity(`Deleted parishioner: ${parishioner.name}`, 'delete');
        
        displayParishioners();
        updateBarangayFilter();
    }
}

// ==================== Contribution Functions ====================
function addContribution(event) {
    event.preventDefault();
    
    const parishionerId = parseInt(document.getElementById('contributionParishioner').value);
    const amount = parseFloat(document.getElementById('contributionAmount').value);
    const date = document.getElementById('contributionDate').value;
    const type = document.getElementById('contributionType').value;
    const description = document.getElementById('contributionDescription').value;
    
    if (!parishionerId || !amount || !date || !type) {
        alert('Please fill in all required fields');
        return;
    }
    
    const contributions = getContributions();
    const parishioners = getParishioners();
    const parishioner = parishioners.find(p => p.id === parishionerId);
    
    const newContribution = {
        id: Date.now(),
        parishionerId: parishionerId,
        parishionerName: parishioner.name,
        amount: amount,
        date: date,
        type: type,
        description: description,
        recordedDate: new Date().toISOString()
    };
    
    contributions.push(newContribution);
    saveContributions(contributions);
    
    addActivity(`Recorded contribution: ₱${amount} from ${parishioner.name}`, 'contribution');
    
    // Reset form
    document.getElementById('contributionForm').reset();
    
    // Update displays
    displayContributions();
    updateContributionStats();
}

function displayContributions() {
    const contributions = getContributions();
    const tableBody = document.getElementById('contributionTableBody');
    
    if (contributions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-muted text-center py-5"><i class="bi bi-inbox"></i> No contributions recorded yet.</td></tr>';
        document.getElementById('contributionCount').textContent = 0;
        return;
    }
    
    // Sort by date descending
    const sorted = [...contributions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tableBody.innerHTML = sorted.map(c => `
        <tr>
            <td>${c.parishionerName}</td>
            <td>₱${parseFloat(c.amount).toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
            <td>${c.type}</td>
            <td>${new Date(c.date).toLocaleDateString('en-PH')}</td>
            <td>${c.description || '-'}</td>
            <td>
                <button class="btn btn-sm btn-outline-secondary" onclick="editContribution(${c.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteContribution(${c.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    document.getElementById('contributionCount').textContent = sorted.length;
}

function filterContributions() {
    const selectedParishioner = document.getElementById('filterParishioner').value;
    const selectedType = document.getElementById('filterType').value;
    const selectedRange = document.getElementById('dateRange').value;
    
    let contributions = getContributions();
    
    // Filter by parishioner
    if (selectedParishioner) {
        contributions = contributions.filter(c => c.parishionerId === parseInt(selectedParishioner));
    }
    
    // Filter by type
    if (selectedType) {
        contributions = contributions.filter(c => c.type === selectedType);
    }
    
    // Filter by date range
    if (selectedRange) {
        const now = new Date();
        let startDate = new Date();
        
        if (selectedRange === '7days') startDate.setDate(now.getDate() - 7);
        else if (selectedRange === '30days') startDate.setDate(now.getDate() - 30);
        else if (selectedRange === '90days') startDate.setDate(now.getDate() - 90);
        else if (selectedRange === '1year') startDate.setFullYear(now.getFullYear() - 1);
        
        contributions = contributions.filter(c => new Date(c.date) >= startDate);
    }
    
    const tableBody = document.getElementById('contributionTableBody');
    
    if (contributions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-muted text-center py-5">No contributions found.</td></tr>';
        document.getElementById('contributionCount').textContent = 0;
        document.getElementById('totalAmount').textContent = '0.00';
        return;
    }
    
    // Sort by date descending
    const sorted = [...contributions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tableBody.innerHTML = sorted.map(c => `
        <tr>
            <td>${c.parishionerName}</td>
            <td>₱${parseFloat(c.amount).toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
            <td>${c.type}</td>
            <td>${new Date(c.date).toLocaleDateString('en-PH')}</td>
            <td>${c.description || '-'}</td>
            <td>
                <button class="btn btn-sm btn-outline-secondary" onclick="editContribution(${c.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteContribution(${c.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    const total = sorted.reduce((sum, c) => sum + parseFloat(c.amount), 0);
    document.getElementById('totalAmount').textContent = total.toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('contributionCount').textContent = sorted.length;
}

function updateContributionStats() {
    const contributions = getContributions();
    
    if (contributions.length === 0) {
        document.getElementById('monthTotal').textContent = '₱0.00';
        document.getElementById('monthCount').textContent = '0';
        document.getElementById('avgAmount').textContent = '₱0.00';
        document.getElementById('maxAmount').textContent = '₱0.00';
        return;
    }
    
    // This month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthContributions = contributions.filter(c => new Date(c.date) >= monthStart);
    const monthTotal = monthContributions.reduce((sum, c) => sum + parseFloat(c.amount), 0);
    
    document.getElementById('monthTotal').textContent = '₱' + monthTotal.toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('monthCount').textContent = monthContributions.length;
    
    // Overall stats
    const totalAmount = contributions.reduce((sum, c) => sum + parseFloat(c.amount), 0);
    const avgAmount = totalAmount / contributions.length;
    const maxAmount = Math.max(...contributions.map(c => parseFloat(c.amount)));
    
    document.getElementById('avgAmount').textContent = '₱' + avgAmount.toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('maxAmount').textContent = '₱' + maxAmount.toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

function updateContributionParishionerSelect() {
    const parishioners = getParishioners();
    const select = document.getElementById('contributionParishioner');
    const filterSelect = document.getElementById('filterParishioner');
    
    if (select) {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Choose a parishioner...</option>' +
            parishioners.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        select.value = currentValue;
    }
    
    if (filterSelect) {
        const currentValue = filterSelect.value;
        filterSelect.innerHTML = '<option value="">All Parishioners</option>' +
            parishioners.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        filterSelect.value = currentValue;
    }
}

function editContribution(id) {
    const contributions = getContributions();
    const contribution = contributions.find(c => c.id === id);
    
    if (contribution) {
        document.getElementById('editContributionId').value = id;
        document.getElementById('editContAmount').value = contribution.amount;
        document.getElementById('editContDate').value = contribution.date;
        document.getElementById('editContType').value = contribution.type;
        document.getElementById('editContDescription').value = contribution.description || '';
        
        const modal = new bootstrap.Modal(document.getElementById('editContributionModal'));
        modal.show();
    }
}

function saveContribution() {
    const id = parseInt(document.getElementById('editContributionId').value);
    const amount = parseFloat(document.getElementById('editContAmount').value);
    const date = document.getElementById('editContDate').value;
    const type = document.getElementById('editContType').value;
    const description = document.getElementById('editContDescription').value;
    
    if (!amount || !date || !type) {
        alert('Please fill in all required fields');
        return;
    }
    
    const contributions = getContributions();
    const index = contributions.findIndex(c => c.id === id);
    
    if (index !== -1) {
        contributions[index] = {
            ...contributions[index],
            amount, date, type, description
        };
        
        saveContributions(contributions);
        addActivity(`Updated contribution: ₱${amount} from ${contributions[index].parishionerName}`, 'edit');
        
        displayContributions();
        updateContributionStats();
        filterContributions();
        
        bootstrap.Modal.getInstance(document.getElementById('editContributionModal')).hide();
    }
}

function deleteContribution(id) {
    const contributions = getContributions();
    const contribution = contributions.find(c => c.id === id);
    
    if (confirm('Are you sure you want to delete this contribution record?')) {
        const updatedContributions = contributions.filter(c => c.id !== id);
        saveContributions(updatedContributions);
        
        addActivity(`Deleted contribution: ₱${contribution.amount} from ${contribution.parishionerName}`, 'delete');
        
        displayContributions();
        updateContributionStats();
        filterContributions();
    }
}

// ==================== Page Initialization ====================
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    initializeSerialCounter();
    
    // Initialize based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (currentPage === 'parishioners.html' || currentPage === '') {
        displayParishioners();
        updateBarangayFilter();
    }
    
    if (currentPage === 'contributions.html') {
        displayContributions();
        updateContributionParishionerSelect();
        updateContributionStats();
    }
    
    // Set today's date as default in contribution form
    const dateInput = document.getElementById('contributionDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
    
    // Setup sidebar nav item click handlers for mobile
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth <= 768 && isSidebarOpen) {
                closeSidebar();
            }
        });
    });
});

// ==================== Authentication & Logout ====================
function handleLogout() {
    // Show confirmation dialog
    if (confirm('Are you sure you want to logout?')) {
        // Clear session storage
        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('userName');
        
        // Redirect to login page
        window.location.href = 'login.html';
    }
}
