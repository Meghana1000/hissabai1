/* ============================================
   HisaabAI Add Transaction Page (Redesigned)
   Optimized for speed — record in seconds
   ============================================ */

const Transactions = (() => {
    let currentType = 'sale';
    let presetCustomerId = null;
    let presetCustomerName = '';
    let showDetails = false; // toggle for optional detail fields

    function setType(type) {
        currentType = type;
    }

    function setCustomer(id, name) {
        presetCustomerId = id;
        presetCustomerName = name;
        currentType = 'credit';
    }

    function render() {
        const container = document.getElementById('page-add');
        const customers = Store.getCustomers();
        const settings = Store.getSettings();
        const today = new Date().toISOString().split('T')[0];
        const categories = Store.getCategories(settings.storeType);
        const creditEnabled = settings.creditFacility !== false;

        const typeConfig = {
            sale:     { emoji: '💵', label: 'Sales',    color: 'var(--color-income)',  btnClass: 'btn-success', amountLabel: 'Sales Amount' },
            purchase: { emoji: '🛒', label: 'Purchase', color: 'var(--color-credit)',  btnClass: 'btn-primary', amountLabel: 'Purchase Amount' },
            expense:  { emoji: '🧾', label: 'Expense',  color: 'var(--color-expense)', btnClass: 'btn-danger',  amountLabel: 'Expense Amount' },
            credit:   { emoji: '📝', label: 'Credit',   color: 'var(--color-credit)',  btnClass: 'btn-primary', amountLabel: 'Credit Amount' }
        };
        const info = typeConfig[currentType] || typeConfig.sale;
        const catList = categories[currentType] || categories.sale || [];

        container.innerHTML = `
            <!-- Type Toggle -->
            <div class="toggle-tabs" style="flex-wrap: wrap; gap: 6px;">
                <button class="toggle-tab ${currentType === 'sale' ? 'active' : ''}"
                    onclick="Transactions.switchType('sale')">💵 Sales</button>
                <button class="toggle-tab ${currentType === 'purchase' ? 'active' : ''}"
                    onclick="Transactions.switchType('purchase')">🛒 Purchase</button>
                <button class="toggle-tab ${currentType === 'expense' ? 'active' : ''}"
                    onclick="Transactions.switchType('expense')">🧾 Expense</button>
                ${creditEnabled ? `
                <button class="toggle-tab ${currentType === 'credit' ? 'active' : ''}"
                    onclick="Transactions.switchType('credit')">📝 Credit</button>
                ` : ''}
            </div>

            <!-- Date (TOP — most important context) -->
            <div class="form-group">
                <label class="form-label">📅 Date</label>
                <input type="date" id="txn-date" class="form-input" value="${today}">
            </div>

            <!-- Amount (MAIN field — autofocus for speed) -->
            <div class="form-group">
                <label class="form-label">${info.amountLabel} (₹)</label>
                <div style="position: relative;">
                    <input type="number" id="txn-amount" class="form-input form-input-amount"
                        placeholder="0"
                        style="color: ${info.color};"
                        inputmode="numeric"
                        autofocus>
                </div>
            </div>

            <!-- Payment Mode (Cash / UPI / Credit) -->
            <div class="form-group">
                <label class="form-label">💳 Payment Mode</label>
                <div class="payment-mode-chips" id="payment-mode-chips">
                    <button class="chip-btn active" data-mode="cash" onclick="Transactions.selectPaymentMode('cash')">
                        💵 Cash
                    </button>
                    <button class="chip-btn" data-mode="upi" onclick="Transactions.selectPaymentMode('upi')">
                        📱 UPI
                    </button>
                    ${currentType === 'purchase' ? `
                    <button class="chip-btn" data-mode="pending" onclick="Transactions.selectPaymentMode('pending')">
                        ⏳ Not Paid Yet
                    </button>
                    ` : ''}
                    ${currentType === 'credit' || (currentType === 'sale' && creditEnabled) ? `
                    <button class="chip-btn" data-mode="credit" onclick="Transactions.selectPaymentMode('credit')">
                        📝 On Credit
                    </button>
                    ` : ''}
                </div>
            </div>

            <!-- Category Dropdown (populated per store type) -->
            <div class="form-group">
                <label class="form-label">📁 Category</label>
                <select id="txn-category" class="form-input">
                    ${catList.map((cat, i) =>
                        `<option value="${cat}" ${i === 0 ? 'selected' : ''}>${cat}</option>`
                    ).join('')}
                </select>
            </div>

            <!-- Customer (for Credit type) -->
            ${currentType === 'credit' && creditEnabled ? `
                <div class="form-group">
                    <label class="form-label">👤 Customer</label>
                    <select id="txn-customer" class="form-input">
                        <option value="">-- Select Customer --</option>
                        ${customers.map(c => `
                            <option value="${c.id}" ${c.id === presetCustomerId ? 'selected' : ''}>
                                ${c.name} ${c.balance > 0 ? '(Pending: ' + Store.formatRupee(c.balance) + ')' : ''}
                            </option>
                        `).join('')}
                    </select>
                    <button class="btn btn-outline mt-sm" style="font-size: 0.78rem;" onclick="Transactions.quickAddCustomer()">
                        + Add New Customer
                    </button>
                </div>
            ` : ''}

            <!-- Optional Details Toggle -->
            <div style="text-align: center; margin: 4px 0 8px;">
                <button class="btn btn-outline" style="font-size: 0.78rem; padding: 6px 16px;" 
                    onclick="Transactions.toggleDetails()" id="btn-toggle-details">
                    ${showDetails ? '▲ Hide Details' : '▼ Add More Details (optional)'}
                </button>
            </div>

            <!-- Optional Detail Fields (collapsed by default) -->
            <div id="txn-details-section" style="display: ${showDetails ? 'block' : 'none'};">
                <!-- Description / Notes -->
                <div class="form-group">
                    <label class="form-label">📝 Description / Notes</label>
                    <input type="text" id="txn-description" class="form-input"
                        placeholder="${currentType === 'sale' ? 'e.g. Rice 5kg, Dal 2kg' : currentType === 'purchase' ? 'e.g. Sugar 50kg from wholesaler' : currentType === 'expense' ? 'e.g. Electricity bill March' : 'e.g. Monthly ration'}">
                </div>

                <!-- Quantity (optional) -->
                <div class="form-group">
                    <label class="form-label">📦 Quantity (optional)</label>
                    <div style="display: flex; gap: 8px;">
                        <input type="number" id="txn-quantity" class="form-input" placeholder="e.g. 5" 
                            inputmode="decimal" style="flex: 1;">
                        <select id="txn-unit" class="form-input" style="flex: 1;">
                            <option value="">Unit</option>
                            <option value="pieces">Pieces</option>
                            <option value="packets">Packets</option>
                            <option value="kg">Kg</option>
                            <option value="grams">Grams</option>
                            <option value="litres">Litres</option>
                            <option value="ml">ml</option>
                            <option value="boxes">Boxes</option>
                            <option value="bags">Bags</option>
                            <option value="bottles">Bottles</option>
                            <option value="dozen">Dozen</option>
                            <option value="meters">Meters</option>
                        </select>
                    </div>
                </div>

                ${currentType === 'purchase' ? `
                <!-- Supplier Details (Purchase only) -->
                <div class="form-group">
                    <label class="form-label">🏭 Supplier Name (optional)</label>
                    <input type="text" id="txn-supplier" class="form-input" placeholder="e.g. Reliance Wholesale, Local Market">
                </div>
                ` : ''}

                ${currentType === 'expense' ? `
                <!-- Recurring Expense checkbox -->
                <div class="form-group" style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" id="txn-recurring" style="width: 20px; height: 20px; accent-color: var(--accent-primary);">
                    <label for="txn-recurring" class="form-label" style="margin: 0;">This is a monthly recurring expense</label>
                </div>
                ` : ''}
            </div>

            <!-- Submit Button -->
            <button class="btn ${info.btnClass} btn-block btn-lg"
                onclick="Transactions.save()" id="btn-save-txn"
                style="margin-top: 8px;">
                ${info.emoji} Save ${info.label}
            </button>

            <!-- Quick tip -->
            <div style="text-align: center; font-size: 0.72rem; color: var(--text-muted); margin-top: 8px; padding-bottom: 80px;">
                💡 Only amount is required. Add details later if needed.
            </div>
        `;

        presetCustomerId = null;
        presetCustomerName = '';
    }

    function switchType(type) {
        currentType = type;
        showDetails = false;
        render();
    }

    function selectPaymentMode(mode) {
        const chips = document.querySelectorAll('.chip-btn');
        chips.forEach(c => c.classList.remove('active'));
        const selected = document.querySelector(`.chip-btn[data-mode="${mode}"]`);
        if (selected) selected.classList.add('active');
    }

    function toggleDetails() {
        showDetails = !showDetails;
        const section = document.getElementById('txn-details-section');
        const btn = document.getElementById('btn-toggle-details');
        if (section) section.style.display = showDetails ? 'block' : 'none';
        if (btn) btn.textContent = showDetails ? '▲ Hide Details' : '▼ Add More Details (optional)';
    }

    function save() {
        const amount = Number(document.getElementById('txn-amount').value);
        const date = document.getElementById('txn-date').value;
        const category = document.getElementById('txn-category').value;

        // Get payment mode from active chip
        const activeChip = document.querySelector('.chip-btn.active');
        const paymentMode = activeChip ? activeChip.dataset.mode : 'cash';

        // Optional fields
        const descEl = document.getElementById('txn-description');
        const description = descEl ? descEl.value.trim() : '';
        const qtyEl = document.getElementById('txn-quantity');
        const unitEl = document.getElementById('txn-unit');
        const quantity = qtyEl ? Number(qtyEl.value) || null : null;
        const unit = unitEl ? unitEl.value : '';
        const supplierEl = document.getElementById('txn-supplier');
        const supplier = supplierEl ? supplierEl.value.trim() : '';
        const recurringEl = document.getElementById('txn-recurring');
        const recurring = recurringEl ? recurringEl.checked : false;

        if (!amount || amount <= 0) {
            App.showToast('Enter a valid amount!', 'error');
            return;
        }

        let customerId = null;
        let customerName = '';

        if (currentType === 'credit') {
            const customerSelect = document.getElementById('txn-customer');
            customerId = customerSelect ? customerSelect.value : null;
            if (!customerId) {
                App.showToast('Select a customer for credit!', 'error');
                return;
            }
            const customer = Store.getCustomerById(customerId);
            customerName = customer ? customer.name : '';
        }

        Store.addTransaction({
            type: currentType,
            amount,
            description,
            category,
            customerId,
            customerName,
            date,
            paymentMode,
            quantity,
            unit,
            supplier,
            recurring
        });

        const typeLabels = { sale: 'Sales', purchase: 'Purchase', expense: 'Expense', credit: 'Credit' };
        App.showToast(`${typeLabels[currentType]} of ${Store.formatRupee(amount)} saved! ✅`, 'success');

        const btn = document.getElementById('btn-save-txn');
        if (btn) {
            btn.textContent = '✅ Saved!';
            btn.style.pointerEvents = 'none';
            setTimeout(() => {
                showDetails = false;
                render();
                Dashboard.render();
            }, 800);
        }
    }

    function quickAddCustomer() {
        const modalHtml = `
            <div class="modal-handle"></div>
            <div class="modal-header">
                <div class="modal-title">👤 New Customer</div>
                <button class="modal-close" onclick="App.closeModal()">✕</button>
            </div>

            <div class="form-group">
                <label class="form-label">Name</label>
                <input type="text" id="quick-customer-name" class="form-input" placeholder="Customer Name" autofocus>
            </div>

            <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input type="tel" id="quick-customer-phone" class="form-input" placeholder="e.g. 9876543210" inputmode="numeric">
            </div>

            <button class="btn btn-primary btn-block btn-lg" onclick="Transactions.saveQuickCustomer()">
                ✅ Add Customer
            </button>
        `;
        App.showModal(modalHtml);
    }

    function saveQuickCustomer() {
        const name = document.getElementById('quick-customer-name').value.trim();
        const phone = document.getElementById('quick-customer-phone').value.trim();

        if (!name) {
            App.showToast('Enter customer name!', 'error');
            return;
        }

        const newCustomer = Store.addCustomer({ name, phone });
        presetCustomerId = newCustomer.id;
        presetCustomerName = newCustomer.name;

        App.closeModal();
        App.showToast(`${name} added! ✅`, 'success');
        render();
    }

    return { render, switchType, save, setType, setCustomer, quickAddCustomer, saveQuickCustomer, selectPaymentMode, toggleDetails };
})();
