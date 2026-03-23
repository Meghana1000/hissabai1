/* ============================================
   HisaabAI Customer Management Page
   ============================================ */

const Customers = (() => {
    let searchQuery = '';

    function render() {
        const container = document.getElementById('page-customers');
        const allCustomers = Store.getCustomers();

        const filtered = searchQuery
            ? allCustomers.filter(c =>
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.phone.includes(searchQuery)
            )
            : allCustomers;

        container.innerHTML = `
            <!-- Header -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                <div>
                    <div class="section-title">Customers</div>
                    <div class="section-subtitle">${allCustomers.length} total customers</div>
                </div>
                <button class="btn btn-primary" onclick="Customers.showAddForm()" style="font-size: 0.82rem;">
                    + New
                </button>
            </div>

            <!-- Search -->
            <div class="search-bar">
                <span class="search-bar-icon">🔍</span>
                <input type="text" id="customer-search" 
                    placeholder="Search by name or phone..."
                    value="${searchQuery}"
                    oninput="Customers.onSearch(this.value)">
            </div>

            <!-- Customer List -->
            ${filtered.length > 0 ? `
                <div class="customer-list stagger-in">
                    ${filtered.map(c => renderCustomerItem(c)).join('')}
                </div>
            ` : `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <div class="empty-state-title">${searchQuery ? 'No results found' : 'No customers yet'}</div>
                    <div class="empty-state-text">${searchQuery ? 'Try a different name' : 'Tap + New to add your first customer'}</div>
                    ${!searchQuery ? '<button class="btn btn-primary" onclick="Customers.showAddForm()">+ Add Customer</button>' : ''}
                </div>
            `}
        `;
    }

    function renderCustomerItem(customer) {
        const initials = customer.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        const balanceClass = customer.balance > 0 ? '' : 'clear';

        return `
            <div class="customer-item" onclick="Customers.showDetail('${customer.id}')">
                <div class="customer-avatar">${initials}</div>
                <div class="customer-info">
                    <div class="customer-name">${customer.name}</div>
                    <div class="customer-phone">${customer.phone || 'No phone'}</div>
                </div>
                <div class="customer-balance ${balanceClass}">
                    ${customer.balance > 0 ? Store.formatRupee(customer.balance) : '✅ Clear'}
                </div>
            </div>
        `;
    }

    function onSearch(query) {
        searchQuery = query;
        render();
    }

    function showAddForm() {
        const modalHtml = `
            <div class="modal-handle"></div>
            <div class="modal-header">
                <div class="modal-title">👤 Add New Customer</div>
                <button class="modal-close" onclick="App.closeModal()">✕</button>
            </div>

            <div class="form-group">
                <label class="form-label">Name *</label>
                <input type="text" id="new-customer-name" class="form-input" 
                    placeholder="Full name" autofocus>
            </div>

            <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input type="tel" id="new-customer-phone" class="form-input" 
                    placeholder="e.g. 9876543210" inputmode="numeric" maxlength="10">
            </div>

            <button class="btn btn-primary btn-block btn-lg" onclick="Customers.saveNew()">
                ✅ Save Customer
            </button>
        `;

        App.showModal(modalHtml);
    }

    function saveNew() {
        const name = document.getElementById('new-customer-name').value.trim();
        const phone = document.getElementById('new-customer-phone').value.trim();

        if (!name) {
            App.showToast('Enter customer name!', 'error');
            return;
        }

        Store.addCustomer({ name, phone });
        App.closeModal();
        App.showToast(`${name} added successfully! ✅`, 'success');
        render();
    }

    function showDetail(customerId) {
        const customer = Store.getCustomerById(customerId);
        if (!customer) return;

        const txns = Store.getCustomerTransactions(customerId);
        const initials = customer.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

        const credits = txns.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
        const payments = txns.filter(t => t.type === 'payment').reduce((s, t) => s + t.amount, 0);

        const modalHtml = `
            <div class="modal-handle"></div>
            <div class="modal-header">
                <div class="modal-title">Customer Detail</div>
                <button class="modal-close" onclick="App.closeModal()">✕</button>
            </div>

            <div style="text-align: center; margin-bottom: 20px;">
                <div class="customer-avatar" style="width: 64px; height: 64px; font-size: 1.4rem; margin: 0 auto 12px;">
                    ${initials}
                </div>
                <div style="font-size: 1.2rem; font-weight: 700; font-family: 'Poppins', sans-serif;">
                    ${customer.name}
                </div>
                <div class="text-muted" style="font-size: 0.82rem;">${customer.phone || 'No phone'}</div>
            </div>

            <!-- Balance Summary -->
            <div class="glass-card glass-card-sm mb-lg">
                <div class="stat-row">
                    <span class="stat-label">Total Credit Given</span>
                    <span class="stat-value" style="color: var(--color-credit)">${Store.formatRupee(credits)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Total Payments</span>
                    <span class="stat-value" style="color: var(--color-payment)">${Store.formatRupee(payments)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label" style="font-weight: 700;">Pending Amount</span>
                    <span class="stat-value" style="color: ${customer.balance > 0 ? 'var(--color-credit)' : 'var(--color-income)'}; font-size: 1.1rem;">
                        ${customer.balance > 0 ? Store.formatRupee(customer.balance) : '✅ Clear'}
                    </span>
                </div>
            </div>

            <!-- Actions -->
            <div style="display: flex; gap: 8px; margin-bottom: 20px;">
                ${customer.balance > 0 ? `
                    <button class="btn btn-success" style="flex: 1;" onclick="App.closeModal(); setTimeout(() => Khata.recordPayment('${customer.id}'), 350);">
                        💳 Payment Received
                    </button>
                ` : ''}
                <button class="btn btn-primary" style="flex: 1;" onclick="App.navigateAndSetCustomer('${customer.id}', '${customer.name}')">
                    📝 Add Credit
                </button>
            </div>

            <button class="btn btn-outline btn-block mb-lg" style="color: var(--color-expense); border-color: rgba(255,107,107,0.3);" 
                onclick="Customers.confirmDelete('${customer.id}', '${customer.name}')">
                🗑️ Delete Customer
            </button>

            <!-- Transaction History -->
            <div class="section-header">
                <div class="section-title">Transaction History</div>
            </div>

            ${txns.length > 0 ? `
                <div class="transaction-list">
                    ${txns.map(t => Dashboard.renderTransactionItem(t)).join('')}
                </div>
            ` : `
                <div class="empty-state">
                    <div class="empty-state-icon">📄</div>
                    <div class="empty-state-title">No transactions</div>
                </div>
            `}
        `;

        App.showModal(modalHtml);
    }

    function confirmDelete(customerId, customerName) {
        if (confirm(`Are you sure you want to delete "${customerName}"? This cannot be undone!`)) {
            Store.deleteCustomer(customerId);
            App.closeModal();
            App.showToast(`${customerName} deleted`, 'info');
            render();
        }
    }

    return { render, onSearch, showAddForm, saveNew, showDetail, confirmDelete };
})();
