/**
 * Visclub SiM - Configuration
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
            : 'https://visclub-sim-production.up.railway.app/api',  // Production Railway backend

        // Mode Configuration (ALWAYS use backend API)
        USE_LOCAL_MODE: false,  // ✅ Always use Supabase backend

        // Fallback Configuration
        ENABLE_OFFLINE_FALLBACK: true,  // Fallback to localStorage if API is down
        OFFLINE_RETRY_INTERVAL: 30000,  // Check API every 30 seconds when offline

        // Cache Configuration
        CACHE_TTL: 5 * 60 * 1000,  // 5 minutes

        // Debug Configuration
        DEBUG: isLocal,  // Enable debug logging in development

        // Feature Flags
        FEATURES: {
            realtime: true,  // Enable realtime updates
            offline: true,   // Enable offline mode
            caching: true    // Enable caching
        }
    };

    // Log configuration (only in development)
    if (CONFIG.DEBUG) {
        console.log('🔧 Configuration loaded:', {
            environment: CONFIG.environment,
            apiBaseUrl: CONFIG.API_BASE_URL,
            useLocalMode: CONFIG.USE_LOCAL_MODE,
            offlineFallback: CONFIG.ENABLE_OFFLINE_FALLBACK
        });
    }

    // Make config globally available
    window.APP_CONFIG = CONFIG;

    // Add visual indicator in development
    if (CONFIG.DEBUG && isLocal) {
        const indicator = document.createElement('div');
        indicator.id = 'dev-indicator';
        indicator.textContent = '🚧 DEV MODE';
        indicator.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: #ff9800;
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 12px;
            font-weight: bold;
            z-index: 99999;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
        document.addEventListener('DOMContentLoaded', () => {
            document.body.appendChild(indicator);
        });
    }

})();
