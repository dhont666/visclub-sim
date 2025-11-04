/**
 * Security Utilities - XSS Protection
 * HTML escaping and sanitization functions
 */

const SecurityUtils = {
    /**
     * Escape HTML to prevent XSS attacks
     * Converts <, >, &, ", ' to HTML entities
     */
    escapeHtml(unsafe) {
        if (unsafe === null || unsafe === undefined) return '';

        return String(unsafe)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    /**
     * Sanitize user input for display
     * Removes all HTML tags and escapes special characters
     */
    sanitizeInput(input) {
        if (typeof input !== 'string') return '';

        // Remove all HTML tags
        let sanitized = input.replace(/<[^>]*>/g, '');

        // Escape remaining special characters
        return this.escapeHtml(sanitized);
    },

    /**
     * Sanitize URL to prevent javascript: protocol
     */
    sanitizeUrl(url) {
        if (!url) return '';

        const urlString = String(url).trim().toLowerCase();

        // Block dangerous protocols
        if (urlString.startsWith('javascript:') ||
            urlString.startsWith('data:') ||
            urlString.startsWith('vbscript:') ||
            urlString.startsWith('file:')) {
            return '';
        }

        return url;
    },

    /**
     * Create safe HTML element with escaped content
     */
    createSafeElement(tagName, content, attributes = {}) {
        const element = document.createElement(tagName);

        // Set text content (automatically escaped by browser)
        if (content) {
            element.textContent = content;
        }

        // Set attributes safely
        for (const [key, value] of Object.entries(attributes)) {
            if (key === 'href' || key === 'src') {
                element.setAttribute(key, this.sanitizeUrl(value));
            } else if (key === 'style' || key === 'onclick' || key === 'onerror') {
                // Never allow inline styles or event handlers
                console.warn(`⚠️ Blocked dangerous attribute: ${key}`);
            } else {
                element.setAttribute(key, this.escapeHtml(value));
            }
        }

        return element;
    },

    /**
     * Validate and sanitize email
     */
    sanitizeEmail(email) {
        if (!email) return '';

        const sanitized = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(sanitized)) {
            return '';
        }

        return this.escapeHtml(sanitized);
    },

    /**
     * Validate and sanitize phone number
     */
    sanitizePhone(phone) {
        if (!phone) return '';

        // Remove all non-digit, non-plus, non-space characters
        const sanitized = String(phone).replace(/[^\d\s+()-]/g, '');

        return this.escapeHtml(sanitized);
    },

    /**
     * Safe JSON parse with validation
     */
    safeJsonParse(jsonString, defaultValue = null) {
        try {
            const parsed = JSON.parse(jsonString);

            // Validate it's not executable code
            if (typeof parsed === 'function') {
                console.error('⚠️ Security: Function detected in JSON');
                return defaultValue;
            }

            return parsed;
        } catch (error) {
            console.error('JSON parse error:', error);
            return defaultValue;
        }
    },

    /**
     * Sanitize object for display (recursively escapes all strings)
     */
    sanitizeObject(obj) {
        if (obj === null || obj === undefined) return obj;

        if (typeof obj === 'string') {
            return this.escapeHtml(obj);
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeObject(item));
        }

        if (typeof obj === 'object') {
            const sanitized = {};
            for (const [key, value] of Object.entries(obj)) {
                sanitized[key] = this.sanitizeObject(value);
            }
            return sanitized;
        }

        return obj;
    },

    /**
     * Create safe table row with escaped data
     */
    createSafeTableRow(data) {
        const tr = document.createElement('tr');

        for (const value of data) {
            const td = document.createElement('td');
            td.textContent = value; // textContent automatically escapes
            tr.appendChild(td);
        }

        return tr;
    },

    /**
     * Validate CSRF token (if you implement CSRF protection)
     */
    validateCsrfToken(token) {
        const storedToken = sessionStorage.getItem('csrf_token');
        return token === storedToken;
    },

    /**
     * Generate random CSRF token
     */
    generateCsrfToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        sessionStorage.setItem('csrf_token', token);
        return token;
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.SecurityUtils = SecurityUtils;
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityUtils;
}
