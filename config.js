/**
 * Visclub SiM - Public Website Configuration
 * FIXED VERSION - Simple and bulletproof
 */

(function() {
    // Detect environment
    var hostname = window.location.hostname;
    var isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '';

    // Set API URL based on environment
    var apiUrl = 'https://www.visclubsim.be/api';
    if (isLocal) {
        apiUrl = 'http://localhost/vissersclub-sim-website/api';
    }

    // Create config object
    var CONFIG = {
        environment: isLocal ? 'development' : 'production',
        isLocal: isLocal,
        API_BASE_URL: apiUrl,
        CACHE_TTL: 300000,
        FEATURES: {
            realtime: false,
            caching: true
        },
        DEBUG: isLocal
    };

    // Make config globally available
    window.CONFIG = CONFIG;
    window.API_BASE_URL = apiUrl;

    // Debug log
    if (isLocal) {
        console.log('🔧 Configuration loaded:', CONFIG);
    }

    console.log('✅ API_BASE_URL set to:', apiUrl);
})();
