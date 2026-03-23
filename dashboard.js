/* ============================================
   HisaabAI Dashboard Page
   ============================================ */

const Dashboard = (() => {
    function render() {
        const container = document.getElementById('page-dashboard');
        const greeting = Store.getGreeting();
        const summary = Store.getSummary('today');
        const settings = Store.getSettings();
        // Show only the single latest transaction
        const latestTxn = Store.getTransactions().slice(0, 1);
        const totalReceivable = Store.getTotalReceivable();

        const todayFormatted = new Date().toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });

        container.innerHTML = `
            <!-- Greeting Banner -->
            <div class="greeting-banner animate-fade-in">
                <div class="greeting-text">${greeting.text}</div>
                <div class="greeting-date">${todayFormatted} • ${settings.storeName}</div>
            </div>

            <!-- Summary Cards — Accounting Accurate -->
            <div class="summary-grid stagger-in">
                <div class="summary-card card-sales">
                    <div class="summary-card-label">Sales Revenue</div>
                    <div class="summary-card-value income">${Store.formatRupee(summary.sales)}</div>
                    <div class="summary-card-icon">💰</div>
                </div>
                <div class="summary-card card-expense">
                    <div class="summary-card-label">Purchases (Stock)</div>
                    <div class="summary-card-value" style="color: var(--color-credit);">${Store.formatRupee(summary.purchases)}</div>
                    <div class="summary-card-icon">🛒</div>
                </div>
                <div class="summary-card card-profit">
                    <div class="summary-card-label">Gross Profit</div>
                    <div class="summary-card-value ${summary.grossProfit >= 0 ? 'profit' : 'expense'}">${Store.formatRupee(summary.grossProfit)}</div>
                    <div class="summary-card-icon">📊</div>
                </div>
                <div class="summary-card" style="border-top: 3px solid var(--color-income);">
                    <div class="summary-card-label">Net Profit</div>
                    <div class="summary-card-value ${summary.netProfit >= 0 ? 'income' : 'expense'}">${Store.formatRupee(summary.netProfit)}</div>
                    <div class="summary-card-icon">📈</div>
                </div>
            </div>

            <!-- What These Mean (simple explanation) -->
            <div class="glass-card mb-md animate-fade-in" style="padding: 12px 16px; font-size: 0.78rem;">
                <div style="font-weight: 600; margin-bottom: 6px; color: var(--text-primary);">📖 What do these numbers mean?</div>
                <div style="color: var(--text-muted); line-height: 1.6;">
                    <strong style="color:var(--color-income)">Gross Profit</strong> = Sales - Stock you bought (your raw earnings)<br>
                    <strong style="color:var(--color-income)">Net Profit</strong> = Gross Profit - Running costs (rent, electricity, wages)
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="section-header">
                <div>
                    <div class="section-title">Quick Actions</div>
                    <div class="section-subtitle">Add a new entry</div>
                </div>
            </div>
            <div class="quick-actions stagger-in">
                <button class="quick-action-btn" onclick="App.navigateAndSetType('sale')">
                    <div class="quick-action-icon sale">💵</div>
                    <div class="quick-action-label">Sales</div>
                </button>
                <button class="quick-action-btn" onclick="App.navigateAndSetType('purchase')">
                    <div class="quick-action-icon" style="background: rgba(100,120,255,0.15);">🛒</div>
                    <div class="quick-action-label">Purchase</div>
                </button>
                <button class="quick-action-btn" onclick="App.navigateAndSetType('expense')">
                    <div class="quick-action-icon expense">🧾</div>
                    <div class="quick-action-label">Expense</div>
                </button>
                ${settings.creditFacility !== false ? `
                <button class="quick-action-btn" onclick="App.navigateAndSetType('credit')">
                    <div class="quick-action-icon credit">📝</div>
                    <div class="quick-action-label">Credit</div>
                </button>
                ` : ''}
            </div>

            <!-- Latest Transaction -->
            <div class="section-header">
                <div>
                    <div class="section-title">Latest Entry</div>
                    <div class="section-subtitle">Most recent transaction</div>
                </div>
                <a href="#history" class="section-link" onclick="App.navigate('history')">View Full History →</a>
            </div>

            ${latestTxn.length > 0 ? `
                <div class="transaction-list stagger-in">
                    ${latestTxn.map(txn => renderTransactionItem(txn)).join('')}
                </div>
            ` : `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <div class="empty-state-title">No entries yet</div>
                    <div class="empty-state-text">Tap the + button to add your first entry</div>
                </div>
            `}

            <!-- Today's Expense Breakdown -->
            ${summary.expenses > 0 ? `
            <div class="glass-card mt-md animate-fade-in">
                <div class="stat-row">
                    <span class="stat-label">Running Expenses Today</span>
                    <span class="stat-value expense">${Store.formatRupee(summary.expenses)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Gross Margin</span>
                    <span class="stat-value ${summary.grossMargin >= 0 ? 'income' : 'expense'}">${Math.round(summary.grossMargin)}%</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Net Margin</span>
                    <span class="stat-value ${summary.netMargin >= 0 ? 'income' : 'expense'}">${Math.round(summary.netMargin)}%</span>
                </div>
            </div>
            ` : ''}
        `;
    }

    function renderTransactionItem(txn) {
        const icons  = { sale: '💵', purchase: '🛒', expense: '🧾', credit: '📝', payment: '💳' };
        const labels = { sale: 'Sales', purchase: 'Purchase', expense: 'Expense', credit: 'Credit', payment: 'Payment' };
        const amountClass = txn.type === 'sale' || txn.type === 'payment' ? 'income' : txn.type === 'expense' ? 'expense' : 'credit';
        const prefix = (txn.type === 'sale' || txn.type === 'payment') ? '+' : '-';

        return `
            <div class="transaction-item" onclick="App.showTransactionDetail('${txn.id}')">
                <div class="transaction-icon ${txn.type}">${icons[txn.type] || '📋'}</div>
                <div class="transaction-details">
                    <div class="transaction-title">${txn.description || labels[txn.type]}</div>
                    <div class="transaction-meta">${labels[txn.type]} • ${Store.formatDate(txn.date)}${txn.customerName ? ' • ' + txn.customerName : ''}</div>
                </div>
                <div class="transaction-amount ${amountClass}">${prefix}${Store.formatRupee(txn.amount)}</div>
            </div>
        `;
    }

    return { render, renderTransactionItem };
})();
