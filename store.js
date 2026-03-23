/* ============================================
   HisaabAI Data Store
   localStorage-backed data layer
   ============================================ */

const Store = (() => {
    const KEYS = {
        transactions: 'hisaabai_transactions',
        customers: 'hisaabai_customers',
        settings: 'hisaabai_settings'
    };

    // ---------- Helpers ----------
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    function save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function load(key, fallback = []) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : fallback;
        } catch {
            return fallback;
        }
    }

    // Indian Rupee formatting: ₹1,23,456
    function formatRupee(amount) {
        const num = Math.abs(Number(amount) || 0);
        const sign = amount < 0 ? '-' : '';
        if (num < 1000) return sign + '₹' + num.toFixed(0);

        let str = num.toFixed(0);
        let lastThree = str.substring(str.length - 3);
        let remaining = str.substring(0, str.length - 3);
        if (remaining.length > 0) {
            lastThree = ',' + lastThree;
        }
        const formatted = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
        return sign + '₹' + formatted;
    }

    function formatDate(dateStr) {
        const d = new Date(dateStr);
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return d.toLocaleDateString('en-IN', options);
    }

    function formatTime(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    function getToday() {
        return new Date().toISOString().split('T')[0];
    }

    function isToday(dateStr) {
        return dateStr === getToday();
    }

    function isThisWeek(dateStr) {
        const d = new Date(dateStr);
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        return d >= startOfWeek;
    }

    function isThisMonth(dateStr) {
        const d = new Date(dateStr);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }

    function getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return { text: 'Good Morning! ☀️', period: 'morning' };
        if (hour < 17) return { text: 'Good Afternoon! 🙏', period: 'afternoon' };
        if (hour < 20) return { text: 'Good Evening! 🌅', period: 'evening' };
        return { text: 'Good Night! 🌙', period: 'night' };
    }

    // ---------- Transactions ----------
    function getTransactions() {
        return load(KEYS.transactions, []);
    }

    function addTransaction(txn) {
        const transactions = getTransactions();
        const newTxn = {
            id: generateId(),
            type: txn.type, // 'sale', 'purchase', 'expense', 'credit', 'payment'
            amount: Number(txn.amount),
            description: txn.description || '',
            category: txn.category || 'General',
            customerId: txn.customerId || null,
            customerName: txn.customerName || '',
            date: txn.date || getToday(),
            paymentMode: txn.paymentMode || 'cash',    // cash, upi, credit, pending
            quantity: txn.quantity || null,
            unit: txn.unit || '',
            supplier: txn.supplier || '',
            recurring: txn.recurring || false,
            createdAt: new Date().toISOString()
        };
        transactions.unshift(newTxn);
        save(KEYS.transactions, transactions);

        // Update customer balance if credit or payment
        if (txn.customerId && (txn.type === 'credit' || txn.type === 'payment')) {
            updateCustomerBalance(txn.customerId);
        }

        return newTxn;
    }

    function deleteTransaction(id) {
        let transactions = getTransactions();
        const txn = transactions.find(t => t.id === id);
        transactions = transactions.filter(t => t.id !== id);
        save(KEYS.transactions, transactions);

        if (txn && txn.customerId) {
            updateCustomerBalance(txn.customerId);
        }
    }

    function getTransactionsByPeriod(period) {
        const transactions = getTransactions();
        switch (period) {
            case 'today': return transactions.filter(t => isToday(t.date));
            case 'week': return transactions.filter(t => isThisWeek(t.date));
            case 'month': return transactions.filter(t => isThisMonth(t.date));
            default: return transactions;
        }
    }

    function getSummary(period = 'today') {
        const txns = getTransactionsByPeriod(period);
        const sales    = txns.filter(t => t.type === 'sale').reduce((s, t) => s + t.amount, 0);
        const purchases = txns.filter(t => t.type === 'purchase').reduce((s, t) => s + t.amount, 0);
        const expenses  = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const credits   = txns.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
        const payments  = txns.filter(t => t.type === 'payment').reduce((s, t) => s + t.amount, 0);

        // Correct Indian Accounting (GAAP-aligned):
        // Gross Profit = Net Sales - Cost of Goods Sold (Purchases)
        // Net Profit   = Gross Profit - Operating Expenses
        const grossProfit = sales - purchases;
        const netProfit   = grossProfit - expenses;

        const grossMargin = sales > 0 ? (grossProfit / sales) * 100 : 0;
        const netMargin   = sales > 0 ? (netProfit / sales) * 100 : 0;
        const expenseRatio = sales > 0 ? (expenses / sales) * 100 : 0;

        return {
            sales,
            purchases,
            expenses,
            grossProfit,
            netProfit,
            profit: netProfit,           // backward-compat alias
            grossMargin,
            netMargin,
            expenseRatio,
            credits,
            payments,
            netCredit: credits - payments,
            totalTransactions: txns.length
        };
    }

    function getCategorySummary(period = 'month') {
        const txns = getTransactionsByPeriod(period);
        const categories = {};
        txns.forEach(t => {
            // Only count actual operating expenses (not purchases)
            if (t.type === 'expense') {
                categories[t.category] = (categories[t.category] || 0) + t.amount;
            }
        });
        return Object.entries(categories)
            .map(([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount);
    }

    function getPurchaseCategorySummary(period = 'month') {
        const txns = getTransactionsByPeriod(period);
        const categories = {};
        txns.forEach(t => {
            if (t.type === 'purchase') {
                categories[t.category] = (categories[t.category] || 0) + t.amount;
            }
        });
        return Object.entries(categories)
            .map(([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount);
    }

    // ---------- Customers ----------
    function getCustomers() {
        return load(KEYS.customers, []);
    }

    function addCustomer(customer) {
        const customers = getCustomers();
        const newCustomer = {
            id: generateId(),
            name: customer.name,
            phone: customer.phone || '',
            balance: 0,
            createdAt: new Date().toISOString()
        };
        customers.unshift(newCustomer);
        save(KEYS.customers, customers);
        return newCustomer;
    }

    function updateCustomer(id, updates) {
        const customers = getCustomers();
        const idx = customers.findIndex(c => c.id === id);
        if (idx > -1) {
            customers[idx] = { ...customers[idx], ...updates };
            save(KEYS.customers, customers);
            return customers[idx];
        }
        return null;
    }

    function deleteCustomer(id) {
        let customers = getCustomers();
        customers = customers.filter(c => c.id !== id);
        save(KEYS.customers, customers);
    }

    function getCustomerById(id) {
        return getCustomers().find(c => c.id === id) || null;
    }

    function updateCustomerBalance(customerId) {
        const txns = getTransactions().filter(t => t.customerId === customerId);
        const credits = txns.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
        const payments = txns.filter(t => t.type === 'payment').reduce((s, t) => s + t.amount, 0);
        updateCustomer(customerId, { balance: credits - payments });
    }

    function getCustomerTransactions(customerId) {
        return getTransactions().filter(t => t.customerId === customerId);
    }

    function getCustomersWithBalance() {
        return getCustomers().filter(c => c.balance > 0).sort((a, b) => b.balance - a.balance);
    }

    function getTotalReceivable() {
        return getCustomers().reduce((sum, c) => sum + Math.max(0, c.balance), 0);
    }

    // ---------- Settings ----------
    function getSettings() {
        return load(KEYS.settings, {
            storeName: 'Meri Dukaan',
            ownerName: '',
            language: 'en',
            onboardingComplete: false,
            storeType: 'kirana', // kirana, medical, electronics, restaurant, bakery, clothing, hardware, other
            gstRegistered: false,
            creditFacility: true,
            annualTurnover: '',
            notifications: true,
            darkMode: true
        });
    }

    function updateSettings(updates) {
        const settings = getSettings();
        const updated = { ...settings, ...updates };
        save(KEYS.settings, updated);
        return updated;
    }

    // ---------- Categories ----------
    function getCategories(storeType = 'kirana') {
        const commonIncome = ['General Sales', 'Services', 'Other Income'];
        const commonExpense = ['Rent', 'Electricity', 'Internet', 'Wages / Salary', 'Transportation', 'Packaging', 'Maintenance', 'Tax / License', 'Other Expense'];
        
        const typeSpecific = {
            kirana: {
                income: ['Groceries', 'Snacks & Biscuits', 'Beverages', 'Personal Care', 'Dairy Products', 'Cleaning Supplies'],
                expense: ['Wholesale Groceries', 'FMCG Distributors', 'Dairy Supply', 'Damage / Spoilage']
            },
            medical: {
                income: ['Prescription Medicines', 'OTC Medicines', 'Surgical Items', 'Supplements', 'Baby Care', 'Personal Hygiene'],
                expense: ['Pharma Distributors', 'Cold Storage Maintenance', 'Expired Return', 'Medical Licenses']
            },
            electronics: {
                income: ['Mobile Phones', 'Accessories', 'Home Appliances', 'Repairs', 'Computer Parts'],
                expense: ['Brand Distributors', 'Spare Parts', 'Showroom Maintenance', 'Warranty Replacements']
            },
            restaurant: {
                income: ['Dine-In Orders', 'Takeaway', 'Home Delivery', 'Catering', 'Beverages', 'Desserts'],
                expense: ['Raw Materials (Veg/Meat)', 'Gas/Fuel', 'Disposables', 'Kitchen Equipment', 'Marketing/Swiggy/Zomato']
            },
            bakery: {
                income: ['Cakes & Pastries', 'Breads & Buns', 'Cookies & Snacks', 'Custom Orders', 'Beverages'],
                expense: ['Flour/Sugar/Butter', 'Oven Maintenance', 'Packaging Boxes', 'Baking Equipment']
            },
            clothing: {
                income: ['Clothing Sales', 'Accessories', 'Alteration Services', 'Wholesale Sales'],
                expense: ['Wholesale Garments', 'Tailoring', 'Packaging', 'Shop Maintenance']
            },
            hardware: {
                income: ['Hardware Sales', 'Tools & Equipments', 'Paint & Supplies', 'Plumbing Materials'],
                expense: ['Wholesale Hardware', 'Transport & Freight', 'Equipment Maintenance', 'Storage']
            },
            other: {
                income: ['General Sales', 'Services Rendered', 'Consultation', 'Miscellaneous Income'],
                expense: ['Inventory Purchase', 'Marketing', 'Office Supplies', 'Miscellaneous Expense']
            }
        };

        const purchaseCategories = [
            'Stock / Goods for Resale',
            'Raw Materials',
            'Packaging Materials',
            'Wholesale Purchase',
            'Other Purchase'
        ];

        const specific = typeSpecific[storeType] || typeSpecific.kirana;

        return {
            sale: [...specific.income, ...commonIncome],
            purchase: purchaseCategories,
            expense: [...commonExpense],
            credit: specific.income
        };
    }

    // ---------- Seed Demo Data ----------
    function seedDemoData() {
        if (getTransactions().length > 0 || getCustomers().length > 0) return;

        const today = getToday();
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];

        // Seed customers
        const c1 = addCustomer({ name: 'Raju Sharma', phone: '9876543210' });
        const c2 = addCustomer({ name: 'Sunita Devi', phone: '9988776655' });
        const c3 = addCustomer({ name: 'Mohan Lal', phone: '9123456789' });

        // Update settings to Kirana
        updateSettings({ storeType: 'kirana', storeName: 'Sharma General Store', annualTurnover: '1500000' });

        // Today's transactions
        addTransaction({ type: 'sale', amount: 2500, description: 'Rice, Dal, Oil', category: 'Groceries', date: today });
        addTransaction({ type: 'sale', amount: 850, description: 'Biscuits & Snacks', category: 'Snacks & Biscuits', date: today });
        addTransaction({ type: 'expense', amount: 500, description: 'Electricity bill', category: 'Electricity', date: today });
        addTransaction({ type: 'credit', amount: 1200, description: 'Monthly ration list', customerId: c1.id, customerName: c1.name, category: 'Groceries', date: today });
        addTransaction({ type: 'sale', amount: 380, description: 'Cold drinks', category: 'Beverages', date: today });

        // Yesterday
        addTransaction({ type: 'sale', amount: 3200, description: 'Weekly stock - flour & sugar', category: 'Groceries', date: yesterday });
        addTransaction({ type: 'purchase', amount: 12000, description: 'Wholesale market - flour, sugar, oil', category: 'Wholesale Purchase', date: yesterday });
        addTransaction({ type: 'expense', amount: 2000, description: 'Shop helper wages', category: 'Wages / Salary', date: yesterday });
        addTransaction({ type: 'credit', amount: 800, description: 'Chai & Snacks', customerId: c2.id, customerName: c2.name, category: 'Beverages', date: yesterday });
        addTransaction({ type: 'payment', amount: 500, description: 'Cash received', customerId: c2.id, customerName: c2.name, date: yesterday });
        addTransaction({ type: 'sale', amount: 620, description: 'Soap, Shampoo, Paste', category: 'Personal Care', date: yesterday });

        // Two days ago
        addTransaction({ type: 'sale', amount: 1800, description: 'Festival supplies', category: 'Groceries', date: twoDaysAgo });
        addTransaction({ type: 'purchase', amount: 5000, description: 'Festival stock purchase', category: 'Stock / Goods for Resale', date: twoDaysAgo });
        addTransaction({ type: 'expense', amount: 300, description: 'Shop cleaning', category: 'Wages / Salary', date: twoDaysAgo });
        addTransaction({ type: 'credit', amount: 2000, description: 'Bulk ration order', customerId: c3.id, customerName: c3.name, category: 'Groceries', date: twoDaysAgo });
    }

    // ---------- Public API ----------
    return {
        formatRupee,
        formatDate,
        formatTime,
        getToday,
        getGreeting,
        generateId,

        getTransactions,
        addTransaction,
        deleteTransaction,
        getTransactionsByPeriod,
        getSummary,
        getCategorySummary,
        getPurchaseCategorySummary,
        getCategories,

        getCustomers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomerById,
        getCustomerTransactions,
        getCustomersWithBalance,
        getTotalReceivable,

        getSettings,
        updateSettings,
        seedDemoData
    };
})();
