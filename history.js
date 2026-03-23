/* ============================================
   HisaabAI History Page
   Full transaction history with filters
   ============================================ */

const History = (() => {
    let filterType   = 'all';
    let filterPeriod = 'all';
    let searchQuery  = '';

    function render() {
        const container = document.getElementById('page-history');
        if (!container) return;

        const settings = Store.getSettings();
        const creditEnabled = settings.creditFacility !== false;

        // Get and filter transactions
        const allTxns = Store.getTransactionsByPeriod(filterPeriod);
        let filtered  = filterType === 'all' ? allTxns : allTxns.filter(t => t.type === filterType);
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
                (t.description || '').toLowerCase().includes(q) ||
                (t.category || '').toLowerCase().includes(q) ||
                (t.customerName || '').toLowerCase().includes(q)
            );
        }

        const summary  = Store.getSummary(filterPeriod);
        const periodLabels = { today: 'Today', week: 'This Week', month: 'This Month', all: 'All Time' };

        const typeFilters = [
            { key: 'all',      label: 'All',       emoji: '📋' },
            { key: 'sale',     label: 'Sales',     emoji: '💵' },
            { key: 'purchase', label: 'Purchases', emoji: '🛒' },
            { key: 'expense',  label: 'Expenses',  emoji: '🧾' },
            ...(creditEnabled ? [
                { key: 'credit',  label: 'Credit',   emoji: '📝' },
                { key: 'payment', label: 'Payments', emoji: '💳' }
            ] : [])
        ];

        container.innerHTML = `
            <!-- Period Selector -->
            <div class="report-period-selector" style="margin-bottom: 12px;">
                ${Object.entries(periodLabels).map(([key, label]) => `
                    <button class="period-btn ${filterPeriod === key ? 'active' : ''}"
                        onclick="History.setPeriod('${key}')">${label}</button>
                `).join('')}
            </div>

            <!-- Type Filter -->
            <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
                ${typeFilters.map(f => `
                    <button onclick="History.setType('${f.key}')"
                        style="padding: 5px 12px; border-radius: 20px; border: 1px solid ${filterType === f.key ? 'var(--accent-primary)' : 'var(--border-subtle)'}; background: ${filterType === f.key ? 'var(--accent-primary)' : 'transparent'}; color: var(--text-primary); font-size: 0.78rem; cursor: pointer;">
                        ${f.emoji} ${f.label}
                    </button>
                `).join('')}
            </div>

            <!-- Search -->
            <div class="search-bar" style="margin-bottom: 14px;">
                <span class="search-bar-icon">🔍</span>
                <input type="text" id="history-search"
                    placeholder="Search by product, description..."
                    value="${searchQuery}"
                    oninput="History.onSearch(this.value)">
            </div>

            <!-- Quick Summary for current filter -->
            <div class="glass-card mb-md animate-fade-in" style="padding: 10px 14px;">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; text-align: center;">
                    <div>
                        <div style="font-size: 0.7rem; color: var(--text-muted);">Sales</div>
                        <div style="font-size: 0.9rem; font-weight: 700; color: var(--color-income);">${Store.formatRupee(summary.sales)}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.7rem; color: var(--text-muted);">Purchases</div>
                        <div style="font-size: 0.9rem; font-weight: 700; color: var(--color-credit);">${Store.formatRupee(summary.purchases)}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.7rem; color: var(--text-muted);">Net Profit</div>
                        <div style="font-size: 0.9rem; font-weight: 700; color: ${summary.netProfit >= 0 ? 'var(--color-income)' : 'var(--color-expense)'};">${Store.formatRupee(summary.netProfit)}</div>
                    </div>
                </div>
            </div>

            <!-- Transaction List -->
            <div class="section-header">
                <div>
                    <div class="section-title">Transactions</div>
                    <div class="section-subtitle">${periodLabels[filterPeriod]} • ${filtered.length} entries</div>
                </div>
            </div>

            ${filtered.length > 0 ? `
                <div class="transaction-list stagger-in">
                    ${filtered.map(t => renderTransactionItem(t)).join('')}
                </div>
            ` : `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <div class="empty-state-title">No entries found</div>
                    <div class="empty-state-text">
                        ${searchQuery ? 'Try a different search term' : 'No entries match your filter'}
                    </div>
                </div>
            `}
        `;
    }

    function renderTransactionItem(txn) {
        const icons  = { sale: '💵', purchase: '🛒', expense: '🧾', credit: '📝', payment: '💳' };
        const labels = { sale: 'Sales', purchase: 'Purchase', expense: 'Expense', credit: 'Credit', payment: 'Payment' };
        const amountClass = (txn.type === 'sale' || txn.type === 'payment') ? 'income' : txn.type === 'expense' ? 'expense' : 'credit';
        const prefix = (txn.type === 'sale' || txn.type === 'payment') ? '+' : '-';

        return `
            <div class="transaction-item" onclick="App.showTransactionDetail('${txn.id}')">
                <div class="transaction-icon ${txn.type}">${icons[txn.type] || '📋'}</div>
                <div class="transaction-details">
                    <div class="transaction-title">${txn.description || labels[txn.type]}</div>
                    <div class="transaction-meta">
                        <span style="padding: 1px 6px; border-radius: 10px; background: rgba(255,255,255,0.07); font-size: 0.7rem;">${labels[txn.type]}</span>
                        • ${Store.formatDate(txn.date)}
                        ${txn.customerName ? ' • ' + txn.customerName : ''}
                    </div>
                </div>
                <div class="transaction-amount ${amountClass}">${prefix}${Store.formatRupee(txn.amount)}</div>
            </div>
        `;
    }

    function setType(type) {
        filterType = type;
        render();
    }

    function setPeriod(period) {
        filterPeriod = period;
        render();
    }

    function onSearch(query) {
        searchQuery = query;
        render();
    }

    return { render, setType, setPeriod, onSearch };
})();
