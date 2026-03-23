/* ============================================
   HisaabAI Onboarding Wizard
   ============================================ */

const Onboarding = (() => {
    let currentStep = 1;
    let config = {
        language: 'en',
        storeName: '',
        ownerName: '',
        gstRegistered: false,
        creditFacility: true,
        storeType: 'kirana' // Default selection
    };

    const shopTypes = [
        { id: 'kirana', icon: '🏪', name: 'Kirana' },
        { id: 'medical', icon: '💊', name: 'Medical' },
        { id: 'bakery', icon: '🍞', name: 'Bakery' },
        { id: 'electronics', icon: '📱', name: 'Electronics' },
        { id: 'clothing', icon: '👕', name: 'Clothing' },
        { id: 'hardware', icon: '🔧', name: 'Hardware' },
        { id: 'restaurant', icon: '🍽️', name: 'Restaurant' },
        { id: 'other', icon: '🛍️', name: 'Other' }
    ];

    const languages = [
        { id: 'en', name: 'English', native: 'English' },
        { id: 'hi', name: 'Hindi', native: 'हिन्दी' },
        { id: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
        { id: 'te', name: 'Telugu', native: 'తెలుగు' },
        { id: 'ta', name: 'Tamil', native: 'தமிழ்' }
    ];

    function render() {
        const container = document.getElementById('onboarding-container');
        container.innerHTML = `
            <div class="onboarding-card">
                ${renderHeader()}
                <div class="onboarding-body">
                    ${renderStep()}
                </div>
                ${renderFooter()}
            </div>
        `;
    }

    function renderHeader() {
        return `
            <div class="onboarding-header">
                <div class="onboarding-logo">
                    <div class="logo-rings"></div>
                    <span class="logo-icon">🤖</span>
                </div>
                <h2 class="onboarding-title">Welcome to HisaabAI</h2>
                <p class="onboarding-subtitle">Your Smart Business Companion</p>
                <div class="onboarding-progress">
                    <div class="progress-bar" style="width: ${(currentStep / 4) * 100}%"></div>
                </div>
            </div>
        `;
    }

    function renderStep() {
        switch (currentStep) {
            case 1:
                return `
                    <div class="step-content animate-slide-up">
                        <h3 class="step-title">Choose Your Language</h3>
                        <p class="step-desc">Select the language you are most comfortable with.</p>
                        <div class="language-grid">
                            ${languages.map(l => `
                                <div class="lang-option ${config.language === l.id ? 'active' : ''}" 
                                     onclick="Onboarding.setLanguage('${l.id}')">
                                    <div class="lang-native">${l.native}</div>
                                    <div class="lang-name">${l.name}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            case 2:
                return `
                    <div class="step-content animate-slide-up">
                        <h3 class="step-title">About You & Your Business</h3>
                        <p class="step-desc">Let's set up your profile.</p>
                        <div class="form-group">
                            <label class="form-label">Your Name (Owner)</label>
                            <input type="text" id="ob-owner-name" class="form-input" 
                                placeholder="Enter your full name" 
                                value="${config.ownerName}"
                                onchange="Onboarding.updateField('ownerName', this.value)">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Shop/Business Name</label>
                            <input type="text" id="ob-store-name" class="form-input" 
                                placeholder="e.g. Sharma General Store" 
                                value="${config.storeName}"
                                onchange="Onboarding.updateField('storeName', this.value)">
                        </div>
                    </div>
                `;
            case 3:
                return `
                    <div class="step-content animate-slide-up">
                        <h3 class="step-title">Business Operations</h3>
                        <p class="step-desc">Help HisaabAI understand how you work.</p>
                        
                        <div class="ob-toggle-row" onclick="Onboarding.toggleGST()">
                            <div class="ob-toggle-info">
                                <div class="ob-toggle-title">GST Registered</div>
                                <div class="ob-toggle-desc">Does your business have a GSTIN?</div>
                            </div>
                            <div class="toggle-switch ${config.gstRegistered ? 'active' : ''}"></div>
                        </div>

                        <div class="ob-toggle-row" onclick="Onboarding.toggleCredit()">
                            <div class="ob-toggle-info">
                                <div class="ob-toggle-title">Offer Credit (Udhar)?</div>
                                <div class="ob-toggle-desc">Turn off if you operate strictly on cash basis.</div>
                            </div>
                            <div class="toggle-switch ${config.creditFacility ? 'active' : ''}"></div>
                        </div>
                    </div>
                `;
            case 4:
                return `
                    <div class="step-content animate-slide-up">
                        <h3 class="step-title">What type of shop is it?</h3>
                        <p class="step-desc">We will customize categories and AI insights accordingly.</p>
                        <div class="ob-shop-grid">
                            ${shopTypes.map(t => `
                                <div class="ob-shop-option ${config.storeType === t.id ? 'active' : ''}" 
                                     onclick="Onboarding.setStoreType('${t.id}')">
                                    <div class="ob-shop-icon">${t.icon}</div>
                                    <div class="ob-shop-name">${t.name}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
        }
    }

    function renderFooter() {
        return `
            <div class="onboarding-footer">
                ${currentStep > 1 
                    ? `<button class="btn btn-outline" onclick="Onboarding.prevStep()">Back</button>` 
                    : `<div></div>`
                }
                
                <button class="btn btn-primary" onclick="Onboarding.nextStep()">
                    ${currentStep === 4 ? 'Finish Setup ✨' : 'Continue ➔'}
                </button>
            </div>
        `;
    }

    // --- Actions ---
    function setLanguage(lang) {
        config.language = lang;
        render();
    }

    function updateField(field, value) {
        config[field] = value.trim();
    }

    function toggleGST() {
        config.gstRegistered = !config.gstRegistered;
        render();
    }

    function toggleCredit() {
        config.creditFacility = !config.creditFacility;
        render();
    }

    function setStoreType(type) {
        config.storeType = type;
        render();
    }

    function prevStep() {
        if (currentStep > 1) {
            currentStep--;
            render();
        }
    }

    function nextStep() {
        // Validation
        if (currentStep === 2) {
            const ownerInput = document.getElementById('ob-owner-name').value.trim();
            const storeInput = document.getElementById('ob-store-name').value.trim();
            if (!storeInput) {
                // If toast is loaded, use it
                if (window.App && window.App.showToast) {
                    App.showToast('Please enter your Shop Name', 'error');
                } else {
                    alert('Please enter your Shop Name');
                }
                return;
            }
            config.ownerName = ownerInput;
            config.storeName = storeInput;
        }

        if (currentStep < 4) {
            currentStep++;
            render();
        } else {
            completeOnboarding();
        }
    }

    function completeOnboarding() {
        // Save to Store
        Store.updateSettings({
            onboardingComplete: true,
            language: config.language,
            ownerName: config.ownerName,
            storeName: config.storeName,
            gstRegistered: config.gstRegistered,
            creditFacility: config.creditFacility,
            storeType: config.storeType
        });

        // Hide onboarding, show app
        document.getElementById('onboarding-screen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        
        // Let App know it can continue initialization
        App.completeOnboardingStart();
    }

    return {
        render,
        setLanguage,
        updateField,
        toggleGST,
        toggleCredit,
        setStoreType,
        prevStep,
        nextStep
    };
})();
