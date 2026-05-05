const API_BASE_URL = 'http://localhost:3000';

// --- UTILITIES ---
function showAlert(elementId, message, type = 'success') {
    const alertEl = document.getElementById(elementId);
    if (!alertEl) return;
    
    alertEl.textContent = message;
    alertEl.className = `alert alert-${type}`;
    alertEl.style.display = 'block';
    
    setTimeout(() => {
        alertEl.style.display = 'none';
    }, 5000);
}

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
}

function decodeToken(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

function getUserRole() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const decoded = decodeToken(token);
    return decoded ? decoded.role : null;
}

function applyRoleUI() {
    const role = getUserRole();
    if (!role) return;

    if (role === 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
        document.querySelectorAll('.user-only').forEach(el => el.classList.add('hidden'));
    } else {
        document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.user-only').forEach(el => el.classList.remove('hidden'));
    }
}

function checkAuth() {
    const token = localStorage.getItem('token');
    const path = window.location.pathname;
    const isAuthPage = path.endsWith('login.html') || path.endsWith('register.html');
    
    // Simple protection
    if (!token && !isAuthPage && !path.endsWith('/') && path !== "") {
        window.location.href = 'login.html';
    } else if (token && isAuthPage) {
        window.location.href = 'dashboard.html';
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

async function apiCall(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: getAuthHeaders()
        };
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const data = await response.json().catch(() => ({}));
        
        if (!response.ok) {
            throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// --- PAGE INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    const path = window.location.pathname;

    // Login Page
    if (path.endsWith('login.html')) {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const btn = document.getElementById('login-btn');
                
                try {
                    btn.textContent = 'Logging in...';
                    btn.disabled = true;
                    const data = await apiCall('/users/login', 'POST', { email, password });
                    
                    if (data.token) {
                        localStorage.setItem('token', data.token);
                        window.location.href = 'dashboard.html';
                    } else {
                        showAlert('login-alert', 'Invalid response from server', 'danger');
                    }
                } catch (error) {
                    showAlert('login-alert', error.message, 'danger');
                } finally {
                    btn.textContent = 'Sign In';
                    btn.disabled = false;
                }
            });
        }
    }

    // Register Page
    else if (path.endsWith('register.html')) {
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('reg-name').value;
                const email = document.getElementById('reg-email').value;
                const password = document.getElementById('reg-password').value;
                const btn = document.getElementById('register-btn');
                
                try {
                    btn.textContent = 'Registering...';
                    btn.disabled = true;
                    // Assuming endpoint is /users/register
                    await apiCall('/users/register', 'POST', { name, email, password });
                    
                    showAlert('register-alert', 'Registration successful! Please login.', 'success');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } catch (error) {
                    showAlert('register-alert', error.message, 'danger');
                } finally {
                    btn.textContent = 'Register';
                    btn.disabled = false;
                }
            });
        }
    }

    // Dashboard Page
    else if (path.endsWith('dashboard.html')) {
        // Apply Role based UI classes
        applyRoleUI();
        const role = getUserRole();
        
        // Show user email
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = decodeToken(token);
            if (decoded && decoded.email) {
                const emailDisplay = document.getElementById('user-email-display');
                if (emailDisplay) emailDisplay.textContent = decoded.email;
            }
        }

        // Logout handler
        document.getElementById('logout-btn')?.addEventListener('click', logout);
        
        // Refresh books
        document.getElementById('refresh-books-btn')?.addEventListener('click', loadBooks);
        
        // Refresh users
        document.getElementById('refresh-users-btn')?.addEventListener('click', loadUsers);

        // Initial Data Load
        if (role === 'admin') {
            loadDashboardStats();
            loadUsers();
        } else if (role === 'user') {
            getMyIssuedBooks();
            getMyFine();
        }
        loadBooks();

        // Add Book
        const addBookForm = document.getElementById('add-book-form');
        if (addBookForm) {
            addBookForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const title = document.getElementById('book-title').value;
                const author = document.getElementById('book-author').value;
                const quantity = parseInt(document.getElementById('book-quantity').value);
                
                try {
                    await apiCall('/books', 'POST', { title, author, quantity });
                    showAlert('add-book-alert', 'Book added successfully!', 'success');
                    addBookForm.reset();
                    loadBooks(); // refresh list
                    loadDashboardStats(); // refresh stats
                } catch (error) {
                    showAlert('add-book-alert', error.message, 'danger');
                }
            });
        }

        // Issue Book
        const issueBookForm = document.getElementById('issue-book-form');
        if (issueBookForm) {
            issueBookForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const user_id = document.getElementById('issue-user-id').value;
                const book_id = document.getElementById('issue-book-id').value;
                
                try {
                    await apiCall('/issue', 'POST', { user_id, book_id });
                    showAlert('issue-book-alert', 'Book issued successfully!', 'success');
                    issueBookForm.reset();
                    loadBooks();
                    loadDashboardStats();
                } catch (error) {
                    showAlert('issue-book-alert', error.message, 'danger');
                }
            });
        }

        // Return Book
        const returnBookForm = document.getElementById('return-book-form');
        if (returnBookForm) {
            returnBookForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const issue_id = document.getElementById('return-issue-id').value;
                
                try {
                    await apiCall(`/issue/return/${issue_id}`, 'PUT');
                    showAlert('return-book-alert', 'Book returned successfully!', 'success');
                    returnBookForm.reset();
                    loadBooks();
                    loadDashboardStats();
                } catch (error) {
                    showAlert('return-book-alert', error.message, 'danger');
                }
            });
        }

        // Edit Book Modal
        const editBookForm = document.getElementById('edit-book-form');
        if (editBookForm) {
            editBookForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = document.getElementById('edit-book-id').value;
                const title = document.getElementById('edit-book-title').value;
                const author = document.getElementById('edit-book-author').value;
                const quantity = parseInt(document.getElementById('edit-book-quantity').value);
                
                try {
                    await apiCall(`/books/${id}`, 'PUT', { title, author, quantity });
                    showAlert('edit-book-alert', 'Book updated successfully!', 'success');
                    setTimeout(() => {
                        window.closeEditBookModal();
                        loadBooks();
                    }, 1000);
                } catch (error) {
                    showAlert('edit-book-alert', error.message, 'danger');
                }
            });
        }

        const closeEditModalBtn = document.getElementById('close-edit-modal');
        if (closeEditModalBtn) {
            closeEditModalBtn.addEventListener('click', window.closeEditBookModal);
        }
    }
});

