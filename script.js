// ============================================
// PERSONAL DIARY APPLICATION - JAVASCRIPT
// ============================================

// Motivational Quotes
const quotes = [
    "Every day is a new beginning. Take a deep breath and start again.",
    "You are stronger than you think, braver than you believe, and capable of more than you imagine.",
    "The only way to do great work is to love what you do.",
    "Progress, not perfection, is the goal.",
    "Your struggles make you stronger. Keep going!",
    "Today is a perfect day to be grateful for what you have.",
    "Dream bigger. Work harder. Achieve greatness.",
    "Be kind to yourself. You deserve that love too.",
    "Every moment is a fresh beginning.",
    "Write your own story, and make it a beautiful one.",
    "Life is what you make it. Always has been, always will be.",
    "Your potential is endless. Keep pushing forward.",
    "Remember: You've survived 100% of your worst days.",
    "Believe in yourself when no one else does.",
    "The future belongs to those who believe in the beauty of their dreams."
];

// ============================================
// STATE MANAGEMENT
// ============================================

let currentUser = null;
let diaryEntries = [];
let currentEditingDate = null;
let isLoggedIn = false;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    initializeAuthListeners();
    initializeTheme();
    displayRandomQuote();
    
    if (isLoggedIn) {
        showDiaryApp();
    } else {
        showAuthApp();
    }
});

// ============================================
// AUTHENTICATION SYSTEM
// ============================================

function initializeAuthListeners() {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    loginTab.addEventListener('click', () => switchAuthTab('login'));
    registerTab.addEventListener('click', () => switchAuthTab('register'));
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
}

function switchAuthTab(tab) {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    } else {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    }

    clearAuthMessages();
}

function handleRegister(e) {
    e.preventDefault();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const message = document.getElementById('registerMessage');

    // Validation
    if (password.length < 4) {
        showMessage(message, 'Password must be at least 4 characters long', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showMessage(message, 'Passwords do not match', 'error');
        return;
    }

    // Check if user already exists
    const existingData = localStorage.getItem('diaryUserData');
    if (existingData) {
        showMessage(message, 'Diary already initialized. Please login instead.', 'error');
        return;
    }

    // Create new user
    currentUser = {
        password: btoa(password), // Basic encoding (not secure for production)
        createdAt: new Date().toISOString()
    };

    diaryEntries = [];
    saveUserData();
    isLoggedIn = true;

    showMessage(message, 'Account created successfully! Welcome to your diary.', 'success');
    setTimeout(() => {
        showDiaryApp();
    }, 1500);
}

function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('loginPassword').value;
    const message = document.getElementById('loginMessage');

    const userData = localStorage.getItem('diaryUserData');
    
    if (!userData) {
        showMessage(message, 'No diary found. Please register first.', 'error');
        return;
    }

    const data = JSON.parse(userData);
    
    if (atob(data.password) !== password) {
        showMessage(message, 'Incorrect password. Please try again.', 'error');
        return;
    }

    currentUser = data;
    diaryEntries = data.entries || [];
    isLoggedIn = true;

    showMessage(message, 'Welcome back! Loading your diary...', 'success');
    setTimeout(() => {
        showDiaryApp();
    }, 1000);
}

function loadUserData() {
    const userData = localStorage.getItem('diaryUserData');
    if (userData) {
        const data = JSON.parse(userData);
        currentUser = data;
        diaryEntries = data.entries || [];
        isLoggedIn = true;
    }
}

function saveUserData() {
    if (currentUser) {
        const data = {
            ...currentUser,
            entries: diaryEntries
        };
        localStorage.setItem('diaryUserData', JSON.stringify(data));
    }
}

// ============================================
// UI VISIBILITY
// ============================================

function showAuthApp() {
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('diaryContainer').style.display = 'none';
    displayRandomQuote();
}

function showDiaryApp() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('diaryContainer').style.display = 'block';
    initializeDiaryApp();
}

function clearAuthMessages() {
    document.getElementById('loginMessage').textContent = '';
    document.getElementById('loginMessage').className = 'auth-message';
    document.getElementById('registerMessage').textContent = '';
    document.getElementById('registerMessage').className = 'auth-message';
}

