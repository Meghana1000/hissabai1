/* ============================================
   HisaabAI AI Engine — Indian Accounting Accurate
   All analysis per Indian GAAP / AS Standards
   Explained in simple language for uneducated users
   ============================================ */

const AIEngine = (() => {

    // ─────────────────────────────────────────────
    // CORE CALCULATIONS (Indian GAAP Standards)
    // ─────────────────────────────────────────────
    function getAccountingData() {
        const settings   = Store.getSettings();
        const summaryM   = Store.getSummary('month');
        const summaryAll = Store.getSummary('all');
        const txnsAll    = Store.getTransactions();
        const txnsMonth  = Store.getTransactionsByPeriod('month');

        // Core P&L figures per Indian Accounting (AS-1 / GAAP)
        // Gross Profit = Net Sales - Cost of Goods Sold (Purchases)
        // Net Profit   = Gross Profit - Operating Expenses
        return {
            settings,
            // This month
            sales:        summaryM.sales,
            purchases:    summaryM.purchases,
            expenses:     summaryM.expenses,
            grossProfit:  summaryM.grossProfit,
            netProfit:    summaryM.netProfit,
            grossMargin:  summaryM.grossMargin,
            netMargin:    summaryM.netMargin,
            expenseRatio: summaryM.expenseRatio,
            credits:      summaryM.credits,
            payments:     summaryM.payments,
            // All time
            totalSales:   summaryAll.sales,
            totalProfit:  summaryAll.netProfit,
            // Extras
            txnsMonth,
            txnsAll,
            customers:    Store.getCustomers(),
            totalReceivable: Store.getTotalReceivable()
        };
    }

    // ─────────────────────────────────────────────
    // MODULE 1: PROFIT & LOSS ANALYSIS
    // ─────────────────────────────────────────────
    function analyzeProfitLoss() {
        const d = getAccountingData();
        const s = Store.formatRupee;
        if (d.sales === 0) return noDataMessage('Profit & Loss');

        const assessment = d.netProfit > 0
            ? `✅ Your business made a <strong>net profit of ${s(d.netProfit)}</strong> this month — that's ${Math.round(d.netMargin)}% of your sales.`
            : `⚠️ Your business is making a <strong>loss of ${s(Math.abs(d.netProfit))}</strong> this month.`;

        return `
            <div class="ai-result-card">
                <h3>📊 Profit & Loss — This Month</h3>
                <p style="font-size:0.8rem;color:var(--text-muted);">As per Indian GAAP / Accounting Standards</p>

                <div class="pl-statement">
                    <div class="pl-row">
                        <span>💰 Sales Revenue</span>
                        <span class="income">${s(d.sales)}</span>
                    </div>
                    <div class="pl-row indent">
                        <span>(−) Cost of Goods Sold (Purchases)</span>
                        <span style="color:var(--color-credit);">${s(d.purchases)}</span>
                    </div>
                    <div class="pl-row total">
                        <span>= GROSS PROFIT</span>
                        <span class="${d.grossProfit >= 0 ? 'income' : 'expense'}">${s(d.grossProfit)} (${Math.round(d.grossMargin)}%)</span>
                    </div>
                    <div class="pl-row indent">
                        <span>(−) Operating Expenses</span>
                        <span class="expense">${s(d.expenses)}</span>
                    </div>
                    <div class="pl-row total" style="font-size:1rem;">
                        <span>= NET PROFIT</span>
                        <span class="${d.netProfit >= 0 ? 'income' : 'expense'}">${s(d.netProfit)} (${Math.round(d.netMargin)}%)</span>
                    </div>
                </div>

                <div class="ai-insight-box mt-md">
                    <p>${assessment}</p>
                    <p style="margin-top:8px;font-size:0.82rem;">
                        <strong>In simple words:</strong> You sold goods worth ${s(d.sales)}. Out of this, you spent ${s(d.purchases)} buying stock, so you earned ${s(d.grossProfit)} (your raw profit). After paying ${s(d.expenses)} for running costs like rent & electricity, your actual take-home is <strong>${s(d.netProfit)}</strong>.
                    </p>
                    ${d.netProfit < 0 ? `<p style="margin-top:8px;color:var(--color-expense);font-size:0.82rem;">⚠️ To fix this: Either sell more, buy stock at lower price, or reduce your monthly expenses.</p>` : ''}
                </div>
            </div>`;
    }

    // ─────────────────────────────────────────────
    // MODULE 2: GST GUIDE (Indian Tax Law)
    // ─────────────────────────────────────────────
    function analyzeGST() {
        const d = getAccountingData();
        const s = Store.formatRupee;
        const settings = d.settings;

        // Indian GST thresholds (as per GST Act):
        // Mandatory registration: turnover > ₹40 lakhs (goods), ₹20 lakhs (services), ₹10 lakhs (NE states)
        // Composition scheme: turnover up to ₹1.5 crore
        const annual = d.totalSales;
        const mandatoryThreshold  = 4000000;   // ₹40 lakhs
        const compositionScheme   = 15000000;  // ₹1.5 crore

        const mustRegister  = annual >= mandatoryThreshold;
        const canComposition = annual <= compositionScheme && annual > 0;

        return `
            <div class="ai-result-card">
                <h3>🧾 GST Guide — Indian Tax Law</h3>
                <p style="font-size:0.8rem;color:var(--text-muted);">As per CGST / SGST Act, 2017</p>

                <div class="ai-metric-row">
                    <div>
                        <div class="metric-label">GST Status</div>
                        <div class="metric-value" style="color:${settings.gstRegistered ? 'var(--color-income)' : 'var(--color-expense)'};">
                            ${settings.gstRegistered ? '✅ Registered' : '❌ Not Registered'}
                        </div>
                    </div>
                    <div>
                        <div class="metric-label">Estimated Annual Sales</div>
                        <div class="metric-value">${s(annual)}</div>
                    </div>
                </div>

                <div class="ai-insight-box mt-md">
                    ${settings.gstRegistered ? `
                        <p>✅ You are GST registered. Key rules for you:</p>
                        <ul style="font-size:0.82rem;margin-top:8px;padding-left:16px;line-height:1.8;">
                            <li>File <strong>GSTR-3B</strong> every month (before 20th of next month)</li>
                            <li>File <strong>GSTR-1</strong> every month or quarter (outward supply details)</li>
                            <li>You can claim <strong>Input Tax Credit (ITC)</strong> on purchases — this reduces your tax bill</li>
                            <li>Keep all purchase bills safe for ITC claims</li>
                            <li>For kirana: Most food items are at <strong>0% GST</strong>, packaged goods may be 5%/12%/18%</li>
                        </ul>
                    ` : mustRegister ? `
                        <p>⚠️ <strong>Action Required:</strong> Your estimated sales (${s(annual)}) have crossed ₹40 lakhs. <strong>GST registration is mandatory.</strong></p>
                        <ul style="font-size:0.82rem;margin-top:8px;padding-left:16px;line-height:1.8;">
                            <li>Register on the <strong>GST portal: gst.gov.in</strong> immediately</li>
                            <li>Required documents: PAN, Aadhaar, Bank statement, Shop address proof</li>
                            <li>Penalty for not registering: 10% of tax due or ₹10,000 (whichever is higher)</li>
                        </ul>
                    ` : `
                        <p>ℹ️ Your annual sales (${s(annual)}) are ${annual > 0 ? 'below the ₹40 lakh mandatory limit' : 'not yet recorded'}. GST registration is <strong>optional</strong> right now.</p>
                        ${canComposition ? `
                        <p style="margin-top:8px;"><strong>💡 Composition Scheme Option:</strong> Since your sales are under ₹1.5 crore, you can opt for the Composition Scheme — pay a flat 1% tax on total sales (instead of full GST). Simpler compliance, no ITC.</p>
                        ` : ''}
                        <p style="margin-top:8px;">Voluntary GST registration is useful if your suppliers are GST-registered, as you can claim Input Tax Credit on purchases.</p>
                    `}
                </div>
            </div>`;
    }

    // ─────────────────────────────────────────────
    // MODULE 3: GROWTH METER
    // ─────────────────────────────────────────────
    function analyzeGrowth() {
        const d = getAccountingData();
        const s = Store.formatRupee;
        const txns = d.txnsAll;
        if (txns.length < 5) return noDataMessage('Growth Meter');

        // Month-on-month comparison
        const now  = new Date();
        const m    = now.getMonth();
        const y    = now.getFullYear();
        const prevM = m === 0 ? 11 : m - 1;
        const prevY = m === 0 ? y - 1 : y;

        const thisMonthSales = txns.filter(t => {
            const dt = new Date(t.date);
            return t.type === 'sale' && dt.getMonth() === m && dt.getFullYear() === y;
        }).reduce((a, t) => a + t.amount, 0);

        const prevMonthSales = txns.filter(t => {
            const dt = new Date(t.date);
            return t.type === 'sale' && dt.getMonth() === prevM && dt.getFullYear() === prevY;
        }).reduce((a, t) => a + t.amount, 0);

        const thisMonthPurchases = txns.filter(t => {
            const dt = new Date(t.date);
            return t.type === 'purchase' && dt.getMonth() === m && dt.getFullYear() === y;
        }).reduce((a, t) => a + t.amount, 0);

        const prevMonthPurchases = txns.filter(t => {
            const dt = new Date(t.date);
            return t.type === 'purchase' && dt.getMonth() === prevM && dt.getFullYear() === prevY;
        }).reduce((a, t) => a + t.amount, 0);

        const salesGrowth   = prevMonthSales > 0 ? ((thisMonthSales - prevMonthSales) / prevMonthSales) * 100 : 0;
        const thisGrossP    = thisMonthSales - thisMonthPurchases;
        const prevGrossP    = prevMonthSales - prevMonthPurchases;
        const profitGrowth  = prevGrossP > 0 ? ((thisGrossP - prevGrossP) / prevGrossP) * 100 : 0;

        const growing = salesGrowth > 0;

        return `
            <div class="ai-result-card">
                <h3>📈 Business Growth Meter</h3>
                <p style="font-size:0.8rem;color:var(--text-muted);">Month-on-Month Comparison</p>

                <div class="ai-metric-row">
                    <div>
                        <div class="metric-label">Sales Growth</div>
                        <div class="metric-value ${growing ? 'income' : 'expense'}">
                            ${growing ? '↑' : '↓'} ${Math.abs(Math.round(salesGrowth))}%
                        </div>
                    </div>
                    <div>
                        <div class="metric-label">Gross Profit Growth</div>
                        <div class="metric-value ${profitGrowth >= 0 ? 'income' : 'expense'}">
                            ${profitGrowth >= 0 ? '↑' : '↓'} ${Math.abs(Math.round(profitGrowth))}%
                        </div>
                    </div>
                </div>

                <div class="ai-insight-box mt-md">
                    <p>${growing
                        ? `✅ Good news! Your sales went from ${s(prevMonthSales)} to ${s(thisMonthSales)} — a ${Math.round(salesGrowth)}% increase. Your business is growing!`
                        : prevMonthSales === 0
                        ? '📊 Not enough data from last month to compare. Keep recording your sales daily.'
                        : `⚠️ Your sales have dropped ${Math.abs(Math.round(salesGrowth))}% compared to last month. Time to take action.`
                    }</p>
                    <p style="margin-top:8px;font-size:0.82rem;">
                        ${d.grossMargin > 20
                            ? `Your gross margin is ${Math.round(d.grossMargin)}% — this means for every ₹100 sold, you keep ₹${Math.round(d.grossMargin)} before expenses. This is healthy!`
                            : `Your gross margin is only ${Math.round(d.grossMargin)}%. Try to negotiate better purchase prices to improve this.`
                        }
                    </p>
                </div>
            </div>`;
    }

    // ─────────────────────────────────────────────
    // MODULE 4: REVENUE FORECAST
    // ─────────────────────────────────────────────
    function analyzeForecast() {
        const d = getAccountingData();
        const s = Store.formatRupee;
        if (d.sales === 0) return noDataMessage('Revenue Forecast');

        const today        = new Date();
        const dayOfMonth   = today.getDate();
        const daysInMonth  = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const daysLeft     = daysInMonth - dayOfMonth;

        const dailyAvgSales    = dayOfMonth > 0 ? d.sales / dayOfMonth : 0;
        const dailyAvgPurchase = dayOfMonth > 0 ? d.purchases / dayOfMonth : 0;
        const dailyAvgExpense  = dayOfMonth > 0 ? d.expenses / dayOfMonth : 0;

        const projectedSales    = dailyAvgSales * daysInMonth;
        const projectedPurchases = dailyAvgPurchase * daysInMonth;
        const projectedExpenses = dailyAvgExpense * daysInMonth;
        const projectedGrossP   = projectedSales - projectedPurchases;
        const projectedNetP     = projectedGrossP - projectedExpenses;

        return `
            <div class="ai-result-card">
                <h3>🔮 Revenue Forecast</h3>
                <p style="font-size:0.8rem;color:var(--text-muted);">Based on this month so far (${dayOfMonth} days)</p>

                <div class="ai-metric-row">
                    <div>
                        <div class="metric-label">Daily Sales Average</div>
                        <div class="metric-value income">${s(Math.round(dailyAvgSales))}</div>
                    </div>
                    <div>
                        <div class="metric-label">Days Remaining</div>
                        <div class="metric-value">${daysLeft} days</div>
                    </div>
                </div>

                <div class="pl-statement mt-md">
                    <div class="pl-row"><span>📈 Projected Sales</span><span class="income">${s(Math.round(projectedSales))}</span></div>
                    <div class="pl-row indent"><span>(−) Projected Purchases</span><span style="color:var(--color-credit);">${s(Math.round(projectedPurchases))}</span></div>
                    <div class="pl-row total"><span>= Projected Gross Profit</span><span class="${projectedGrossP >= 0 ? 'income' : 'expense'}">${s(Math.round(projectedGrossP))}</span></div>
                    <div class="pl-row indent"><span>(−) Projected Expenses</span><span class="expense">${s(Math.round(projectedExpenses))}</span></div>
                    <div class="pl-row total"><span>= Projected Net Profit</span><span class="${projectedNetP >= 0 ? 'income' : 'expense'}">${s(Math.round(projectedNetP))}</span></div>
                </div>

                <div class="ai-insight-box mt-md">
                    <p style="font-size:0.82rem;">
                        At your current pace, you'll end this month with a <strong>${projectedNetP >= 0 ? 'profit' : 'loss'} of ${s(Math.round(Math.abs(projectedNetP)))}</strong>.
                        ${projectedNetP < 0 ? ' Try to sell more in the remaining days or reduce unnecessary purchases.' : ' Keep going at this pace!'}
                    </p>
                    <p style="margin-top:8px;font-size:0.82rem;">Note: This is an estimate. Actual results depend on festivals, seasons, and your sales efforts.</p>
                </div>
            </div>`;
    }

    // ─────────────────────────────────────────────
    // MODULE 5: PRODUCT MARGIN ANALYSIS
    // ─────────────────────────────────────────────
    function analyzeMargins() {
        const d = getAccountingData();
        const s = Store.formatRupee;
        if (d.sales === 0) return noDataMessage('Margin Analysis');

        const purchaseCats = Store.getPurchaseCategorySummary ? Store.getPurchaseCategorySummary('month') : [];

        return `
            <div class="ai-result-card">
                <h3>💹 Margin Analysis</h3>
                <p style="font-size:0.8rem;color:var(--text-muted);">How much you really earn per ₹100 sold</p>

                <div class="pl-statement">
                    <div class="pl-row"><span>Gross Profit Margin</span><span class="${d.grossMargin >= 20 ? 'income' : 'expense'}">${Math.round(d.grossMargin)}%</span></div>
                    <div class="pl-row indent"><span style="font-size:0.78rem;color:var(--text-muted);">= (Gross Profit ÷ Sales) × 100</span></div>
                    <div class="pl-row"><span>Net Profit Margin</span><span class="${d.netMargin >= 10 ? 'income' : 'expense'}">${Math.round(d.netMargin)}%</span></div>
                    <div class="pl-row indent"><span style="font-size:0.78rem;color:var(--text-muted);">= (Net Profit ÷ Sales) × 100</span></div>
                    <div class="pl-row"><span>Expense Ratio</span><span class="${d.expenseRatio <= 30 ? 'income' : 'expense'}">${Math.round(d.expenseRatio)}%</span></div>
                    <div class="pl-row indent"><span style="font-size:0.78rem;color:var(--text-muted);">= (Expenses ÷ Sales) × 100</span></div>
                </div>

                <div class="ai-insight-box mt-md">
                    <p style="font-size:0.82rem;">
                        <strong>What this means:</strong> For every ₹100 you sell —
                        you spend ₹${100 - Math.round(d.grossMargin)} buying stock,
                        which leaves ₹${Math.round(d.grossMargin)} gross profit.
                        After ₹${Math.round(d.expenseRatio)} in running costs,
                        you actually keep <strong>₹${Math.round(d.netMargin)}</strong>.
                    </p>
                    <p style="margin-top:8px;font-size:0.82rem;">
                        ${d.grossMargin < 15
                            ? '⚠️ Your gross margin is low. Try buying stock from cheaper suppliers or increase your selling price.'
                            : d.netMargin < 5
                            ? '⚠️ Net margin is low. Your running costs are too high relative to sales. Look for ways to cut monthly expenses.'
                            : '✅ Your margins look healthy! Keep monitoring them every month.'}
                    </p>
                </div>

                ${purchaseCats.length > 0 ? `
                <div style="margin-top:12px;">
                    <div style="font-size:0.82rem;font-weight:600;margin-bottom:8px;">Stock Purchase Breakdown:</div>
                    ${purchaseCats.slice(0,5).map(c => `
                        <div class="stat-row" style="font-size:0.8rem;">
                            <span>${c.name}</span>
                            <span style="color:var(--color-credit);">${s(c.amount)} (${d.purchases > 0 ? Math.round((c.amount/d.purchases)*100) : 0}%)</span>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            </div>`;
    }

    // ─────────────────────────────────────────────
    // MODULE 6: MONEY LEAKS (Working Capital)
    // ─────────────────────────────────────────────
    function analyzeMoneyLeaks() {
        const d = getAccountingData();
        const s = Store.formatRupee;
        if (d.sales === 0 && d.expenses === 0) return noDataMessage('Money Leaks');

        const expenseCats    = Store.getCategorySummary('month');
        const highExpenses   = expenseCats.filter(c => c.amount > d.sales * 0.1);
        const receivablesRatio = d.sales > 0 ? (d.totalReceivable / d.sales) * 100 : 0;
        // Debtor Days = (Total Receivable / Monthly Sales) × 30
        const debtorDays     = d.sales > 0 ? (d.totalReceivable / d.sales) * 30 : 0;

        return `
            <div class="ai-result-card">
                <h3>🕳️ Money Leaks Finder</h3>
                <p style="font-size:0.8rem;color:var(--text-muted);">Where is your money going?</p>

                ${highExpenses.length > 0 ? `
                <div class="ai-insight-box" style="background:rgba(255,107,107,0.1);">
                    <p style="color:var(--color-expense);font-size:0.82rem;font-weight:600;">⚠️ High Expense Categories Found:</p>
                    ${highExpenses.map(c => `
                        <div class="stat-row" style="font-size:0.8rem;">
                            <span>${c.name}</span>
                            <span class="expense">${s(c.amount)} (${d.sales > 0 ? Math.round((c.amount/d.sales)*100) : 0}% of sales)</span>
                        </div>
                    `).join('')}
                    <p style="margin-top:8px;font-size:0.78rem;">Any single expense over 10% of your sales is a red flag. Review these categories and check if you can reduce them.</p>
                </div>
                ` : `
                <div class="ai-insight-box" style="background:rgba(0,230,118,0.08);">
                    <p style="font-size:0.82rem;">✅ No unusually high expense category found this month. Your costs are well distributed.</p>
                </div>
                `}

                ${d.totalReceivable > 0 && d.settings.creditFacility !== false ? `
                <div class="ai-insight-box mt-md" style="background:rgba(255,165,0,0.08);">
                    <p style="font-size:0.82rem;font-weight:600;">💳 Debtors (Credit Given) Analysis:</p>
                    <div class="stat-row" style="font-size:0.8rem;margin-top:8px;">
                        <span>Total Money Owed to You</span>
                        <span class="credit">${s(d.totalReceivable)}</span>
                    </div>
                    <div class="stat-row" style="font-size:0.8rem;">
                        <span>Debtor Days</span>
                        <span class="${debtorDays > 30 ? 'expense' : 'income'}">${Math.round(debtorDays)} days</span>
                    </div>
                    <p style="margin-top:8px;font-size:0.78rem;">
                        Debtor Days = how many days on average it takes for customers to pay you back. 
                        ${debtorDays > 30 ? '⚠️ More than 30 days is risky — follow up with customers soon!' : '✅ Customers are paying within a reasonable time.'}
                    </p>
                </div>
                ` : ''}

                <div class="ai-insight-box mt-md">
                    <p style="font-size:0.82rem;">
                        <strong>💡 Tips to plug money leaks:</strong><br>
                        1. Buy stock in bulk to get discounts from wholesalers<br>
                        2. Record every expense — even small ones add up<br>
                        3. Pay suppliers on time to avoid penalty charges<br>
                        4. Reduce credit to customers — every rupee pending is a loan you gave for free
                    </p>
                </div>
            </div>`;
    }

    // ─────────────────────────────────────────────
    // MODULE 7: CASH FLOW ANALYSIS
    // ─────────────────────────────────────────────
    function analyzeCashFlow() {
        const d = getAccountingData();
        const s = Store.formatRupee;
        if (d.sales === 0) return noDataMessage('Cash Flow');

        // Operating Cash Flow (simplified):
        // Cash In  = Sales (cash) + payments received
        // Cash Out = Purchases + Expenses
        // Net Cash Flow = Cash In - Cash Out
        const cashIn  = d.sales + d.payments;
        const cashOut = d.purchases + d.expenses;
        const netCash = cashIn - cashOut;

        return `
            <div class="ai-result-card">
                <h3>💸 Cash Flow Analysis</h3>
                <p style="font-size:0.8rem;color:var(--text-muted);">Money In vs Money Out — This Month</p>

                <div class="pl-statement">
                    <div class="pl-row"><span>💰 Sales Revenue</span><span class="income">${s(d.sales)}</span></div>
                    ${d.settings.creditFacility !== false ? `<div class="pl-row"><span>💳 Credit Payments Received</span><span class="income">${s(d.payments)}</span></div>` : ''}
                    <div class="pl-row total"><span>= Total Cash In</span><span class="income">${s(cashIn)}</span></div>
                    <div class="pl-row indent"><span>(−) Stock Purchases Paid</span><span style="color:var(--color-credit);">${s(d.purchases)}</span></div>
                    <div class="pl-row indent"><span>(−) Running Expenses Paid</span><span class="expense">${s(d.expenses)}</span></div>
                    <div class="pl-row total"><span>= Net Cash Flow</span><span class="${netCash >= 0 ? 'income' : 'expense'}">${s(netCash)}</span></div>
                </div>

                <div class="ai-insight-box mt-md">
                    <p style="font-size:0.82rem;">
                        ${netCash >= 0
                            ? `✅ You have <strong>positive cash flow of ${s(netCash)}</strong> this month. Your business is generating more cash than it is spending.`
                            : `⚠️ You have <strong>negative cash flow of ${s(Math.abs(netCash))}</strong>. You are spending more than you are earning. This means you may face difficulty paying suppliers or covering upcoming expenses.`
                        }
                    </p>
                    <p style="margin-top:8px;font-size:0.82rem;">
                        <strong>Note:</strong> Cash flow is different from profit. Cash flow only counts actual cash that came in or went out. Profit includes all sales (even credit sales not yet received).
                    </p>
                </div>
            </div>`;
    }

    // ─────────────────────────────────────────────
    // MODULE 8: CUSTOMER RISK (Credit)
    // ─────────────────────────────────────────────
    function analyzeCustomerRisk() {
        const d = getAccountingData();
        const s = Store.formatRupee;
        if (!d.settings.creditFacility) return `<div class="ai-result-card"><p>Credit facility is disabled for your store.</p></div>`;

        const customers = d.customers.filter(c => c.balance > 0).sort((a, b) => b.balance - a.balance);
        if (customers.length === 0) return `<div class="ai-result-card"><h3>📊 Customer Risk</h3><p>✅ No pending dues from customers. Great!</p></div>`;

        const avgBalance   = d.totalReceivable / customers.length;
        const highRisk     = customers.filter(c => c.balance > avgBalance * 2);
        const debtorDays   = d.sales > 0 ? (d.totalReceivable / d.sales) * 30 : 0;

        return `
            <div class="ai-result-card">
                <h3>📊 Customer Risk (Debtors)</h3>
                <p style="font-size:0.8rem;color:var(--text-muted);">As per prudent credit management practices</p>

                <div class="ai-metric-row">
                    <div>
                        <div class="metric-label">Total Pending</div>
                        <div class="metric-value credit">${s(d.totalReceivable)}</div>
                    </div>
                    <div>
                        <div class="metric-label">Debtor Days</div>
                        <div class="metric-value ${debtorDays > 30 ? 'expense' : 'income'}">${Math.round(debtorDays)} days</div>
                    </div>
                </div>

                ${highRisk.length > 0 ? `
                <div class="ai-insight-box mt-md" style="background:rgba(255,107,107,0.1);">
                    <p style="color:var(--color-expense);font-size:0.82rem;font-weight:600;">⚠️ High-Risk Customers (owe more than average):</p>
                    ${highRisk.slice(0,3).map(c => `
                        <div class="stat-row" style="font-size:0.8rem;">
                            <span>${c.name}</span>
                            <span class="expense">${s(c.balance)}</span>
                        </div>
                    `).join('')}
                    <p style="margin-top:8px;font-size:0.78rem;">Follow up with these customers for immediate payment.</p>
                </div>
                ` : ''}

                <div class="ai-insight-box mt-md">
                    <p style="font-size:0.82rem;">
                        Debtor Days of <strong>${Math.round(debtorDays)} days</strong> means your customers take on average ${Math.round(debtorDays)} days to pay you back.
                        ${debtorDays > 45 ? ' ⚠️ This is very high — limit new credit until old dues are cleared.' : debtorDays > 30 ? ' ⚠️ Try to bring this below 30 days.' : ' ✅ This is within a healthy range.'}
                    </p>
                </div>
            </div>`;
    }

    // ─────────────────────────────────────────────
    // MODULE 9: SMART TIPS (Indian Small Business)
    // ─────────────────────────────────────────────
    function analyzeSmartTips() {
        const d = getAccountingData();
        const s = Store.formatRupee;

        const tips = [];

        if (d.grossMargin < 15) {
            tips.push({ icon: '💡', text: 'Your gross margin is below 15%. Negotiate better prices with your wholesale supplier — even a 5% reduction in purchase cost can double your profit.' });
        }
        if (d.expenseRatio > 30) {
            tips.push({ icon: '✂️', text: `Your monthly expenses (${s(d.expenses)}) are over 30% of your sales. Review each expense and see which ones can be reduced or eliminated.` });
        }
        if (d.sales > 0 && d.purchases === 0) {
            tips.push({ icon: '🛒', text: 'You have sales but no purchases recorded. Make sure to record all stock purchases — this is essential for calculating your true profit and for filing taxes.' });
        }
        if (d.totalReceivable > d.sales * 0.3 && d.settings.creditFacility !== false) {
            tips.push({ icon: '💳', text: `₹${s(d.totalReceivable)} in credit is pending — that's over 30% of your monthly sales. Reduce credit to avoid cash flow problems.` });
        }
        if (d.netMargin > 15) {
            tips.push({ icon: '🌟', text: `Excellent! Your net margin is ${Math.round(d.netMargin)}%, which is above average for small retail businesses (typically 5–15%). Consider reinvesting this profit to expand stock.` });
        }
        if (d.settings.gstRegistered && d.purchases > 0) {
            tips.push({ icon: '🧾', text: 'You are GST registered. Make sure to keep all purchase invoices to claim Input Tax Credit (ITC) — this directly reduces the GST you need to pay to the government.' });
        }

        // Always add
        tips.push({ icon: '📅', text: 'Record your sales and purchases every day — even ₹50 counts. Consistent daily records help you understand your business better and avoid surprises at month-end.' });
        tips.push({ icon: '🏦', text: 'Open a current account in a bank if you haven\'t already. This separates your personal money from business money — a basic requirement for good accounting.' });

        return `
            <div class="ai-result-card">
                <h3>💡 Smart Business Tips</h3>
                <p style="font-size:0.8rem;color:var(--text-muted);">Personalized advice based on your records</p>

                ${tips.map((tip, i) => `
                    <div class="ai-insight-box mt-sm" style="padding: 10px 14px;">
                        <p style="font-size:0.82rem;"><strong>${tip.icon}</strong> ${tip.text}</p>
                    </div>
                `).join('')}
            </div>`;
    }

    // ─────────────────────────────────────────────
    // HEALTH SCORE (per Indian SME standards)
    // ─────────────────────────────────────────────
    function getHealthScore() {
        const d = getAccountingData();
        if (d.sales === 0) return { score: 0, label: 'No Data', color: '#888' };

        let score = 50; // base

        // Gross Margin: target >20% for retail
        if (d.grossMargin >= 25) score += 20;
        else if (d.grossMargin >= 15) score += 10;
        else if (d.grossMargin < 5) score -= 15;

        // Net Margin: target >10%
        if (d.netMargin >= 15) score += 15;
        else if (d.netMargin >= 8) score += 8;
        else if (d.netMargin < 0) score -= 20;

        // Expense Ratio: target <30%
        if (d.expenseRatio <= 20) score += 10;
        else if (d.expenseRatio > 40) score -= 10;

        // Debtor Days: target <30
        const debtorDays = d.sales > 0 ? (d.totalReceivable / d.sales) * 30 : 0;
        if (debtorDays > 45) score -= 10;
        else if (debtorDays <= 15) score += 5;

        score = Math.max(0, Math.min(100, Math.round(score)));

        return {
            score,
            label: score >= 75 ? 'Healthy' : score >= 50 ? 'Moderate' : score >= 30 ? 'Needs Work' : 'Critical',
            color: score >= 75 ? '#00e676' : score >= 50 ? '#ffd700' : '#ff6b6b'
        };
    }

    // ─────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────
    function noDataMessage(module) {
        return `<div class="ai-result-card">
            <h3>${module}</h3>
            <div class="empty-state" style="padding: 20px 0;">
                <div class="empty-state-icon">📊</div>
                <div class="empty-state-title">Not enough data yet</div>
                <div class="empty-state-text">Add at least a few days of sales and purchases to see your ${module} analysis.</div>
            </div>
        </div>`;
    }

    // ─────────────────────────────────────────────
    // GEMINI PROMPT GENERATOR
    // Builds a financial data + context prompt per module
    // ─────────────────────────────────────────────
    function getDataPrompt(moduleId) {
        const d = getAccountingData();
        const s = Store.formatRupee;
        const settings = d.settings;

        // Base financial context (always included)
        const baseContext = `
You are an expert Indian Chartered Accountant (CA) and business advisor. The user runs a small ${settings.storeType || 'retail'} store called "${settings.storeName || 'My Store'}" in India.
${settings.gstRegistered ? 'The store IS GST registered.' : 'The store is NOT GST registered.'}
${settings.creditFacility !== false ? 'The store offers credit facility to customers.' : 'The store operates strictly on cash basis.'}

FINANCIAL DATA THIS MONTH:
- Sales Revenue: ${s(d.sales)}
- Cost of Goods Sold (Purchases): ${s(d.purchases)}
- Gross Profit (Sales - Purchases): ${s(d.grossProfit)}
- Operating Expenses (rent, electricity, wages): ${s(d.expenses)}
- Net Profit (Gross Profit - Expenses): ${s(d.netProfit)}
- Gross Profit Margin: ${Math.round(d.grossMargin)}%
- Net Profit Margin: ${Math.round(d.netMargin)}%
- Expense Ratio: ${Math.round(d.expenseRatio)}%
${settings.creditFacility !== false ? `- Total Credit Pending (Debtors): ${s(d.totalReceivable)}
- Debtor Days: ${d.sales > 0 ? Math.round((d.totalReceivable / d.sales) * 30) : 0} days` : ''}

ALL-TIME DATA:
- Total Sales: ${s(d.totalSales)}
- Total Net Profit: ${s(d.totalProfit)}
- Total Transactions: ${d.txnsAll.length}

IMPORTANT RULES:
- All advice MUST follow Indian GAAP / Accounting Standards (AS-1, AS-2, etc.)
- GST advice MUST follow CGST/SGST Act 2017
- Use simple language that an uneducated shopkeeper can understand
- Use Indian Rupee (₹) for all amounts
- Be specific with numbers from the data above, don't give generic advice
- Keep response under 300 words
`;

        // Module-specific prompts
        const modulePrompts = {
            pnl: `${baseContext}
Analyze this Profit & Loss statement. Is the business healthy? What specific actions should the store owner take to improve profit? Compare margins to typical ${settings.storeType || 'kirana'} store benchmarks in India.`,

            gst: `${baseContext}
Estimated annual sales: ${s(d.totalSales)}
Give specific GST advice:
1. Does this store need mandatory GST registration? (threshold: ₹40 lakhs for goods, ₹20 lakhs for services)
2. Should they opt for Composition Scheme? (turnover up to ₹1.5 crore, 1% flat tax)
3. What are the due dates for filing?
4. Can they claim Input Tax Credit (ITC) on purchases?
5. What GST rate applies to their products?
All advice must be as per CGST/SGST Act 2017.`,

            growth: `${baseContext}
Analyze the business growth trend. Is the business growing or declining? What specific steps should the owner take this month to increase sales? Suggest practical marketing and inventory ideas for a small ${settings.storeType || 'kirana'} store in India.`,

            forecast: `${baseContext}
Today is day ${new Date().getDate()} of the month (${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()} days total).
Project the end-of-month figures. What should the store owner focus on in the remaining days? Is the business on track for a profitable month?`,

            margins: `${baseContext}
Analyze the gross margin (${Math.round(d.grossMargin)}%) and net margin (${Math.round(d.netMargin)}%).
For a typical Indian ${settings.storeType || 'kirana'} store:
- Is the gross margin healthy? (typical: 15-30% for kirana)
- Is the net margin acceptable? (typical: 5-15%)
- What specific steps can improve margins? (negotiate with wholesalers, reduce wastage, optimize pricing)`,

            leaks: `${baseContext}
Find where money is being wasted or leaked. Look at:
1. Which expense categories are too high relative to sales?
2. Is too much money stuck in credit/debtors?
3. Are purchase costs too high (low gross margin)?
Give 3-5 specific, actionable steps to plug money leaks.`,

            cashflow: `${baseContext}
Cash In: Sales ${s(d.sales)} + Payments received ${s(d.payments)} = ${s(d.sales + d.payments)}
Cash Out: Purchases ${s(d.purchases)} + Expenses ${s(d.expenses)} = ${s(d.purchases + d.expenses)}
Net Cash Flow: ${s((d.sales + d.payments) - (d.purchases + d.expenses))}
Analyze the cash flow. Does the business have enough cash to operate? What are the risks? Give specific advice to improve cash flow for a small Indian store.`,

            customerRisk: `${baseContext}
Total credit outstanding: ${s(d.totalReceivable)}
Number of credit customers: ${d.customers.filter(c => c.balance > 0).length}
Debtor days: ${d.sales > 0 ? Math.round((d.totalReceivable / d.sales) * 30) : 0}
Analyze credit risk. Is too much money stuck with customers? What is the ideal debtor days for a ${settings.storeType || 'kirana'} store? Give specific steps to collect payments faster.`,

            tips: `${baseContext}
Give exactly 5 smart, practical, Indian-specific business tips based on this financial data. Each tip should be specific to their numbers (not generic). Include:
1. One tip about improving sales
2. One tip about reducing costs
3. One tip about managing cash flow
4. One tip about compliance (GST, licenses)
5. One bold growth idea for their type of store
Keep it simple and motivating.`
        };

        return modulePrompts[moduleId] || `${baseContext}\nGive specific business advice based on this financial data. Follow Indian accounting standards.`;
    }

    return {
        getHealthScore,
        analyzeProfitLoss,
        analyzeGST,
        analyzeGrowth,
        analyzeForecast,
        analyzeMargins,
        analyzeMoneyLeaks,
        analyzeCashFlow,
        analyzeCustomerRisk,
        analyzeSmartTips,
        getDataPrompt
    };
})();