// --- DASHBOARD DATA FUNCTIONS ---

async function loadDashboardStats() {
    try {
        const stats = await apiCall('/dashboard');
        
        // Populate stats assuming stats object has these properties
        document.getElementById('stat-total-books').textContent = stats.totalBooks ?? stats.TotalBooks ?? 0;
        document.getElementById('stat-total-users').textContent = stats.totalUsers ?? stats.TotalUsers ?? 0;
        document.getElementById('stat-issued-books').textContent = stats.issuedBooks ?? stats.IssuedBooks ?? 0;
        document.getElementById('stat-returned-books').textContent = stats.returnedBooks ?? stats.ReturnedBooks ?? 0;
        document.getElementById('stat-total-fine').textContent = `$${stats.totalFine ?? stats.TotalFine ?? 0}`;
        
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

window.allBooks = [];

async function loadBooks() {
    const tbody = document.getElementById('books-tbody');
    if (!tbody) return;
    
    try {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted" style="padding: 2rem;">Loading books...</td></tr>';
        const books = await apiCall('/books');
        
        if (!Array.isArray(books) || books.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted" style="padding: 2rem;">No books found</td></tr>';
            return;
        }

        window.allBooks = books;
        const role = getUserRole();

        tbody.innerHTML = books.map(book => `
            <tr>
                <td style="font-size: 0.875rem; color: var(--text-muted);">${book.id || book._id || '-'}</td>
                <td style="font-weight: 500;">${book.title}</td>
                <td>${book.author}</td>
                <td>
                    <span class="badge ${book.quantity > 0 ? 'badge-primary' : ''}" style="${book.quantity === 0 ? 'background-color: var(--danger-bg); color: var(--danger-hover);' : ''}">
                        ${book.quantity}
                    </span>
                </td>
                <td class="admin-only ${role !== 'admin' ? 'hidden' : ''}">
                    <button class="btn btn-outline btn-sm" onclick="openEditBookModal(${book.id || book._id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteBook(${book.id || book._id})">Delete</button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted" style="color: var(--danger); padding: 2rem;">Error loading books: ${error.message}</td></tr>`;
    }
}

// --- ADMIN FUNCTIONS ---

async function loadUsers() {
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;
    
    try {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted" style="padding: 2rem;">Loading users...</td></tr>';
        const users = await apiCall('/users');
        
        if (!Array.isArray(users) || users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted" style="padding: 2rem;">No users found</td></tr>';
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr>
                <td style="font-size: 0.875rem; color: var(--text-muted);">${user.id || user._id || '-'}</td>
                <td style="font-weight: 500;">${user.name}</td>
                <td>${user.email}</td>
                <td><span class="badge ${user.role === 'admin' ? 'badge-primary' : ''}">${user.role}</span></td>
                <td style="color: ${user.totalFine > 0 ? 'var(--danger)' : 'inherit'}">₹${user.totalFine || 0}</td>
                <td>
                    ${user.role !== 'admin' ? `<button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id || user._id})">Delete</button>` : '-'}
                </td>
            </tr>
        `).join('');

    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="color: var(--danger); padding: 2rem;">Error loading users: ${error.message}</td></tr>`;
    }
}

window.deleteUser = async function(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
        await apiCall(`/users/${id}`, 'DELETE');
        showAlert('add-book-alert', 'User deleted successfully!', 'success');
        loadUsers();
        if (getUserRole() === 'admin') loadDashboardStats();
    } catch (error) {
        alert(error.message || 'Failed to delete user');
    }
};

window.deleteBook = async function(id) {
    if (!confirm('Are you sure you want to delete this book?')) return;
    try {
        await apiCall(`/books/${id}`, 'DELETE');
        showAlert('add-book-alert', 'Book deleted successfully!', 'success');
        loadBooks();
        if (getUserRole() === 'admin') loadDashboardStats();
    } catch (error) {
        alert('Failed to delete book: ' + error.message);
    }
};

window.openEditBookModal = function(id) {
    const book = window.allBooks.find(b => (b.id || b._id) == id);
    if (!book) return;
    
    document.getElementById('edit-book-id').value = id;
    document.getElementById('edit-book-title').value = book.title;
    document.getElementById('edit-book-author').value = book.author;
    document.getElementById('edit-book-quantity').value = book.quantity;
    
    document.getElementById('edit-book-modal').classList.remove('hidden');
};

window.closeEditBookModal = function() {
    document.getElementById('edit-book-modal').classList.add('hidden');
    const form = document.getElementById('edit-book-form');
    if (form) form.reset();
};

// --- USER FUNCTIONS ---

async function getMyIssuedBooks() {
    const tbody = document.getElementById('my-issued-books-tbody');
    if (!tbody) return;
    
    try {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted" style="padding: 2rem;">Loading...</td></tr>';
        const books = await apiCall('/issue/my');
        
        if (!Array.isArray(books) || books.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted" style="padding: 2rem;">No issued books</td></tr>';
            return;
        }

        tbody.innerHTML = books.map(issue => `
            <tr>
                <td style="font-weight: 500;">${issue.title || issue.book_title || '-'}</td>
                <td>${issue.author || '-'}</td>
                <td>${issue.issue_date ? new Date(issue.issue_date).toLocaleDateString() : '-'}</td>
                <td>${issue.due_date ? new Date(issue.due_date).toLocaleDateString() : '-'}</td>
                <td><span class="badge badge-primary">${issue.status || 'Issued'}</span></td>
            </tr>
        `).join('');

    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="color: var(--danger); padding: 2rem;">Error loading books: ${error.message}</td></tr>`;
    }
}

async function getMyFine() {
    const fineEl = document.getElementById('my-fine-amount');
    if (!fineEl) return;
    
    try {
        const response = await apiCall('/issue/fine');
        const fine = response.totalFine || response.fine || response.amount || 0;
        
        if (fine === 0) {
            fineEl.textContent = 'No fine';
            fineEl.style.color = 'var(--success)';
        } else {
            fineEl.textContent = `₹${fine}`;
            fineEl.style.color = 'var(--danger)';
        }
    } catch (error) {
        console.error('Failed to load fine:', error);
        fineEl.textContent = 'Error';
    }
}