function showMessage(element, text, type) {
    element.textContent = text;
    element.className = `auth-message ${type}`;
}

// ============================================
// DIARY APP INITIALIZATION
// ============================================

function initializeDiaryApp() {
    setDateToToday();
    displayEntries();
    displayBookmarks();
    displayReminders();
    displayRandomQuote();
    updateHeaderDate();
    setupDiaryListeners();
}

function setupDiaryListeners() {
    // Entry Form
    document.getElementById('entryForm').addEventListener('submit', handleSaveEntry);
    document.getElementById('entryForm').addEventListener('reset', resetForm);

    // Character counter
    document.getElementById('entrySummary').addEventListener('input', updateCharCount);

    // Date Selector
    document.getElementById('dateSelector').addEventListener('change', handleDateSelect);

    // Search
    document.getElementById('searchInput').addEventListener('input', handleSearch);

    // Theme Toggle
    document.getElementById('toggleTheme').addEventListener('click', toggleTheme);

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Modal Close
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('closeEditModal').addEventListener('click', closeEditModal);
    document.getElementById('cancelEditBtn').addEventListener('click', closeEditModal);

    // Modal Buttons
    document.getElementById('editEntryBtn').addEventListener('click', openEditModal);
    document.getElementById('deleteEntryBtn').addEventListener('click', deleteCurrentEntry);

    // Edit Form
    document.getElementById('editForm').addEventListener('submit', handleEditEntry);
}

// ============================================
// DATE HANDLING
// ============================================

function setDateToToday() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('entryDate').value = today;
    document.getElementById('dateSelector').value = today;
}

function updateHeaderDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = today.toLocaleDateString('en-US', options);
    document.getElementById('headerDate').textContent = dateString;
}

function handleDateSelect(e) {
    const selectedDate = e.target.value;
    const entry = diaryEntries.find(entry => entry.date === selectedDate);
    
    if (entry) {
        document.getElementById('entryDate').value = selectedDate;
        document.getElementById('entrySummary').value = entry.summary;
        document.getElementById('entryContent').value = entry.content;
        document.getElementById('bookmark-toggle').checked = entry.isBookmarked || false;
        document.getElementById('entryReminder').value = entry.reminder || '';
        updateCharCount();
    } else {
        document.getElementById('entryDate').value = selectedDate;
        document.getElementById('entryForm').reset();
        document.getElementById('entryDate').value = selectedDate;
    }
}

// ============================================
// ENTRY MANAGEMENT
// ============================================

