/**
 * Visclub SiM - Public Website Configuration
 * Auto-detects environment and configures API endpoints
 */

(function() {
    // Detect environment
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '';
    const isProduction = !isLocal;

    // Configure based on environment
    const CONFIG = {
        // Environment detection
        environment: isProduction ? 'production' : 'development',
        isLocal: isLocal,

        // API Configuration
        API_BASE_URL: isLocal
            ? 'http://localhost:3000/api'  // Local development
            : `${window.location.origin}/api`,  // Production (same origin)

        // Cache Configuration
        CACHE_TTL: 5 * 60 * 1000,  // 5 minutes cache for public data

        // Feature Flags
        FEATURES: {
            realtime: false,  // Realtime updates disabled for public site
            caching: true     // Enable caching for better performance
        },

        // Debug Configuration (only in development)
        DEBUG: isLocal
    };

    // Log configuration (only in development)
    if (CONFIG.DEBUG) {
        console.log('🔧 Public Configuration loaded:', {
            environment: CONFIG.environment,
            apiBaseUrl: CONFIG.API_BASE_URL
        });
    }

    // Make config globally available
    window.CONFIG = CONFIG;

})();
