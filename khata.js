/* ============================================
   HisaabAI Udhar Khata (Credit Ledger) Page
   ============================================ */

const Khata = (() => {
    let searchQuery = '';

    function render() {
        const container = document.getElementById('page-khata');
        const customersWithBalance = Store.getCustomersWithBalance();
        const allCustomers = Store.getCustomers();
        const totalReceivable = Store.getTotalReceivable();

        const filtered = searchQuery
            ? allCustomers.filter(c =>
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.phone.includes(searchQuery)
            )
            : customersWithBalance;

        container.innerHTML = `
            <!-- Total Outstanding -->
            <div class="glass-card mb-lg animate-fade-in" style="text-align: center;">
                <div class="summary-card-label">Total Pending Dues</div>
                <div class="summary-card-value credit" style="font-size: 2rem; margin-top: 8px;">
                    ${Store.formatRupee(totalReceivable)}
                </div>
                <div class="text-muted" style="font-size: 0.75rem; margin-top: 4px;">
                    ${customersWithBalance.length} customers have pending dues
                </div>
            </div>

            <!-- Search -->
            <div class="search-bar">
                <span class="search-bar-icon">🔍</span>
                <input type="text" 
                    id="khata-search" 
                    placeholder="Search customer..." 
                    value="${searchQuery}"
                    oninput="Khata.onSearch(this.value)">
            </div>

            <!-- Show All Toggle -->
            <div class="toggle-tabs mb-lg">
                <button class="toggle-tab ${!searchQuery ? 'active' : ''}" onclick="Khata.showWithBalance()">
                    Pending Dues (${customersWithBalance.length})
                </button>
                <button class="toggle-tab ${searchQuery ? 'active' : ''}" onclick="Khata.showAll()">
                    All Customers (${allCustomers.length})
                </button>
            </div>

            <!-- Customer List -->
            ${filtered.length > 0 ? `
                <div class="customer-list stagger-in">
                    ${filtered.map(c => renderCustomerItem(c)).join('')}
                </div>
            ` : `
                <div class="empty-state">
                    <div class="empty-state-icon">📒</div>
                    <div class="empty-state-title">${searchQuery ? 'No customer found' : 'No pending dues!'}</div>
                    <div class="empty-state-text">${searchQuery ? 'Try another name' : 'Great! All dues are cleared 🎉'}</div>
                </div>
            `}
        `;
    }

    function renderCustomerItem(customer) {
        const initials = customer.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        const balanceClass = customer.balance > 0 ? '' : 'clear';

        return `
            <div class="customer-item" onclick="Khata.showCustomerDetail('${customer.id}')">
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

    function showWithBalance() {
        searchQuery = '';
        render();
    }

    function showAll() {
        searchQuery = ' '; // trick: shows all
        const container = document.getElementById('page-khata');
        const allCustomers = Store.getCustomers();
        const totalReceivable = Store.getTotalReceivable();
        const customersWithBalance = Store.getCustomersWithBalance();

        container.innerHTML = `
            <div class="glass-card mb-lg animate-fade-in" style="text-align: center;">
                <div class="summary-card-label">Total Pending Dues</div>
                <div class="summary-card-value credit" style="font-size: 2rem; margin-top: 8px;">
                    ${Store.formatRupee(totalReceivable)}
                </div>
                <div class="text-muted" style="font-size: 0.75rem; margin-top: 4px;">
                    ${customersWithBalance.length} customers have pending dues
                </div>
            </div>

            <div class="search-bar">
                <span class="search-bar-icon">🔍</span>
                <input type="text" id="khata-search" placeholder="Search customer..." 
                    oninput="Khata.onSearch(this.value)">
            </div>

            <div class="toggle-tabs mb-lg">
                <button class="toggle-tab" onclick="Khata.showWithBalance()">
                    Pending Dues (${customersWithBalance.length})
                </button>
                <button class="toggle-tab active" onclick="Khata.showAll()">
                    All Customers (${allCustomers.length})
                </button>
            </div>

            ${allCustomers.length > 0 ? `
                <div class="customer-list stagger-in">
                    ${allCustomers.map(c => renderCustomerItem(c)).join('')}
                </div>
            ` : `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <div class="empty-state-title">No customers</div>
                    <div class="empty-state-text">Go to Customers page to add a new customer</div>
                </div>
            `}
        `;
    }

    function showCustomerDetail(customerId) {
        const customer = Store.getCustomerById(customerId);
        if (!customer) return;

        const txns = Store.getCustomerTransactions(customerId);
        const initials = customer.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

        const modalHtml = `
            <div class="modal-handle"></div>
            <div class="modal-header">
                <div class="modal-title">Customer Detail</div>
                <button class="modal-close" onclick="App.closeModal()">✕</button>
            </div>

            <div style="text-align: center; margin-bottom: 24px;">
                <div class="customer-avatar" style="width: 64px; height: 64px; font-size: 1.4rem; margin: 0 auto 12px;">
                    ${initials}
                </div>
                <div style="font-size: 1.2rem; font-weight: 700; font-family: 'Poppins', sans-serif;">
                    ${customer.name}
                </div>
                <div class="text-muted" style="font-size: 0.82rem;">${customer.phone || 'No phone'}</div>
                <div style="margin-top: 12px; font-size: 1.5rem; font-weight: 700; font-family: 'Poppins', sans-serif; color: ${customer.balance > 0 ? 'var(--color-credit)' : 'var(--color-income)'};">
                    ${customer.balance > 0 ? Store.formatRupee(customer.balance) + ' pending' : '✅ Clear'}
                </div>
            </div>

            ${customer.balance > 0 ? `
                <button class="btn btn-success btn-block btn-lg mb-lg" onclick="Khata.recordPayment('${customer.id}')">
                    💳 Payment Received
                </button>
            ` : ''}

            <button class="btn btn-primary btn-block mb-lg" onclick="App.navigateAndSetCustomer('${customer.id}', '${customer.name}')">
                📝 Add New Credit
            </button>

            <div class="section-header">
                <div class="section-title">Account History</div>
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

    function recordPayment(customerId) {
        const customer = Store.getCustomerById(customerId);
        if (!customer) return;

        App.closeModal();

        const modalHtml = `
            <div class="modal-handle"></div>
            <div class="modal-header">
                <div class="modal-title">💳 Payment Received</div>
                <button class="modal-close" onclick="App.closeModal()">✕</button>
            </div>

            <div style="text-align: center; margin-bottom: 16px;">
                <div class="text-muted" style="font-size: 0.82rem;">Receiving payment from</div>
                <div style="font-size: 1.1rem; font-weight: 700; margin-top: 4px;">${customer.name}</div>
                <div style="color: var(--color-credit); font-size: 0.85rem; margin-top: 4px;">
                    Pending: ${Store.formatRupee(customer.balance)}
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Enter amount received</label>
                <input type="number" id="payment-amount" class="form-input form-input-amount" 
                    placeholder="0" max="${customer.balance}" autofocus>
            </div>

            <div style="display: flex; gap: 8px; margin-bottom: 16px;">
                <button class="btn btn-outline" style="flex:1" onclick="document.getElementById('payment-amount').value = ${Math.round(customer.balance / 2)}">
                    Half (${Store.formatRupee(Math.round(customer.balance / 2))})
                </button>
                <button class="btn btn-outline" style="flex:1" onclick="document.getElementById('payment-amount').value = ${customer.balance}">
                    Full (${Store.formatRupee(customer.balance)})
                </button>
            </div>

            <button class="btn btn-success btn-block btn-lg" onclick="Khata.confirmPayment('${customer.id}')">
                ✅ Confirm Payment
            </button>
        `;

        setTimeout(() => App.showModal(modalHtml), 350);
    }

    function confirmPayment(customerId) {
        const amountInput = document.getElementById('payment-amount');
        const amount = Number(amountInput.value);

        if (!amount || amount <= 0) {
            App.showToast('Enter valid amount', 'error');
            return;
        }

        const customer = Store.getCustomerById(customerId);
        if (amount > customer.balance) {
            App.showToast('Amount exceeds pending dues', 'error');
            return;
        }

        Store.addTransaction({
            type: 'payment',
            amount: amount,
            description: `Payment received from ${customer.name}`,
            customerId: customer.id,
            customerName: customer.name,
            category: 'Payment'
        });

        App.closeModal();
        App.showToast(`${Store.formatRupee(amount)} payment received from ${customer.name}! ✅`, 'success');
        render();
        Dashboard.render();
    }

    return { render, onSearch, showWithBalance, showAll, showCustomerDetail, recordPayment, confirmPayment };
})();
