/* ============================================
   HisaabAI Configuration
   ============================================ */

const CONFIG = {
    // Google Gemini AI (free tier: 15 req/min, 1M tokens/day)
    // Get your FREE key: https://aistudio.google.com/apikey
    GEMINI_API_KEY: '',

    // Gemini model (free tier)
    GEMINI_MODEL: 'gemini-2.0-flash',

    // Gemini API endpoint
    GEMINI_URL: 'https://generativelanguage.googleapis.com/v1beta/models/',

    // Max tokens for responses
    MAX_TOKENS: 1500,

    // Cache duration (5 minutes in ms)
    CACHE_DURATION: 5 * 60 * 1000,

    // App version
    VERSION: '2.1.0'
};
