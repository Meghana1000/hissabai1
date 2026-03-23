/* ============================================
   HisaabAI AI Insights Page
   Dual-mode: Instant local analysis + Gemini AI
   ============================================ */

const AIInsights = (() => {
    const modules = [
        {
            id: 'pnl',
            icon: '📊',
            title: 'Profit & Loss',
            subtitle: 'Indian GAAP-accurate P&L',
            desc: 'Sales → Gross Profit → Net Profit calculated as per Indian accounting law',
            color: 'var(--gradient-success)',
            analyze: () => AIEngine.analyzeProfitLoss()
        },
        {
            id: 'gst',
            icon: '🏛️',
            title: 'GST Guide',
            subtitle: 'Indian GST Act 2017',
            desc: 'Registration rules, ITC, Composition Scheme — all as per Indian law',
            color: 'var(--gradient-info)',
            analyze: () => AIEngine.analyzeGST()
        },
        {
            id: 'growth',
            icon: '📈',
            title: 'Growth Meter',
            subtitle: 'Month-on-month comparison',
            desc: 'Sales growth, gross margin trend, and profit improvement',
            color: 'var(--gradient-primary)',
            analyze: () => AIEngine.analyzeGrowth()
        },
        {
            id: 'forecast',
            icon: '🔮',
            title: 'Revenue Forecast',
            subtitle: 'Projected P&L for this month',
            desc: 'Projected Sales, Purchases, Gross Profit and Net Profit by end of month',
            color: 'linear-gradient(135deg, #e040fb 0%, #7c4dff 100%)',
            analyze: () => AIEngine.analyzeForecast()
        },
        {
            id: 'margins',
            icon: '💹',
            title: 'Margin Analysis',
            subtitle: 'Gross & Net margin check',
            desc: 'How much you keep from every ₹100 sold — shown as gross & net margin',
            color: 'var(--gradient-warning)',
            analyze: () => AIEngine.analyzeMargins()
        },
        {
            id: 'leaks',
            icon: '🕳️',
            title: 'Money Leak Finder',
            subtitle: 'Expense & debtor analysis',
            desc: 'Find high-cost categories, debtor days, and working capital leaks',
            color: 'var(--gradient-danger)',
            analyze: () => AIEngine.analyzeMoneyLeaks()
        },
        {
            id: 'cashflow',
            icon: '💧',
            title: 'Cash Flow',
            subtitle: 'Operating cash flow',
            desc: 'Cash In vs Cash Out — do you have enough cash to run your business?',
            color: 'linear-gradient(135deg, #00bcd4 0%, #009688 100%)',
            analyze: () => AIEngine.analyzeCashFlow()
        },
        {
            id: 'customerRisk',
            icon: '👥',
            title: 'Customer Risk',
            subtitle: 'Debtor days & credit risk',
            desc: 'How many days do customers take to pay? Who owes the most?',
            color: 'linear-gradient(135deg, #ff9800 0%, #f44336 100%)',
            analyze: () => AIEngine.analyzeCustomerRisk()
        },
        {
            id: 'tips',
            icon: '💡',
            title: 'Smart Tips',
            subtitle: 'Personalized business advice',
            desc: 'Practical tips based on your actual records to grow your business',
            color: 'linear-gradient(135deg, #ffd54f 0%, #ff6f00 100%)',
            analyze: () => AIEngine.analyzeSmartTips()
        }
    ];

    // AI response cache
    const aiCache = {};

    function render() {
        const container = document.getElementById('page-ai');
        const settings = Store.getSettings();
        const creditEnabled = settings.creditFacility !== false;

        // Filter out credit-related modules if credit is disabled
        const visibleModules = creditEnabled ? modules : modules.filter(m => m.id !== 'customerRisk');

        // Check if Gemini key is configured
        const hasGeminiKey = getGeminiKey();

        container.innerHTML = `
            <!-- AI Header -->
            <div class="ai-header animate-fade-in">
                <div class="ai-header-icon">🤖</div>
                <div class="ai-header-title">AI Business Assistant</div>
                <div class="ai-header-subtitle">
                    Your smart business advisor — per Indian Accounting Standards
                </div>
                ${hasGeminiKey ? `
                    <div class="ai-badge-local" style="background: rgba(0,230,118,0.12); color: var(--color-income);">
                        <span>✅</span> Gemini AI Connected
                    </div>
                ` : `
                    <div class="ai-badge-local" style="cursor: pointer;" onclick="App.navigate('settings')">
                        <span>⚙️</span> Add free Gemini API key in Settings for AI advice
                    </div>
                `}
            </div>

            <!-- Quick Health Score -->
            <div class="ai-health-card glass-card mb-lg animate-fade-in">
                ${renderHealthScore(creditEnabled)}
            </div>

            <!-- Analysis Modules Grid -->
            <div class="section-header">
                <div>
                    <div class="section-title">Business Analysis</div>
                    <div class="section-subtitle">Tap any card to get insights</div>
                </div>
            </div>

            <div class="ai-modules-grid stagger-in">
                ${visibleModules.map(m => renderModuleCard(m)).join('')}
            </div>

            <!-- Footer Note -->
            <div class="ai-footer-note">
                📊 Local analysis is instant & private • 🤖 AI advice requires Gemini key
            </div>
        `;
    }

    function getGeminiKey() {
        // Check localStorage first (user-configured), then config fallback
        const stored = localStorage.getItem('hisaabai_gemini_key');
        if (stored) return stored;
        if (CONFIG.GEMINI_API_KEY && CONFIG.GEMINI_API_KEY.length > 10) return CONFIG.GEMINI_API_KEY;
        return '';
    }

    function renderHealthScore(creditEnabled) {
        const health = AIEngine.getHealthScore();
        const month = Store.getSummary('month');
        const totalReceivable = Store.getTotalReceivable();
        const creditText = creditEnabled ? ` | Pending: ${Store.formatRupee(totalReceivable)}` : '';

        return `
            <div style="text-align: center;">
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                    Business Health Score
                </div>
                <div class="ai-health-score" style="--score-color: ${health.color}">
                    <svg viewBox="0 0 120 120" class="ai-score-ring">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="var(--bg-input)" stroke-width="8"/>
                        <circle cx="60" cy="60" r="52" fill="none" stroke="${health.color}" stroke-width="8"
                            stroke-dasharray="${health.score * 3.27} 327" stroke-dashoffset="-81.75"
                            stroke-linecap="round" class="ai-score-fill"/>
                    </svg>
                    <div class="ai-score-value">${health.score}</div>
                </div>
                <div style="font-size: 1rem; font-weight: 700; color: ${health.color}; margin-top: 8px;">
                    ${health.label} ${health.score >= 75 ? '🌟' : health.score >= 50 ? '👍' : health.score >= 30 ? '⚠️' : '🚨'}
                </div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
                    Net Margin: ${Math.round(month.netMargin)}%${creditText}
                </div>
            </div>
        `;
    }

    function renderModuleCard(module) {
        return `
            <div class="ai-module-card" onclick="AIInsights.runAnalysis('${module.id}')" id="ai-card-${module.id}">
                <div class="ai-module-gradient" style="background: ${module.color};"></div>
                <div class="ai-module-icon">${module.icon}</div>
                <div class="ai-module-title">${module.title}</div>
                <div class="ai-module-subtitle">${module.subtitle}</div>
                <div class="ai-module-desc">${module.desc}</div>
                <div class="ai-module-arrow">→</div>
            </div>
        `;
    }

    // ─────────────────────────────────────────────
    // CORE: Run Analysis (instant local + optional AI)
    // ─────────────────────────────────────────────
    function runAnalysis(moduleId) {
        const module = modules.find(m => m.id === moduleId);
        if (!module) return;

        try {
            // Call the module's analyze function DIRECTLY — no loading delay
            const localHtml = module.analyze();
            showAnalysisResult(module, localHtml);
        } catch (err) {
            console.error('Analysis error for', moduleId, ':', err);
            showAnalysisError(module, err.message);
        }
    }

    function showAnalysisResult(module, localHtml) {
        const hasKey = getGeminiKey();
        const cacheKey = module.id;
        const cached = aiCache[cacheKey];
        const hasCachedAI = cached && (Date.now() - cached.time < CONFIG.CACHE_DURATION);

        const resultHtml = `
            <div class="modal-handle"></div>
            <div class="modal-header">
                <div class="modal-title">${module.icon} ${module.title}</div>
                <button class="modal-close" onclick="App.closeModal()">✕</button>
            </div>

            <!-- Local Analysis (instant) -->
            <div class="ai-result-content">
                ${localHtml}
            </div>

            <!-- AI Advice Section -->
            <div id="ai-advice-section" style="margin-top: 16px;">
                ${hasCachedAI ? `
                    <div class="ai-gemini-response">
                        <div style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 8px;">🤖 Gemini AI Advice</div>
                        ${formatGeminiResponse(cached.text)}
                    </div>
                ` : hasKey ? `
                    <button class="btn btn-primary btn-block" id="btn-get-ai-advice"
                        onclick="AIInsights.getGeminiAdvice('${module.id}')">
                        🤖 Get AI Advice from Gemini
                    </button>
                    <div style="font-size: 0.7rem; color: var(--text-muted); text-align: center; margin-top: 6px;">
                        Uses your data to generate personalized advice per Indian accounting law
                    </div>
                ` : `
                    <div class="ai-insight-box" style="text-align: center;">
                        <p style="font-size: 0.82rem;">🤖 Want AI-powered advice?</p>
                        <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">
                            Add a free Gemini API key in Settings to get personalized AI advice on your business.
                        </p>
                        <button class="btn btn-outline mt-sm" onclick="App.closeModal(); App.navigate('settings');">
                            ⚙️ Go to Settings
                        </button>
                    </div>
                `}
            </div>

            <div style="margin-top: 16px; display: flex; gap: 8px;">
                <button class="btn btn-outline" style="flex: 1;" onclick="AIInsights.runAnalysis('${module.id}')">
                    🔄 Refresh
                </button>
                <button class="btn btn-primary" style="flex: 1;" onclick="App.closeModal()">
                    ✅ Got It
                </button>
            </div>
        `;

        App.showModal(resultHtml);
    }

    function showAnalysisError(module, errorMsg) {
        const errorHtml = `
            <div class="modal-handle"></div>
            <div class="modal-header">
                <div class="modal-title">${module.icon} ${module.title}</div>
                <button class="modal-close" onclick="App.closeModal()">✕</button>
            </div>
            <div class="ai-error">
                <div class="ai-error-icon">⚠️</div>
                <div class="ai-error-title">Something went wrong</div>
                <div class="ai-error-text" style="font-size:0.82rem; color: var(--text-muted);">${errorMsg}</div>

                <button class="btn btn-primary btn-block mt-lg" onclick="AIInsights.runAnalysis('${module.id}')">
                    🔄 Try Again
                </button>
            </div>
        `;
        App.showModal(errorHtml);
    }

    // ─────────────────────────────────────────────
    // GEMINI AI: Get personalized advice
    // ─────────────────────────────────────────────
    async function getGeminiAdvice(moduleId) {
        const btn = document.getElementById('btn-get-ai-advice');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span class="ai-loading-dots"><span></span><span></span><span></span></span> Asking Gemini AI...';
        }

        try {
            const apiKey = getGeminiKey();
            if (!apiKey) throw new Error('No Gemini API key configured');

            const prompt = AIEngine.getDataPrompt(moduleId);
            const url = `${CONFIG.GEMINI_URL}${CONFIG.GEMINI_MODEL}:generateContent?key=${apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        maxOutputTokens: CONFIG.MAX_TOKENS,
                        temperature: 0.7
                    }
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                if (response.status === 429) throw new Error('Rate limit exceeded. Wait a minute and try again.');
                if (response.status === 403) throw new Error('Invalid API key. Check your Gemini key in Settings.');
                throw new Error(errData.error?.message || `API error (${response.status})`);
            }

            const data = await response.json();
            const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.';

            // Cache it
            aiCache[moduleId] = { text: aiText, time: Date.now() };

            // Show it
            const section = document.getElementById('ai-advice-section');
            if (section) {
                section.innerHTML = `
                    <div class="ai-gemini-response">
                        <div style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 8px;">🤖 Gemini AI Advice</div>
                        ${formatGeminiResponse(aiText)}
                    </div>
                `;
            }

        } catch (err) {
            console.error('Gemini AI error:', err);
            const section = document.getElementById('ai-advice-section');
            if (section) {
                section.innerHTML = `
                    <div class="ai-insight-box" style="background: rgba(255,107,107,0.1);">
                        <p style="color: var(--color-expense); font-size: 0.82rem;">⚠️ ${err.message}</p>
                        <button class="btn btn-outline btn-block mt-sm" onclick="AIInsights.getGeminiAdvice('${moduleId}')">
                            🔄 Try Again
                        </button>
                    </div>
                `;
            }
        }
    }

    function formatGeminiResponse(text) {
        if (!text) return '<p>No response.</p>';

        // Convert markdown to HTML
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^### (.+)$/gm, '<div style="font-weight:700;font-size:0.9rem;margin:12px 0 6px;color:var(--text-primary);">$1</div>')
            .replace(/^## (.+)$/gm, '<div style="font-weight:700;font-size:0.95rem;margin:14px 0 6px;color:var(--text-primary);">$1</div>')
            .replace(/^# (.+)$/gm, '<div style="font-weight:700;font-size:1rem;margin:14px 0 6px;color:var(--text-primary);">$1</div>')
            .replace(/^[•\-]\s(.+)$/gm, '<div style="padding-left:12px;margin:3px 0;">• $1</div>')
            .replace(/^(\d+)\.\s(.+)$/gm, '<div style="padding-left:12px;margin:3px 0;"><strong>$1.</strong> $2</div>')
            .replace(/\n\n/g, '<div style="height:8px;"></div>')
            .replace(/\n/g, '<br>');

        return `<div class="ai-insight-box" style="font-size: 0.82rem; line-height: 1.7;">${html}</div>`;
    }

    return { render, runAnalysis, getGeminiAdvice };
})();
