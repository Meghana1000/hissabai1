/* ============================================
   HisaabAI Reports Page — Accounting Accurate
   Per Indian GAAP / AS Standards
   ============================================ */

const Reports = (() => {
    let currentPeriod = 'month';

    function render() {
        const container = document.getElementById('page-reports');
        const summary = Store.getSummary(currentPeriod);
        const expenseCategories = Store.getCategorySummary(currentPeriod);
        const purchaseCategories = Store.getPurchaseCategorySummary ? Store.getPurchaseCategorySummary(currentPeriod) : [];
        const settings = Store.getSettings();
        const creditEnabled = settings.creditFacility !== false;
        const topCustomers = creditEnabled ? Store.getCustomersWithBalance().slice(0, 5) : [];

        // Latest 1 transaction only
        const latestTxn = Store.getTransactionsByPeriod(currentPeriod).slice(0, 1);

        const periodLabels = {
            today: 'Today',
            week: 'This Week',
            month: 'This Month',
            all: 'All Time'
        };

        container.innerHTML = `
            <!-- Period Selector -->
            <div class="report-period-selector">
                ${Object.entries(periodLabels).map(([key, label]) => `
                    <button class="period-btn ${currentPeriod === key ? 'active' : ''}"
                        onclick="Reports.setPeriod('${key}')">
                        ${label}
                    </button>
                `).join('')}
            </div>

            <!-- Profit & Loss Statement (Accounting Accurate) -->
            <div class="glass-card mb-lg animate-fade-in">
                <div class="section-title mb-sm">📊 Profit & Loss Statement</div>
                <div style="font-size: 0.73rem; color: var(--text-muted); margin-bottom: 14px;">
                    ${periodLabels[currentPeriod]} • As per Indian Accounting Standards
                </div>

                <!-- Revenue -->
                <div class="stat-row">
                    <span class="stat-label">💰 Sales Revenue</span>
                    <span class="stat-value income">${Store.formatRupee(summary.sales)}</span>
                </div>
                <div style="font-size: 0.72rem; color: var(--text-muted); padding: 2px 0 8px 12px;">
                    Total cash received from selling goods/services
                </div>

                <!-- Purchases / COGS -->
                <div class="stat-row" style="border-top: 1px dashed var(--border-subtle); padding-top: 10px;">
                    <span class="stat-label">🛒 (−) Cost of Goods Sold</span>
                    <span class="stat-value" style="color: var(--color-credit);">${Store.formatRupee(summary.purchases)}</span>
                </div>
                <div style="font-size: 0.72rem; color: var(--text-muted); padding: 2px 0 8px 12px;">
                    Money spent buying stock / inventory to sell
                </div>

                <!-- Gross Profit -->
                <div class="stat-row" style="background: rgba(255,255,255,0.04); border-radius: 8px; padding: 10px 8px; margin-bottom: 12px;">
                    <span class="stat-label" style="font-weight: 700;">= GROSS PROFIT</span>
                    <span class="stat-value ${summary.grossProfit >= 0 ? 'income' : 'expense'}" style="font-size: 1.05rem; font-weight: 700;">
                        ${Store.formatRupee(summary.grossProfit)}
                        <span style="font-size: 0.72rem; font-weight: 400;"> (${Math.round(summary.grossMargin)}% margin)</span>
                    </span>
                </div>
                <div style="font-size: 0.72rem; color: var(--text-muted); padding: 0 0 10px 12px;">
                    What you earned after buying stock — your raw profit
                </div>

                <!-- Operating Expenses -->
                <div class="stat-row" style="border-top: 1px dashed var(--border-subtle); padding-top: 10px;">
                    <span class="stat-label">🧾 (−) Operating Expenses</span>
                    <span class="stat-value expense">${Store.formatRupee(summary.expenses)}</span>
                </div>
                <div style="font-size: 0.72rem; color: var(--text-muted); padding: 2px 0 8px 12px;">
                    Recurring running costs — rent, electricity, wages
                </div>

                <!-- Net Profit -->
                <div class="stat-row" style="background: rgba(255,255,255,0.06); border-radius: 8px; padding: 10px 8px; margin-top: 4px;">
                    <span class="stat-label" style="font-weight: 700;">= NET PROFIT</span>
                    <span class="stat-value ${summary.netProfit >= 0 ? 'income' : 'expense'}" style="font-size: 1.1rem; font-weight: 700;">
                        ${Store.formatRupee(summary.netProfit)}
                        <span style="font-size: 0.72rem; font-weight: 400;"> (${Math.round(summary.netMargin)}% margin)</span>
                    </span>
                </div>
                <div style="font-size: 0.72rem; color: var(--text-muted); padding: 4px 0 2px 12px;">
                    Your actual take-home profit after ALL costs
                </div>
                ${summary.netProfit < 0 ? `
                <div style="margin-top: 10px; padding: 8px 10px; background: rgba(255,107,107,0.1); border-radius: 8px; font-size: 0.78rem; color: var(--color-expense);">
                    ⚠️ You are making a loss this period. Either increase sales or reduce expenses/purchases.
                </div>
                ` : `
                <div style="margin-top: 10px; padding: 8px 10px; background: rgba(0,230,118,0.08); border-radius: 8px; font-size: 0.78rem; color: var(--color-income);">
                    ✅ Your business is profitable this period. Net margin: ${Math.round(summary.netMargin)}%
                </div>
                `}
            </div>

            <!-- Key Ratios -->
            <div class="glass-card mb-lg animate-fade-in">
                <div class="section-title mb-md">📐 Key Business Ratios</div>
                <div class="stat-row">
                    <span class="stat-label">Gross Profit Margin</span>
                    <span class="stat-value ${summary.grossMargin > 15 ? 'income' : 'expense'}">${Math.round(summary.grossMargin)}%</span>
                </div>
                <div style="font-size: 0.71rem; color: var(--text-muted); margin-bottom: 8px; padding-left: 2px;">
                    For every ₹100 sold, gross profit = ₹${Math.round(summary.grossMargin)}
                </div>
                <div class="stat-row">
                    <span class="stat-label">Net Profit Margin</span>
                    <span class="stat-value ${summary.netMargin > 10 ? 'income' : 'expense'}">${Math.round(summary.netMargin)}%</span>
                </div>
                <div style="font-size: 0.71rem; color: var(--text-muted); margin-bottom: 8px; padding-left: 2px;">
                    For every ₹100 sold, you keep ₹${Math.round(summary.netMargin)}
                </div>
                <div class="stat-row">
                    <span class="stat-label">Expense Ratio</span>
                    <span class="stat-value ${summary.expenseRatio < 30 ? 'income' : 'expense'}">${Math.round(summary.expenseRatio)}%</span>
                </div>
                <div style="font-size: 0.71rem; color: var(--text-muted); padding-left: 2px;">
                    Running expenses as % of sales (under 30% is healthy)
                </div>

                ${summary.sales > 0 ? `
                <div class="divider"></div>
                <div class="stat-row">
                    <span class="stat-label">Total Transactions</span>
                    <span class="stat-value">${summary.totalTransactions}</span>
                </div>
                ` : ''}
            </div>

            <!-- Credit Summary (only if enabled) -->
            ${creditEnabled ? `
            <div class="glass-card mb-lg animate-fade-in">
                <div class="section-title mb-md">📒 Credit Summary</div>
                <div class="stat-row">
                    <span class="stat-label">New Credit Given</span>
                    <span class="stat-value credit">${Store.formatRupee(summary.credits)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Payments Received</span>
                    <span class="stat-value income">${Store.formatRupee(summary.payments)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label" style="font-weight:700;">Net Pending Dues</span>
                    <span class="stat-value credit" style="font-size:1rem;">${Store.formatRupee(Store.getTotalReceivable())}</span>
                </div>
            </div>
            ` : ''}

            <!-- Purchase Breakdown -->
            ${purchaseCategories.length > 0 ? `
                <div class="glass-card mb-lg animate-fade-in">
                    <div class="section-title mb-md">🛒 Purchase Breakdown (COGS)</div>
                    <div class="bar-chart">
                        ${purchaseCategories.map(cat => {
                            const maxAmount = purchaseCategories[0].amount;
                            const pct = maxAmount > 0 ? (cat.amount / maxAmount) * 100 : 0;
                            return `
                                <div class="bar-item">
                                    <div class="bar-label">${cat.name}</div>
                                    <div class="bar-track">
                                        <div class="bar-fill" style="width: ${pct}%; background: var(--color-credit);"></div>
                                    </div>
                                    <div class="bar-value">${Store.formatRupee(cat.amount)}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- Expense Breakdown -->
            ${expenseCategories.length > 0 ? `
                <div class="glass-card mb-lg animate-fade-in">
                    <div class="section-title mb-md">🧾 Expense Breakdown</div>
                    <div class="bar-chart">
                        ${expenseCategories.map(cat => {
                            const maxAmount = expenseCategories[0].amount;
                            const pct = maxAmount > 0 ? (cat.amount / maxAmount) * 100 : 0;
                            return `
                                <div class="bar-item">
                                    <div class="bar-label">${cat.name}</div>
                                    <div class="bar-track">
                                        <div class="bar-fill expense" style="width: ${pct}%"></div>
                                    </div>
                                    <div class="bar-value">${Store.formatRupee(cat.amount)}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- Top Credit Customers (only if credit enabled) -->
            ${creditEnabled && topCustomers.length > 0 ? `
                <div class="glass-card mb-lg animate-fade-in">
                    <div class="section-title mb-md">👥 Top Credit Customers</div>
                    <div class="bar-chart">
                        ${topCustomers.map(cust => {
                            const maxBal = topCustomers[0].balance;
                            const pct = maxBal > 0 ? (cust.balance / maxBal) * 100 : 0;
                            return `
                                <div class="bar-item" style="cursor: pointer;" onclick="Khata.showCustomerDetail('${cust.id}')">
                                    <div class="bar-label">${cust.name}</div>
                                    <div class="bar-track">
                                        <div class="bar-fill credit" style="width: ${pct}%"></div>
                                    </div>
                                    <div class="bar-value">${Store.formatRupee(cust.balance)}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- Latest Transaction -->
            <div class="section-header">
                <div>
                    <div class="section-title">Latest Entry</div>
                    <div class="section-subtitle">${periodLabels[currentPeriod]}</div>
                </div>
                <a class="section-link" onclick="App.navigate('history')">View Full History →</a>
            </div>

            ${latestTxn.length > 0 ? `
                <div class="transaction-list stagger-in">
                    ${latestTxn.map(t => Dashboard.renderTransactionItem(t)).join('')}
                </div>
            ` : `
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <div class="empty-state-title">No entries in this period</div>
                    <div class="empty-state-text">Select another period or add a new entry</div>
                </div>
            `}
        `;
    }

    function setPeriod(period) {
        currentPeriod = period;
        render();
    }

    return { render, setPeriod };
})();