function handleSaveEntry(e) {
    e.preventDefault();

    const date = document.getElementById('entryDate').value;
    const summary = document.getElementById('entrySummary').value.trim();
    const content = document.getElementById('entryContent').value.trim();
    const isBookmarked = document.getElementById('bookmark-toggle').checked;
    const reminder = document.getElementById('entryReminder').value.trim();

    if (!date || !summary || !content) {
        alert('Please fill in all required fields');
        return;
    }

    // Check if entry already exists
    const existingIndex = diaryEntries.findIndex(entry => entry.date === date);

    if (existingIndex > -1) {
        // Update existing entry
        diaryEntries[existingIndex] = {
            ...diaryEntries[existingIndex],
            summary,
            content,
            isBookmarked,
            reminder,
            updatedAt: new Date().toISOString()
        };
    } else {
        // Create new entry
        diaryEntries.push({
            date,
            summary,
            content,
            isBookmarked,
            reminder,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }

    // Sort entries by date (newest first)
    diaryEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

    saveUserData();
    displayEntries();
    displayBookmarks();
    displayReminders();
    
    // Reset form
    document.getElementById('entryForm').reset();
    setDateToToday();

    // Show confirmation
    showNotification('Entry saved successfully! ✨');
}

function resetForm() {
    document.getElementById('entryDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('entrySummary').value = '';
    document.getElementById('entryContent').value = '';
    document.getElementById('bookmark-toggle').checked = false;
    document.getElementById('entryReminder').value = '';
    updateCharCount();
}

function updateCharCount() {
    const summary = document.getElementById('entrySummary').value;
    const charCount = document.getElementById('charCount');
    charCount.textContent = `${summary.length}/100`;
}

// ============================================
// ENTRIES DISPLAY
// ============================================

function displayEntries() {
    const entriesList = document.getElementById('entriesList');

    if (diaryEntries.length === 0) {
        entriesList.innerHTML = '<p class="empty-message">No entries yet. Start writing your first entry!</p>';
        return;
    }

    entriesList.innerHTML = diaryEntries.map(entry => `
        <div class="entry-card" onclick="viewEntry('${entry.date}')">
            <div class="entry-header">
                <span class="entry-date">
                    <i class="fas fa-calendar-day"></i>
                    ${formatDate(entry.date)}
                </span>
                <span class="entry-star ${entry.isBookmarked ? 'bookmarked' : ''}" 
                      onclick="event.stopPropagation(); toggleBookmark('${entry.date}')">
                    <i class="fas fa-star"></i>
                </span>
            </div>
            <div class="entry-summary">${escapeHtml(entry.summary)}</div>
            <div class="entry-preview">${escapeHtml(entry.content)}</div>
            ${entry.reminder ? `
                <div class="entry-reminder">
                    <i class="fas fa-bell"></i>
                    ${escapeHtml(entry.reminder)}
                </div>
            ` : ''}
        </div>
    `).join('');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ============================================
// BOOKMARK FUNCTIONALITY
// ============================================

function toggleBookmark(date) {
    const entry = diaryEntries.find(e => e.date === date);
    if (entry) {
        entry.isBookmarked = !entry.isBookmarked;
        saveUserData();
        displayEntries();
        displayBookmarks();
        showNotification(entry.isBookmarked ? 'Added to bookmarks! 📌' : 'Removed from bookmarks');
    }
}

function displayBookmarks() {
    const bookmarksList = document.getElementById('bookmarksList');
    const bookmarkedEntries = diaryEntries.filter(e => e.isBookmarked);

    if (bookmarkedEntries.length === 0) {
        bookmarksList.innerHTML = '<p class="empty-message">No bookmarks yet</p>';
        return;
    }

    bookmarksList.innerHTML = bookmarkedEntries.map(entry => `
        <div class="bookmark-item" onclick="viewEntry('${entry.date}')">
            <i class="fas fa-star"></i>
            ${formatDate(entry.date)} - ${entry.summary.substring(0, 25)}...
        </div>
    `).join('');
}

// ============================================
// REMINDER FUNCTIONALITY
// ============================================

function displayReminders() {
    const remindersList = document.getElementById('remindersList');
    const entriesWithReminders = diaryEntries.filter(e => e.reminder);

    if (entriesWithReminders.length === 0) {
        remindersList.innerHTML = '<p class="empty-message">No reminders set</p>';
        return;
    }

    remindersList.innerHTML = entriesWithReminders.map(entry => `
        <div class="reminder-item" onclick="viewEntry('${entry.date}')">
            <i class="fas fa-bell"></i>
            ${entry.reminder}
            <br>
            <small>${formatDate(entry.date)}</small>
        </div>
    `).join('');

    checkReminders();
}

function checkReminders() {
    const today = new Date().toISOString().split('T')[0];
    const todayReminders = diaryEntries.filter(e => e.reminder && e.date === today);

    if (todayReminders.length > 0) {
        todayReminders.forEach(entry => {
            showNotification(`📌 Reminder: ${entry.reminder}`);
        });
    }
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const searchResults = document.getElementById('searchResults');

    if (!query) {
        searchResults.innerHTML = '';
        return;
    }

    const results = diaryEntries.filter(entry =>
        entry.summary.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query) ||
        formatDate(entry.date).toLowerCase().includes(query)
    );

    if (results.length === 0) {
        searchResults.innerHTML = '<p class="empty-message">No matching entries found</p>';
        return;
    }

    searchResults.innerHTML = results.map(entry => `
        <div class="search-item" onclick="viewEntry('${entry.date}')">
            <strong>${formatDate(entry.date)}</strong><br>
            ${entry.summary.substring(0, 40)}...
        </div>
    `).join('');
}

// ============================================
// MODAL FUNCTIONALITY
// ============================================

function viewEntry(date) {
    const entry = diaryEntries.find(e => e.date === date);
    if (!entry) return;

    const modal = document.getElementById('entryModal');
    
    document.getElementById('modalTitle').textContent = 'Entry Details';
    document.getElementById('modalDate').innerHTML = `
        <i class="fas fa-calendar"></i>
        ${formatDate(entry.date)}
    `;
    document.getElementById('modalBookmark').innerHTML = entry.isBookmarked ? 
        '<i class="fas fa-star" style="color: var(--secondary-color);"></i> Important' : 
        '';
    document.getElementById('modalSummary').textContent = entry.summary;
    document.getElementById('modalContent').textContent = entry.content;
    
    if (entry.reminder) {
        document.getElementById('modalReminder').innerHTML = `
            <i class="fas fa-bell"></i> Reminder: ${entry.reminder}
        `;
    } else {
        document.getElementById('modalReminder').innerHTML = '';
    }

    currentEditingDate = date;
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('entryModal').classList.remove('active');
    currentEditingDate = null;
}

function openEditModal() {
    closeModal();
    
    const entry = diaryEntries.find(e => e.date === currentEditingDate);
    if (!entry) return;

    document.getElementById('editDate').value = entry.date;
    document.getElementById('editSummary').value = entry.summary;
    document.getElementById('editContent').value = entry.content;
    document.getElementById('editBookmark').checked = entry.isBookmarked || false;
    document.getElementById('editReminder').value = entry.reminder || '';

    document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
}

function handleEditEntry(e) {
    e.preventDefault();

    const entry = diaryEntries.find(e => e.date === currentEditingDate);
    if (!entry) return;

    const newDate = document.getElementById('editDate').value;
    const dateChanged = newDate !== currentEditingDate;

    if (dateChanged) {
        const dateExists = diaryEntries.find(e => e.date === newDate);
        if (dateExists) {
            alert('An entry already exists for this date');
            return;
        }
    }

    entry.date = newDate;
    entry.summary = document.getElementById('editSummary').value;
    entry.content = document.getElementById('editContent').value;
    entry.isBookmarked = document.getElementById('editBookmark').checked;
    entry.reminder = document.getElementById('editReminder').value;
    entry.updatedAt = new Date().toISOString();

    diaryEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    saveUserData();
    
    closeEditModal();
    displayEntries();
    displayBookmarks();
    displayReminders();
    
    showNotification('Entry updated successfully! ✏️');
}

function deleteCurrentEntry() {
    if (!confirm('Are you sure you want to delete this entry? This cannot be undone.')) {
        return;
    }

    diaryEntries = diaryEntries.filter(e => e.date !== currentEditingDate);
    saveUserData();
    
    closeModal();
    displayEntries();
    displayBookmarks();
    displayReminders();
    
    showNotification('Entry deleted successfully! 🗑️');
}

// ============================================
// QUOTES
// ============================================

function displayRandomQuote() {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    
    const authQuote = document.getElementById('authQuote');
    const mainQuote = document.getElementById('mainQuote');

    if (authQuote) {
        authQuote.textContent = `"${randomQuote}"`;
    }

    if (mainQuote) {
        mainQuote.textContent = `"${randomQuote}"`;
    }
}

// ============================================
// THEME MANAGEMENT
// ============================================

function initializeTheme() {
    const savedTheme = localStorage.getItem('diaryTheme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('diaryTheme', isDark ? 'dark' : 'light');
    
    const themeIcon = document.getElementById('toggleTheme');
    if (isDark) {
        themeIcon.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        themeIcon.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// ============================================
// LOGOUT
// ============================================

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        diaryEntries = [];
        isLoggedIn = false;
        currentEditingDate = null;
        
        // Clear forms
        document.getElementById('loginForm').reset();
        document.getElementById('registerForm').reset();
        document.getElementById('entryForm').reset();
        
        // Reset to login tab
        document.getElementById('loginTab').classList.add('active');
        document.getElementById('registerTab').classList.remove('active');
        document.getElementById('loginForm').classList.add('active');
        document.getElementById('registerForm').classList.remove('active');
        
        clearAuthMessages();
        showAuthApp();
        displayRandomQuote();
        
        showNotification('Logged out successfully! Goodbye 👋');
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(50px);
        }
    }
`;
document.head.appendChild(style);

// ============================================
// END OF DIARY APPLICATION
// ============================================
