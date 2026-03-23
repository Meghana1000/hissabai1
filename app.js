/* ============================================
   HisaabAI Main App - Router & Shell
   ============================================ */

const App = (() => {
    const pages = ['dashboard', 'khata', 'add', 'ai', 'history', 'customers', 'reports', 'settings'];
    let currentPage = 'dashboard';

    const pageTitles = {
        dashboard: 'HisaabAI',
        khata: 'Credit Ledger',
        add: 'Add Entry',
        ai: 'AI Assistant',
        history: 'Transaction History',
        customers: 'Customers',
        reports: 'Reports',
        settings: 'Settings'
    };

    // ---------- Init ----------
    function init() {
        const settings = Store.getSettings();
        
        // Hide splash screen initially
        setTimeout(() => {
            const splash = document.getElementById('splash-screen');
            splash.classList.add('fade-out');
            setTimeout(() => {
                splash.style.display = 'none';

                if (!settings.onboardingComplete) {
                    // Show onboarding
                    document.getElementById('onboarding-screen').classList.remove('hidden');
                    Onboarding.render();
                } else {
                    // Show app immediately
                    completeOnboardingStart();
                }
            }, 600);
        }, 1500);
    }

    function completeOnboardingStart() {
        document.getElementById('app').classList.remove('hidden');
        
        // Seed demo data only if they haven't disabled it/on first run
        Store.seedDemoData();

        // Set up navigation
        setupNavigation();

        // Render settings page (static content)
        renderSettings();

        // Hide credit-only nav items if credit is disabled
        const settings = Store.getSettings();
        const navKhata = document.getElementById('nav-khata');
        if (navKhata) {
            navKhata.style.display = settings.creditFacility !== false ? 'flex' : 'none';
        }

        // Handle initial route
        const hash = window.location.hash.replace('#', '') || 'dashboard';
        navigate(hash);
    }

    // ---------- Navigation ----------
    function setupNavigation() {
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.replace('#', '') || 'dashboard';
            navigate(hash);
        });
    }

    function navigate(page) {
        if (!pages.includes(page)) page = 'dashboard';
        currentPage = page;

        // Update pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const pageEl = document.getElementById('page-' + page);
        if (pageEl) pageEl.classList.add('active');

        // Update nav
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const navEl = document.querySelector(`[data-nav="${page}"]`);
        if (navEl) navEl.classList.add('active');

        // Update header
        document.getElementById('page-title').textContent = pageTitles[page] || 'HisaabAI';

        // Render page content
        renderPage(page);

        // Scroll to top
        document.querySelector('.page-container').scrollTop = 0;
    }

    function renderPage(page) {
        try {
            switch (page) {
                case 'dashboard': Dashboard.render(); break;
                case 'khata': Khata.render(); break;
                case 'add': Transactions.render(); break;
                case 'ai': AIInsights.render(); break;
                case 'history': History.render(); break;
                case 'customers': Customers.render(); break;
                case 'reports': Reports.render(); break;
                case 'settings': renderSettings(); break;
            }
        } catch (error) {
            console.error('RENDER ERROR on page', page, ':', error);
            App.showToast(`Error rendering ${page}: ` + error.message, 'error');
        }
    }

    // ---------- Helper Navigation ----------
    function navigateAndSetType(type) {
        Transactions.setType(type);
        window.location.hash = '#add';
    }

    function navigateAndSetCustomer(customerId, customerName) {
        closeModal();
        Transactions.setCustomer(customerId, customerName);
        setTimeout(() => {
            window.location.hash = '#add';
        }, 350);
    }

    // ---------- Modal ----------
    function showModal(html) {
        const overlay = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        content.innerHTML = html;
        overlay.classList.remove('hidden');

        // Close on overlay click
        overlay.onclick = (e) => {
            if (e.target === overlay) closeModal();
        };
    }

    function closeModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
    }

    // ---------- Toast ----------
    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const icons = { success: '✅', error: '❌', info: 'ℹ️' };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type]}</span>
            <span class="toast-message">${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-out');
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    // ---------- Transaction Detail ----------
    function showTransactionDetail(txnId) {
        const txns = Store.getTransactions();
        const txn = txns.find(t => t.id === txnId);
        if (!txn) return;

        const icons  = { sale: '💵', purchase: '🛛', expense: '🧾', credit: '📝', payment: '💳' };
        const labels = { sale: 'Sales', purchase: 'Purchase', expense: 'Expense', credit: 'Credit', payment: 'Payment Received' };
        const amountColors = {
            sale: 'var(--color-income)',
            expense: 'var(--color-expense)',
            credit: 'var(--color-credit)',
            payment: 'var(--color-payment)'
        };

        const modalHtml = `
            <div class="modal-handle"></div>
            <div class="modal-header">
                <div class="modal-title">${icons[txn.type]} Transaction Detail</div>
                <button class="modal-close" onclick="App.closeModal()">✕</button>
            </div>

            <div style="text-align: center; margin-bottom: 24px;">
                <div class="badge ${txn.type === 'sale' ? 'badge-success' : txn.type === 'expense' ? 'badge-danger' : txn.type === 'credit' ? 'badge-warning' : 'badge-info'}" style="margin-bottom: 12px;">
                    ${labels[txn.type]}
                </div>
                <div style="font-size: 2.2rem; font-weight: 800; font-family: 'Poppins', sans-serif; color: ${amountColors[txn.type]};">
                    ${Store.formatRupee(txn.amount)}
                </div>
            </div>

            <div class="glass-card glass-card-sm mb-lg">
                <div class="stat-row">
                    <span class="stat-label">Description</span>
                    <span class="stat-value" style="font-size: 0.85rem;">${txn.description || '-'}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Category</span>
                    <span class="stat-value" style="font-size: 0.85rem;">${txn.category}</span>
                </div>
                ${txn.customerName ? `
                    <div class="stat-row">
                        <span class="stat-label">Customer</span>
                        <span class="stat-value" style="font-size: 0.85rem;">${txn.customerName}</span>
                    </div>
                ` : ''}
                <div class="stat-row">
                    <span class="stat-label">Date</span>
                    <span class="stat-value" style="font-size: 0.85rem;">${Store.formatDate(txn.date)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Time</span>
                    <span class="stat-value" style="font-size: 0.85rem;">${Store.formatTime(txn.createdAt)}</span>
                </div>
            </div>

            <button class="btn btn-outline btn-block" style="color: var(--color-expense); border-color: rgba(255,107,107,0.3);"
                onclick="App.deleteTransaction('${txn.id}')">
                🗑️ Delete Transaction
            </button>
        `;

        showModal(modalHtml);
    }

    function deleteTransaction(txnId) {
        if (confirm('Are you sure you want to delete this transaction? This cannot be undone.')) {
            Store.deleteTransaction(txnId);
            closeModal();
            showToast('Transaction deleted', 'info');
            renderPage(currentPage);
        }
    }

    // ---------- Settings Page ----------
    function renderSettings() {
        const container = document.getElementById('page-settings');
        const settings = Store.getSettings();
        const txnCount = Store.getTransactions().length;
        const custCount = Store.getCustomers().length;

        container.innerHTML = `
            <!-- App Info -->
            <div style="text-align: center; margin-bottom: 32px;" class="animate-fade-in">
                <div style="font-size: 3rem; margin-bottom: 8px;">📒</div>
                <div style="font-family: 'Poppins', sans-serif; font-size: 1.5rem; font-weight: 800; background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                    HisaabAI
                </div>
                <div class="text-muted" style="font-size: 0.78rem;">AI-Powered Smart Bookkeeping</div>
                <div class="text-muted" style="font-size: 0.72rem; margin-top: 4px;">Version ${CONFIG.VERSION}</div>
            </div>

            <!-- AI Settings (Gemini) -->
            <div class="settings-group">
                <div class="settings-group-title">🤖 AI Settings</div>
                <div class="settings-item" style="flex-direction: column; align-items: stretch; cursor: default;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <div class="settings-item-icon">🔑</div>
                        <div>
                            <div class="settings-item-title">Gemini AI Key</div>
                            <div class="settings-item-desc">Free key from <a href="https://aistudio.google.com/apikey" target="_blank" style="color: var(--accent-primary);">aistudio.google.com</a></div>
                        </div>
                    </div>
                    <input type="password" id="gemini-api-key-input" class="form-input" 
                        placeholder="Paste your Gemini API key here"
                        value="${localStorage.getItem('hisaabai_gemini_key') || ''}"
                        style="font-size: 0.8rem; margin-bottom: 8px;">
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-primary" style="flex: 1; font-size: 0.8rem;" onclick="App.saveGeminiKey()">
                            💾 Save Key
                        </button>
                        <button class="btn btn-outline" style="flex: 1; font-size: 0.8rem;" onclick="App.clearGeminiKey()">
                            🗑️ Clear Key
                        </button>
                    </div>
                    <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 6px; line-height: 1.5;">
                        ✅ Free: 15 requests/minute, 1M tokens/day<br>
                        🔒 Your key is stored only on this device
                    </div>
                </div>
            </div>

            <!-- Store Settings -->
            <div class="settings-group">
                <div class="settings-group-title">Store Settings</div>
                <div class="settings-item" onclick="App.editStoreName()">
                    <div class="settings-item-icon">🏪</div>
                    <div class="settings-item-text">
                        <div class="settings-item-title">${settings.storeName}</div>
                        <div class="settings-item-desc">Change store name</div>
                    </div>
                    <div class="settings-item-arrow">›</div>
                </div>
                <div class="settings-item" onclick="App.editStoreType()">
                    <div class="settings-item-icon">🛍️</div>
                    <div class="settings-item-text">
                        <div class="settings-item-title" style="text-transform: capitalize;">${settings.storeType || 'kirana'} Store</div>
                        <div class="settings-item-desc">Change business type</div>
                    </div>
                    <div class="settings-item-arrow">›</div>
                </div>
            </div>

            <!-- Data & Reports -->
            <div class="settings-group">
                <div class="settings-group-title">Business & Data</div>
                <div class="settings-item" onclick="App.navigate('reports')">
                    <div class="settings-item-icon">📊</div>
                    <div class="settings-item-text">
                        <div class="settings-item-title">Full Reports</div>
                        <div class="settings-item-desc">P&L statement, margins & ratios</div>
                    </div>
                    <div class="settings-item-arrow">›</div>
                </div>
                <div class="settings-item" onclick="App.exportData()">
                    <div class="settings-item-icon">📤</div>
                    <div class="settings-item-text">
                        <div class="settings-item-title">Export Data</div>
                        <div class="settings-item-desc">Download backup as JSON</div>
                    </div>
                    <div class="settings-item-arrow">›</div>
                </div>
                <div class="settings-item" onclick="App.clearAllData()">
                    <div class="settings-item-icon">🗑️</div>
                    <div class="settings-item-text">
                        <div class="settings-item-title" style="color: var(--color-expense);">Clear All Data</div>
                        <div class="settings-item-desc">Delete all records (cannot be undone)</div>
                    </div>
                    <div class="settings-item-arrow">›</div>
                </div>
            </div>

            <!-- About -->
            <div class="settings-group">
                <div class="settings-group-title">About</div>
                <div class="settings-item" onclick="App.showAbout()">
                    <div class="settings-item-icon">💡</div>
                    <div class="settings-item-text">
                        <div class="settings-item-title">Made for Indian Small Businesses</div>
                        <div class="settings-item-desc">Simple, fast, and always free</div>
                    </div>
                    <div class="settings-item-arrow">›</div>
                </div>
                <div class="settings-item" onclick="App.showInstallGuide()">
                    <div class="settings-item-icon">📱</div>
                    <div class="settings-item-text">
                        <div class="settings-item-title">Install App</div>
                        <div class="settings-item-desc">Add to home screen for quick access</div>
                    </div>
                    <div class="settings-item-arrow">›</div>
                </div>
            </div>
        `;
    }

    function editStoreName() {
        const settings = Store.getSettings();
        const modalHtml = `
            <div class="modal-handle"></div>
            <div class="modal-header">
                <div class="modal-title">🏪 Store Name</div>
                <button class="modal-close" onclick="App.closeModal()">✕</button>
            </div>

            <div class="form-group">
                <label class="form-label">Store Name</label>
                <input type="text" id="edit-store-name" class="form-input" 
                    value="${settings.storeName}" autofocus>
            </div>

            <button class="btn btn-primary btn-block btn-lg" onclick="App.saveStoreName()">
                ✅ Save
            </button>
        `;
        showModal(modalHtml);
    }

    function saveStoreName() {
        const name = document.getElementById('edit-store-name').value.trim();
        if (name) {
            Store.updateSettings({ storeName: name });
            closeModal();
            showToast('Store name updated! ✅', 'success');
            renderSettings();
            Dashboard.render();
        }
    }

    function editStoreType() {
        const settings = Store.getSettings();
        const types = [
            { id: 'kirana', icon: '🏪', name: 'Kirana / General' },
            { id: 'medical', icon: '💊', name: 'Medical / Pharmacy' },
            { id: 'electronics', icon: '📱', name: 'Electronics / Mobile' },
            { id: 'restaurant', icon: '🍽️', name: 'Restaurant / Cafe' },
            { id: 'bakery', icon: '🍞', name: 'Bakery / Sweets' },
            { id: 'clothing', icon: '👗', name: 'Clothing / Textiles' },
            { id: 'hardware', icon: '🔧', name: 'Hardware / Tools' },
            { id: 'other', icon: '🏢', name: 'Other' }
        ];

        const modalHtml = `
            <div class="modal-handle"></div>
            <div class="modal-header">
                <div class="modal-title">🛍️ Store Type</div>
                <button class="modal-close" onclick="App.closeModal()">✕</button>
            </div>
            
            <div class="form-group mb-lg">
                <label class="form-label mb-sm">What type of business do you run?</label>
                <div class="store-type-grid">
                    ${types.map(t => `
                        <div class="store-type-option ${settings.storeType === t.id ? 'active' : ''}" 
                             onclick="App.saveStoreType('${t.id}')">
                            <div class="store-type-icon">${t.icon}</div>
                            <div class="store-type-name">${t.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        showModal(modalHtml);
    }

    function saveStoreType(type) {
        Store.updateSettings({ storeType: type });
        closeModal();
        showToast('Store type updated! AI will tailor advice accordingly.', 'success');
        renderSettings();
    }

    // ---------- Gemini API Key ----------
    function saveGeminiKey() {
        const input = document.getElementById('gemini-api-key-input');
        if (!input) return;
        const key = input.value.trim();
        if (!key) {
            showToast('Please paste your Gemini API key first', 'error');
            return;
        }
        localStorage.setItem('hisaabai_gemini_key', key);
        showToast('Gemini AI key saved! 🤖', 'success');
        renderSettings();
    }

    function clearGeminiKey() {
        localStorage.removeItem('hisaabai_gemini_key');
        const input = document.getElementById('gemini-api-key-input');
        if (input) input.value = '';
        showToast('Gemini AI key removed', 'info');
        renderSettings();
    }

    function exportData() {
        const data = {
            transactions: Store.getTransactions(),
            customers: Store.getCustomers(),
            settings: Store.getSettings(),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hisaabai-backup-${Store.getToday()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Data exported successfully! 📤', 'success');
    }

    function clearAllData() {
        const modalHtml = `
            <div class="modal-handle"></div>
            <div class="modal-header">
                <div class="modal-title">🗑️ Clear All Data</div>
                <button class="modal-close" onclick="App.closeModal()">✕</button>
            </div>

            <div style="text-align: center; padding: 16px 0;">
                <div style="font-size: 3rem; margin-bottom: 12px;">⚠️</div>
                <div style="font-size: 1.1rem; font-weight: 700; color: var(--color-expense); margin-bottom: 8px;">
                    Delete ALL Data?
                </div>
                <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
                    This will permanently delete:<br>
                    • All transactions (sales, purchases, expenses)<br>
                    • All customer records<br>
                    • All credit/payment history<br><br>
                    <strong style="color: var(--color-expense);">This action cannot be undone!</strong>
                </div>
            </div>

            <div style="display: flex; gap: 8px; margin-top: 12px;">
                <button class="btn btn-outline" style="flex: 1;" onclick="App.closeModal()">
                    ❌ Cancel
                </button>
                <button class="btn" style="flex: 1; background: var(--color-expense); color: white; font-weight: 700;" 
                    onclick="App.confirmDeleteAllData()">
                    🗑️ Yes, Delete All
                </button>
            </div>
        `;
        showModal(modalHtml);
    }

    function confirmDeleteAllData() {
        localStorage.removeItem('hisaabai_transactions');
        localStorage.removeItem('hisaabai_customers');
        closeModal();
        showToast('All data has been cleared', 'info');
        navigate('dashboard');
    }

    // ---------- About & Install ----------
    function showAbout() {
        const txnCount = Store.getTransactions().length;
        const custCount = Store.getCustomers().length;
        const modalHtml = `
            <div class="modal-handle"></div>
            <div class="modal-header">
                <div class="modal-title">💡 About HisaabAI</div>
                <button class="modal-close" onclick="App.closeModal()">✕</button>
            </div>

            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 3rem; margin-bottom: 8px;">📒</div>
                <div style="font-family: 'Poppins', sans-serif; font-size: 1.3rem; font-weight: 800; background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                    HisaabAI
                </div>
                <div class="text-muted" style="font-size: 0.78rem;">AI-Powered Smart Bookkeeping</div>
                <div class="text-muted" style="font-size: 0.72rem; margin-top: 4px;">Version ${CONFIG.VERSION}</div>
            </div>

            <div class="glass-card glass-card-sm mb-md">
                <div class="stat-row">
                    <span class="stat-label">Total Transactions</span>
                    <span class="stat-value">${txnCount}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Total Customers</span>
                    <span class="stat-value">${custCount}</span>
                </div>
            </div>

            <div class="ai-insight-box" style="font-size: 0.82rem; line-height: 1.7;">
                <strong>Features:</strong><br>
                ✅ Indian GAAP-accurate P&L statement<br>
                ✅ Sales, Purchases & Expense tracking<br>
                ✅ GST guidance as per Indian law<br>
                ✅ AI-powered business insights (Gemini)<br>
                ✅ Credit management & customer tracking<br>
                ✅ Transaction history with smart filters<br>
                ✅ All data stays on your device — 100% private
            </div>

            <button class="btn btn-primary btn-block mt-lg" onclick="App.closeModal()">
                ✅ Got It
            </button>
        `;
        showModal(modalHtml);
    }

    function showInstallGuide() {
        const modalHtml = `
            <div class="modal-handle"></div>
            <div class="modal-header">
                <div class="modal-title">📱 Install HisaabAI</div>
                <button class="modal-close" onclick="App.closeModal()">✕</button>
            </div>

            <div class="ai-insight-box" style="font-size: 0.85rem; line-height: 1.8; margin-bottom: 16px;">
                <strong>📱 On Android (Chrome):</strong><br>
                1. Tap the <strong>⋮ menu</strong> (3 dots) at top-right<br>
                2. Select <strong>"Add to Home Screen"</strong><br>
                3. Tap <strong>"Add"</strong> — done!<br>
                <div class="divider"></div>
                <strong>🍎 On iPhone (Safari):</strong><br>
                1. Tap the <strong>Share button</strong> (box with arrow) at bottom<br>
                2. Scroll down and tap <strong>"Add to Home Screen"</strong><br>
                3. Tap <strong>"Add"</strong> — done!<br>
                <div class="divider"></div>
                <strong>💻 On Desktop (Chrome/Edge):</strong><br>
                1. Click the <strong>install icon</strong> in the address bar<br>
                2. Or press <strong>Ctrl + Shift + A</strong><br>
                3. Click <strong>"Install"</strong> — done!
            </div>

            <div style="font-size: 0.75rem; color: var(--text-muted); text-align: center; margin-bottom: 12px;">
                The app will open like a regular app — no browser needed!
            </div>

            <button class="btn btn-primary btn-block" onclick="App.closeModal()">
                ✅ Got It
            </button>
        `;
        showModal(modalHtml);
    }

    // ---------- Start App ----------
    document.addEventListener('DOMContentLoaded', init);

    return {
        navigate,
        navigateAndSetType,
        navigateAndSetCustomer,
        showModal,
        closeModal,
        showToast,
        showTransactionDetail,
        deleteTransaction,
        editStoreName,
        saveStoreName,
        editStoreType,
        saveStoreType,
        saveGeminiKey,
        clearGeminiKey,
        exportData,
        clearAllData,
        confirmDeleteAllData,
        showAbout,
        showInstallGuide,
        init,
        completeOnboardingStart
    };
})();
