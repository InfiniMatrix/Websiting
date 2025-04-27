/**
 * IAA Solutions Website JavaScript
 * High-performance, accessible, SEO-optimized script for Enterprise AI & Automation website
 * 
 * Features:
 * - Advanced performance optimization with code splitting and lazy loading
 * - Comprehensive accessibility (WCAG 2.1 AA compliant)
 * - SEO best practices including structured data
 * - Intelligent internationalization with perfect language switching
 * - Responsive to user preferences (reduced motion, color scheme, etc.)
 * - Robust error handling and graceful degradation
 */
'use strict';

/**
 * =========================================================
 * PERFORMANCE & INITIALIZATION UTILS
 * =========================================================
 */

/**
 * Generate a unique selector for a DOM element with improved error handling
 * @param {Element} el - The DOM element to generate a selector for
 * @return {string|null} - The unique selector or null if element is invalid
 */
function getUniqueSelector(el) {
    // Enhanced null/validity check
    if (!el || typeof el !== 'object' || !el.nodeType) return null;
    
    try {
        // If element has ID, use that (most reliable)
        if (el.id) return '#' + el.id;
        
        // Try to create a unique selector using tag name
        let selector = el.tagName ? el.tagName.toLowerCase() : 'unknown-element';
        
        // Add classes with better type checking and sanitization
        if (el.className && typeof el.className === 'string') {
            // Filter out any class names containing invalid selector characters
            const classes = el.className.split(' ')
                .filter(c => c.trim() !== '' && !/[[\]()\{\}]/.test(c)) // Filter out classes with brackets or parentheses
                .map(c => '.' + c)
                .join('');
            selector += classes;
        }
        
        // Add data attributes with safer string handling
        if (typeof el.hasAttribute === 'function') {
            ['data-id', 'data-section', 'data-target', 'data-tab'].forEach(attribute => {
                if (el.hasAttribute(attribute)) {
                    const value = el.getAttribute(attribute);
                    // Escape quotes in attribute values
                    const safeValue = value ? value.replace(/"/g, '\\"') : '';
                    selector += '[' + attribute + '="' + safeValue + '"]';
                }
            });
        }
        
        // Check if selector is valid by testing it in a try/catch block
        const isValidSelector = (function(sel) {
            try {
                document.querySelector(sel);
                return true;
            } catch (e) {
                return false;
            }
        })(selector);
        
        // If selector is not valid, fall back to just tag name
        if (!isValidSelector) {
            selector = el.tagName ? el.tagName.toLowerCase() : 'unknown-element';
        }
        
        // Safe check if element is actually in the document
        const isInDocument = el.ownerDocument && 
                           (el.ownerDocument.body && el.ownerDocument.body.contains(el) || 
                            el.ownerDocument.contains(el));
        
        // Safe check for unique selector
        if (isInDocument && isValidSelector) {
            try {
                // Only check uniqueness if the element is actually in the document
                if (el.ownerDocument.querySelectorAll(selector).length === 1) {
                    return selector;
                }
            } catch (selectorError) {
                console.warn('Invalid selector generated:', selector, selectorError);
                // Continue with nth-child approach
            }
        }
        
        // Otherwise, try to add structural context
        if (el.parentNode && typeof el.parentNode.children !== 'undefined') {
            // Create a safer parent selector
            let parentSelector = el.parentNode.tagName ? el.parentNode.tagName.toLowerCase() : '';
            
            // Add nth-child for positional context
            const siblings = el.parentNode.children.length || 0;
            let index = -1;
            
            // Find the element's index among siblings
            for (let i = 0; i < siblings; i++) {
                if (el.parentNode.children[i] === el) {
                    index = i;
                    break;
                }
            }
            
            // Add the nth-child selector if needed
            if (index >= 0 && siblings > 1) {
                const elementWithPosition = el.tagName.toLowerCase() + ':nth-child(' + (index + 1) + ')';
                
                // Check if this compound selector is valid
                try {
                    if (parentSelector) {
                        return parentSelector + ' > ' + elementWithPosition;
                    } else {
                        return elementWithPosition;
                    }
                } catch (e) {
                    // Fall back to just the tag name if all else fails
                    return el.tagName ? el.tagName.toLowerCase() : 'unknown-element';
                }
            }
        }
        
        return selector;
    } catch (error) {
        console.error('Error generating unique selector:', error);
        return el.tagName ? el.tagName.toLowerCase() : 'unknown-element';
    }
}

/**
 * Immediately Invoked Function Expression for performance monitoring
 */
(function() {
    // Create performance mark for page load start
    if (window.performance && window.performance.mark) {
        window.performance.mark('script_start');
    }
    
    // Add page timing data to analytics
    window.addEventListener('load', () => {
        if (window.performance && window.performance.mark) {
            window.performance.mark('script_end');
            window.performance.measure('script_execution', 'script_start', 'script_end');
            
            const scriptTime = window.performance.getEntriesByName('script_execution')[0].duration;
            console.log(`Script execution time: ${scriptTime.toFixed(2)}ms`);
            
            // Track performance metrics for analytics
            if (window.dataLayer) {
                window.dataLayer.push({
                    event: 'performance',
                    performanceData: {
                        scriptExecutionTime: scriptTime.toFixed(2)
                    }
                });
            }
        }
    });
    
    // Listen for client-side navigation errors
    window.addEventListener('error', (event) => {
        console.error('Runtime error detected:', event.error);
        
        // Log to analytics with non-identifying information
        if (window.dataLayer) {
            window.dataLayer.push({
                event: 'jsError',
                errorData: {
                    message: event.error?.message || 'Unknown error',
                    url: window.location.pathname,
                    line: event.lineno,
                    column: event.colno
                }
            });
        }
    });
})();

/**
 * Optimized DOM ready handler with Promise support
 */
const DOMReady = (function() {
    // Create a promise for DOM ready state
    const readyPromise = new Promise((resolve) => {
        if (document.readyState === 'interactive' || document.readyState === 'complete') {
            resolve();
        } else {
            document.addEventListener('DOMContentLoaded', () => resolve());
        }
    });
    
    // Return a function that can be used with callbacks or as a promise
    return function(callback) {
        if (typeof callback === 'function') {
            readyPromise.then(callback);
        }
        return readyPromise;
    };
})();

/**
 * Performance-optimized debounce with improved memory usage
 */
function debounce(func, wait, immediate = false) {
    let timeout;
    
    return function executedFunction() {
        const context = this;
        const args = arguments;
        
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        
        if (callNow) func.apply(context, args);
    };
}

/**
 * Throttle function for scroll and resize events
 */
function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    
    return function() {
        const context = this;
        const args = arguments;
        
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}

/**
 * Lazy load function for components and resources
 */
function lazyLoad(selector, callback, options = {}) {
    const defaultOptions = {
        rootMargin: '200px 0px',
        threshold: 0.01,
        once: true
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                callback(entry.target);
                
                if (mergedOptions.once) {
                    observer.unobserve(entry.target);
                }
            }
        });
    }, {
        rootMargin: mergedOptions.rootMargin,
        threshold: mergedOptions.threshold
    });
    
    document.querySelectorAll(selector).forEach(element => {
        observer.observe(element);
    });
    
    return {
        observer,
        disconnect: () => observer.disconnect()
    };
}

/**
 * =========================================================
 * DATA & STORAGE UTILITIES
 * =========================================================
 */

/**
 * Enhanced cookie utility with security and privacy features
 */
const CookieUtil = (function() {
    // Private methods
    const encode = (value) => encodeURIComponent(String(value));
    const decode = (value) => decodeURIComponent(String(value));
    
    // Default cookie options with secure settings
    const defaultOptions = {
        path: '/',
        sameSite: 'Lax',
        expires: null, // Session cookie by default
        secure: window.location.protocol === 'https:',
        domain: window.location.hostname.replace(/^www\./i, '')
    };
    
    return {
        get: function(name) {
            try {
                const nameEq = `${encode(name)}=`;
                const cookies = document.cookie.split(';');
                
                for (let i = 0; i < cookies.length; i++) {
                    let cookie = cookies[i].trim();
                    if (cookie.startsWith(nameEq)) {
                        const value = cookie.substring(nameEq.length);
                        return value ? decode(value) : null;
                    }
                }
            } catch (e) {
                console.error('Error getting cookie:', e);
            }
            return null;
        },
        
        set: function(name, value, options = {}) {
            try {
                // Merge options with defaults
                const mergedOptions = { ...defaultOptions, ...options };
                
                // Format cookie string
                let cookieString = `${encode(name)}=${value ? encode(value) : ''}`;
                
                // Add expiration if provided
                if (mergedOptions.expires) {
                    const expires = mergedOptions.expires;
                    
                    if (typeof expires === 'number') {
                        // If number, treat as days
                        const date = new Date();
                        date.setTime(date.getTime() + (expires * 24 * 60 * 60 * 1000));
                        cookieString += `; expires=${date.toUTCString()}`;
                    } else if (expires instanceof Date) {
                        // If Date object
                        cookieString += `; expires=${expires.toUTCString()}`;
                    }
                }
                
                // Add path, domain, secure flag
                if (mergedOptions.path) cookieString += `; path=${mergedOptions.path}`;
                if (mergedOptions.domain) cookieString += `; domain=${mergedOptions.domain}`;
                if (mergedOptions.sameSite) cookieString += `; SameSite=${mergedOptions.sameSite}`;
                if (mergedOptions.secure) cookieString += '; Secure';
                
                // Set the cookie
                document.cookie = cookieString;
                return true;
            } catch (e) {
                console.error('Error setting cookie:', e);
                return false;
            }
        },
        
        remove: function(name, options = {}) {
            return this.set(name, '', { 
                ...options, 
                expires: new Date(0) 
            });
        },
        
        hasConsent: function() {
            return this.get('cookie_consent') === 'accepted';
        }
    };
})();

/**
 * Enhanced LocalStorage with encryption, expiration, and fallbacks
 */
const StorageUtil = (function() {
    // Determine storage availability
    const hasLocalStorage = (function() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    })();
    
    // Memory fallback if localStorage is unavailable
    const memoryStorage = new Map();
    
    // Simple encryption for sensitive data (not for high security needs)
    function encrypt(data, key = 'iaa_solutions') {
        if (!data) return data;
        try {
            const jsonStr = JSON.stringify(data);
            let result = '';
            for (let i = 0; i < jsonStr.length; i++) {
                result += String.fromCharCode(jsonStr.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }
            return btoa(result);
        } catch (e) {
            console.error('Encryption error:', e);
            return data;
        }
    }
    
    // Decrypt data
    function decrypt(data, key = 'iaa_solutions') {
        if (!data) return data;
        try {
            const bytes = atob(data);
            let result = '';
            for (let i = 0; i < bytes.length; i++) {
                result += String.fromCharCode(bytes.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }
            return JSON.parse(result);
        } catch (e) {
            console.error('Decryption error:', e);
            return null;
        }
    }
    
    return {
        get: function(key, defaultValue = null) {
            try {
                let item;
                
                if (hasLocalStorage) {
                    item = localStorage.getItem(key);
                } else {
                    item = memoryStorage.get(key);
                }
                
                if (!item) return defaultValue;
                
                const data = JSON.parse(item);
                
                // Check if item is encrypted
                if (data.encrypted) {
                    data.value = decrypt(data.value);
                }
                
                // Check if item is expired
                if (data.expires && new Date(data.expires) < new Date()) {
                    this.remove(key);
                    return defaultValue;
                }
                
                return data.value;
            } catch (e) {
                console.error('Error getting item from storage:', e);
                return defaultValue;
            }
        },
        
        set: function(key, value, options = {}) {
            try {
                const { expires, encrypt: shouldEncrypt = false } = options;
                
                let data = {
                    value: shouldEncrypt ? encrypt(value) : value,
                    encrypted: shouldEncrypt,
                    timestamp: new Date().toISOString()
                };
                
                if (expires) {
                    if (typeof expires === 'number') {
                        // If number, treat as days
                        const date = new Date();
                        date.setTime(date.getTime() + (expires * 24 * 60 * 60 * 1000));
                        data.expires = date.toISOString();
                    } else if (expires instanceof Date) {
                        data.expires = expires.toISOString();
                    }
                }
                
                const serialized = JSON.stringify(data);
                
                if (hasLocalStorage) {
                    localStorage.setItem(key, serialized);
                } else {
                    memoryStorage.set(key, serialized);
                }
                
                return true;
            } catch (e) {
                console.error('Error setting item in storage:', e);
                return false;
            }
        },
        
        remove: function(key) {
            try {
                if (hasLocalStorage) {
                    localStorage.removeItem(key);
                } else {
                    memoryStorage.delete(key);
                }
                return true;
            } catch (e) {
                console.error('Error removing item from storage:', e);
                return false;
            }
        },
        
        clear: function() {
            try {
                if (hasLocalStorage) {
                    localStorage.clear();
                } else {
                    memoryStorage.clear();
                }
                return true;
            } catch (e) {
                console.error('Error clearing storage:', e);
                return false;
            }
        }
    };
})();

/**
 * =========================================================
 * CONFIGURATION
 * =========================================================
 */

/**
 * Site configuration with environment-specific overrides
 */
const CONFIG = (function() {
    // Base configuration
    const baseConfig = {
        // Core settings
        environment: 'production',
        version: '1.2.0',
        
        // UI Configuration
        headerScrollThreshold: 50,
        scrollSpyOffset: 100,
        backToTopThreshold: 300,
        smoothScrollDuration: 800,
        sectionScrollOffset: 100,
        
        // Animation Settings
        aosDuration: 800,
        counterDuration: 2.5,
        testimonialAutoplayDelay: 5000,
        
        // Cookie Settings
        cookieExpiryDays: 365,
        cookieDomain: window.location.hostname.replace(/^www\./i, ''),
        
        // API Endpoints
        apiBaseUrl: '/api',
        contactFormEndpoint: '/api/contact',
        newsletterEndpoint: '/api/subscribe',
        
        // Performance optimization
        lazyLoadImages: true,
        lazyLoadThreshold: '200px',
        preloadFonts: true,
        
        // Language Settings
        defaultLanguage: 'en',
        fallbackLanguage: 'en',
        supportedLanguages: [
            { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
            { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' },
            { code: 'it', name: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
            { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
            { code: 'de', name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
            { code: 'pt', name: 'Português', flag: '🇵🇹', dir: 'ltr' }
        ],
        
        // SEO settings
        generateStructuredData: true,
        breadcrumbsEnabled: true,
        
        // Accessibility
        prefersReducedMotionEnabled: true,
        highContrastSupport: true,
        
        // Feature toggles
        features: {
            darkMode: true,
            multilingual: true,
            contactForm: true,
            newsletter: true,
            testimonials: true,
            animations: true,
            cookieConsent: true,
            portfolio: true,
            pricing: true,
            proposalView: true
        }
    };
    
    // Environment-specific overrides
    const envOverrides = {
        development: {
            environment: 'development',
            apiBaseUrl: 'http://localhost:3000/api',
            contactFormEndpoint: 'http://localhost:3000/api/contact',
            newsletterEndpoint: 'http://localhost:3000/api/subscribe'
        },
        staging: {
            environment: 'staging',
            apiBaseUrl: 'https://staging.iaasolutions.com/api'
        },
        production: {
            environment: 'production'
        }
    };
    
    // Determine current environment
    let currentEnv = 'production';
    const hostname = window.location.hostname;
    
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
        currentEnv = 'development';
    } else if (hostname.includes('staging') || hostname.includes('test')) {
        currentEnv = 'staging';
    }
    
    // Merge base config with environment overrides
    const mergedConfig = { 
        ...baseConfig, 
        ...envOverrides[currentEnv]
    };
    
    // Override with any config from data attributes
    const configScript = document.querySelector('script[data-config]');
    if (configScript) {
        try {
            const dataConfig = JSON.parse(configScript.getAttribute('data-config'));
            Object.assign(mergedConfig, dataConfig);
        } catch (e) {
            console.error('Error parsing data-config attribute:', e);
        }
    }
    
    return Object.freeze(mergedConfig);
})();

/**
 * Text strings for localization with dynamic loading
 */
const I18n = (function() {
    // Base strings for English as default
    const defaultStrings = {
    en: {
        darkMode: "Dark Mode",
        lightMode: "Light Mode",
        formRequired: "This field is required",
        formEmail: "Please enter a valid email address",
        formConsent: "You must agree to the terms",
        formSuccess: "Thank you! Your message has been sent.",
        formError: "Sorry, there was a problem sending your message.",
        newsletterSuccess: "Thank you for subscribing!",
        newsletterError: "Subscription failed. Please try again.",
        loading: "Loading...",
        backToTop: "Back to top",
        menuOpen: "Open menu",
        menuClose: "Close menu",
        cookieConsentText: "This website uses cookies to ensure you get the best experience.",
        cookieAccept: "Accept",
        cookieDecline: "Decline",
        cookieSettings: "Cookie settings",
        languageSwitch: "Change language",
        moreInfo: "More information",
        readMore: "Read more",
        sendMessage: "Send message",
        subscribe: "Subscribe",
        errorTitle: "An error occurred",
        tryAgain: "Try again",
        close: "Close",
        viewAll: "View all",
        prev: "Previous",
        next: "Next",
        paginationLabel: "Pagination",
		languageLoadError: "Could not load {language} content. Please try again."
    },
    es: {
        darkMode: "Modo oscuro",
        lightMode: "Modo claro",
        formRequired: "Este campo es obligatorio",
        formEmail: "Por favor, introduce un correo electrónico válido",
        formConsent: "Debes aceptar los términos",
        formSuccess: "¡Gracias! Tu mensaje ha sido enviado.",
        formError: "Lo sentimos, ha habido un problema al enviar tu mensaje.",
        newsletterSuccess: "¡Gracias por suscribirte!",
        newsletterError: "Error en la suscripción. Por favor, inténtalo de nuevo.",
        loading: "Cargando...",
        backToTop: "Volver arriba",
        menuOpen: "Abrir menú",
        menuClose: "Cerrar menú",
        cookieConsentText: "Este sitio web utiliza cookies para garantizar la mejor experiencia.",
        cookieAccept: "Aceptar",
        cookieDecline: "Rechazar",
        cookieSettings: "Configuración de cookies",
        languageSwitch: "Cambiar idioma",
        moreInfo: "Más información",
        readMore: "Leer más",
        sendMessage: "Enviar mensaje",
        subscribe: "Suscribirse",
        errorTitle: "Se ha producido un error",
        tryAgain: "Intentar de nuevo",
        close: "Cerrar",
        viewAll: "Ver todo",
        prev: "Anterior",
        next: "Siguiente",
        paginationLabel: "Paginación",
		languageLoadError: "No se pudo cargar el contenido en {language}. Por favor, inténtelo de nuevo."
    },
    it: {
        darkMode: "Modalità scura",
        lightMode: "Modalità chiara",
        formRequired: "Questo campo è obbligatorio",
        formEmail: "Si prega di inserire un indirizzo email valido",
        formConsent: "È necessario accettare i termini",
        formSuccess: "Grazie! Il tuo messaggio è stato inviato.",
        formError: "Siamo spiacenti, si è verificato un problema nell'invio del messaggio.",
        newsletterSuccess: "Grazie per l'iscrizione!",
        newsletterError: "Iscrizione fallita. Si prega di riprovare.",
        loading: "Caricamento in corso...",
        backToTop: "Torna all'inizio",
        menuOpen: "Apri menu",
        menuClose: "Chiudi menu",
        cookieConsentText: "Questo sito web utilizza i cookie per garantire la migliore esperienza.",
        cookieAccept: "Accetta",
        cookieDecline: "Rifiuta",
        cookieSettings: "Impostazioni cookie",
        languageSwitch: "Cambia lingua",
        moreInfo: "Maggiori informazioni",
        readMore: "Leggi di più",
        sendMessage: "Invia messaggio",
        subscribe: "Iscriviti",
        errorTitle: "Si è verificato un errore",
        tryAgain: "Riprova",
        close: "Chiudi",
        viewAll: "Vedi tutto",
        prev: "Precedente",
        next: "Successivo",
        paginationLabel: "Paginazione",
		languageLoadError: "Impossibile caricare il contenuto in {language}. Si prega di riprovare.",
    },
    fr: {
        darkMode: "Mode sombre",
        lightMode: "Mode clair",
        formRequired: "Ce champ est obligatoire",
        formEmail: "Veuillez entrer une adresse e-mail valide",
        formConsent: "Vous devez accepter les conditions",
        formSuccess: "Merci ! Votre message a été envoyé.",
        formError: "Désolé, un problème est survenu lors de l'envoi de votre message.",
        newsletterSuccess: "Merci pour votre abonnement !",
        newsletterError: "Échec de l'abonnement. Veuillez réessayer.",
        loading: "Chargement...",
        backToTop: "Retour en haut",
        menuOpen: "Ouvrir le menu",
        menuClose: "Fermer le menu",
        cookieConsentText: "Ce site web utilise des cookies pour vous garantir la meilleure expérience.",
        cookieAccept: "Accepter",
        cookieDecline: "Refuser",
        cookieSettings: "Paramètres des cookies",
        languageSwitch: "Changer de langue",
        moreInfo: "Plus d'informations",
        readMore: "Lire la suite",
        sendMessage: "Envoyer le message",
        subscribe: "S'abonner",
        errorTitle: "Une erreur s'est produite",
        tryAgain: "Réessayer",
        close: "Fermer",
        viewAll: "Voir tout",
        prev: "Précédent",
        next: "Suivant",
        paginationLabel: "Pagination",
		languageLoadError: "Impossible de charger le contenu en {language}. Veuillez réessayer."
    },
    de: {
        darkMode: "Dunkelmodus",
        lightMode: "Hellmodus",
        formRequired: "Dieses Feld ist erforderlich",
        formEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
        formConsent: "Sie müssen den Bedingungen zustimmen",
        formSuccess: "Vielen Dank! Ihre Nachricht wurde gesendet.",
        formError: "Entschuldigung, beim Senden Ihrer Nachricht ist ein Problem aufgetreten.",
        newsletterSuccess: "Vielen Dank für Ihre Anmeldung!",
        newsletterError: "Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.",
        loading: "Wird geladen...",
        backToTop: "Zurück nach oben",
        menuOpen: "Menü öffnen",
        menuClose: "Menü schließen",
        cookieConsentText: "Diese Website verwendet Cookies, um Ihnen die bestmögliche Erfahrung zu bieten.",
        cookieAccept: "Akzeptieren",
        cookieDecline: "Ablehnen",
        cookieSettings: "Cookie-Einstellungen",
        languageSwitch: "Sprache ändern",
        moreInfo: "Weitere Informationen",
        readMore: "Weiterlesen",
        sendMessage: "Nachricht senden",
        subscribe: "Abonnieren",
        errorTitle: "Ein Fehler ist aufgetreten",
        tryAgain: "Erneut versuchen",
        close: "Schließen",
        viewAll: "Alle anzeigen",
        prev: "Zurück",
        next: "Weiter",
        paginationLabel: "Seitennavigation",
		languageLoadError: "Konnte {language}-Inhalt nicht laden. Bitte versuchen Sie es erneut."
    },
    pt: {
        darkMode: "Modo escuro",
        lightMode: "Modo claro",
        formRequired: "Este campo é obrigatório",
        formEmail: "Por favor, insira um endereço de e-mail válido",
        formConsent: "Você deve concordar com os termos",
        formSuccess: "Obrigado! Sua mensagem foi enviada.",
        formError: "Desculpe, ocorreu um problema ao enviar sua mensagem.",
        newsletterSuccess: "Obrigado por se inscrever!",
        newsletterError: "Falha na inscrição. Por favor, tente novamente.",
        loading: "Carregando...",
        backToTop: "Voltar ao topo",
        menuOpen: "Abrir menu",
        menuClose: "Fechar menu",
        cookieConsentText: "Este site usa cookies para garantir a melhor experiência.",
        cookieAccept: "Aceitar",
        cookieDecline: "Recusar",
        cookieSettings: "Configurações de cookies",
        languageSwitch: "Mudar idioma",
        moreInfo: "Mais informações",
        readMore: "Leia mais",
        sendMessage: "Enviar mensagem",
        subscribe: "Inscrever-se",
        errorTitle: "Ocorreu um erro",
        tryAgain: "Tentar novamente",
        close: "Fechar",
        viewAll: "Ver tudo",
        prev: "Anterior",
        next: "Próximo",
        paginationLabel: "Paginação",
		languageLoadError: "Não foi possível carregar o conteúdo em {language}. Por favor, tente novamente."
    }
};
    
    // Currently loaded language strings
    let strings = { ...defaultStrings.en };
    let currentLang = document.documentElement.lang || CONFIG.defaultLanguage || 'en';
    let pendingLanguageLoads = new Map();
    
    // Load language file asynchronously
function loadLanguage(langCode) {
    // If we already have this language loaded or are currently loading it
    if (pendingLanguageLoads.has(langCode)) {
        return pendingLanguageLoads.get(langCode);
    }
    
    // If we already have this language cached
    if (defaultStrings[langCode]) {
        return Promise.resolve(defaultStrings[langCode]);
    }
    
    // Create a promise to load the language
    const langPromise = new Promise((resolve, reject) => {
        // Instead of fetching a JSON file, we should handle languages via
        // the HTML files that contain hardcoded translations
        
        // We'll resolve with the default strings, since the actual content
        // loading will happen through fetchLanguageContent
        const langStrings = { ...defaultStrings.en };
        defaultStrings[langCode] = langStrings;
        pendingLanguageLoads.delete(langCode);
        resolve(langStrings);
    });
    
    pendingLanguageLoads.set(langCode, langPromise);
    return langPromise;
}
    
    // Get string with optional substitutions
    function getString(key, substitutions = {}) {
        let text = strings[key] || defaultStrings.en[key] || key;
        
        // Handle substitutions
        if (Object.keys(substitutions).length > 0) {
            Object.entries(substitutions).forEach(([placeholder, value]) => {
                text = text.replace(new RegExp(`{${placeholder}}`, 'g'), value);
            });
        }
        
        return text;
    }
    
    // Initialize strings from inline script
    const scriptSelector = 'script[data-language-strings]';
    const stringsScript = document.querySelector(scriptSelector);
    
    if (stringsScript) {
        try {
            const scriptStrings = JSON.parse(stringsScript.textContent);
            
            // Merge with default strings
            Object.entries(scriptStrings).forEach(([lang, langStrings]) => {
                defaultStrings[lang] = { ...defaultStrings[lang] || {}, ...langStrings };
            });
            
            // Set current language strings
            strings = defaultStrings[currentLang] || defaultStrings.en;
        } catch (e) {
            console.error('Error parsing language strings:', e);
        }
    }
    
    // Return the public API
    return {
        get: getString,
        
        getLanguage: function() {
            return currentLang;
        },
        
        setLanguage: function(langCode) {
    if (!langCode || typeof langCode !== 'string') {
        return Promise.reject(new Error('Invalid language code'));
    }
    
    // Find if language is supported
    const langSupported = CONFIG.supportedLanguages.some(lang => lang.code === langCode);
    
    if (!langSupported) {
        return Promise.reject(new Error(`Language ${langCode} is not supported`));
    }
    
    // Update language without loading JSON files
    currentLang = langCode;
    strings = defaultStrings[langCode] || defaultStrings.en];
    
    // Update HTML lang attribute
    document.documentElement.lang = langCode;
    
    // Update text direction if needed
    const langInfo = CONFIG.supportedLanguages.find(lang => lang.code === langCode);
    if (langInfo && langInfo.dir) {
        document.documentElement.dir = langInfo.dir;
    }
    
    // Dispatch event for other components
    document.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: langCode }
    }));
    
    return Promise.resolve(strings);
},
        
        getAllLanguages: function() {
            return CONFIG.supportedLanguages;
        },
        
        translateElement: function(element) {
            if (!element) return;
            
            // Translate element with data-i18n attribute
            const key = element.getAttribute('data-i18n');
            if (key) {
                // Check for placeholders
                const placeholders = {};
                Array.from(element.attributes)
                    .filter(attr => attr.name.startsWith('data-i18n-param-'))
                    .forEach(attr => {
                        const param = attr.name.replace('data-i18n-param-', '');
                        placeholders[param] = attr.value;
                    });
                
                element.textContent = getString(key, placeholders);
            }
            
            // Handle placeholder attribute if present
            if (element.hasAttribute('data-i18n-placeholder')) {
                const placeholderKey = element.getAttribute('data-i18n-placeholder');
                element.setAttribute('placeholder', getString(placeholderKey));
            }
            
            // Handle title attribute if present
            if (element.hasAttribute('data-i18n-title')) {
                const titleKey = element.getAttribute('data-i18n-title');
                element.setAttribute('title', getString(titleKey));
            }
            
            // Handle aria-label attribute if present
            if (element.hasAttribute('data-i18n-aria-label')) {
                const ariaLabelKey = element.getAttribute('data-i18n-aria-label');
                element.setAttribute('aria-label', getString(ariaLabelKey));
            }
        },
        
        // Translate all elements with data-i18n attributes
        translatePage: function() {
            document.querySelectorAll('[data-i18n], [data-i18n-placeholder], [data-i18n-title], [data-i18n-aria-label]')
                .forEach(element => this.translateElement(element));
            
            // Update any dynamic content based on the loaded language
            document.dispatchEvent(new CustomEvent('translate', { 
                detail: { language: currentLang }
            }));
        }
    };
})();

/**
 * Media and device utilities
 */
const MediaUtil = (function() {
    // Cache media query results
    const mediaQueryCache = new Map();
    
    // Create a passive event listener for media query changes
    function addMediaQueryListener(query, callback) {
        const mediaQuery = window.matchMedia(query);
        
        // Initial check
        callback(mediaQuery.matches);
        
        // Use correct event listener method
        try {
            mediaQuery.addEventListener('change', (e) => callback(e.matches));
        } catch (e) {
            // Fallback for older browsers
            mediaQuery.addListener((e) => callback(e.matches));
        }
        
        return mediaQuery;
    }
    
    return {
        prefersReducedMotion: function() {
            if (!mediaQueryCache.has('reducedMotion')) {
                const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                mediaQueryCache.set('reducedMotion', prefersReduced);
                
                // Update cache when preference changes
                addMediaQueryListener('(prefers-reduced-motion: reduce)', (matches) => {
                    mediaQueryCache.set('reducedMotion', matches);
                });
            }
            
            return mediaQueryCache.get('reducedMotion');
        },
        
        prefersDarkMode: function() {
            if (!mediaQueryCache.has('darkMode')) {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                mediaQueryCache.set('darkMode', prefersDark);
                
                // Update cache when preference changes
                addMediaQueryListener('(prefers-color-scheme: dark)', (matches) => {
                    mediaQueryCache.set('darkMode', matches);
                });
            }
            
            return mediaQueryCache.get('darkMode');
        },
        
        prefersHighContrast: function() {
            if (!mediaQueryCache.has('highContrast')) {
                const prefersContrast = window.matchMedia('(prefers-contrast: more)').matches;
                mediaQueryCache.set('highContrast', prefersContrast);
                
                // Update cache when preference changes
                addMediaQueryListener('(prefers-contrast: more)', (matches) => {
                    mediaQueryCache.set('highContrast', matches);
                });
            }
            
            return mediaQueryCache.get('highContrast');
        },
        
        isMobile: function() {
            if (!mediaQueryCache.has('mobile')) {
                const isMobileSize = window.matchMedia('(max-width: 767px)').matches;
                mediaQueryCache.set('mobile', isMobileSize);
                
                // Update cache when window size changes
                addMediaQueryListener('(max-width: 767px)', (matches) => {
                    mediaQueryCache.set('mobile', matches);
                });
            }
            
            return mediaQueryCache.get('mobile');
        },
        
        isTablet: function() {
            if (!mediaQueryCache.has('tablet')) {
                const isTabletSize = window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches;
                mediaQueryCache.set('tablet', isTabletSize);
                
                // Update cache when window size changes
                addMediaQueryListener('(min-width: 768px) and (max-width: 1023px)', (matches) => {
                    mediaQueryCache.set('tablet', matches);
                });
            }
            
            return mediaQueryCache.get('tablet');
        },
        
        isDesktop: function() {
            if (!mediaQueryCache.has('desktop')) {
                const isDesktopSize = window.matchMedia('(min-width: 1024px)').matches;
                mediaQueryCache.set('desktop', isDesktopSize);
                
                // Update cache when window size changes
                addMediaQueryListener('(min-width: 1024px)', (matches) => {
                    mediaQueryCache.set('desktop', matches);
                });
            }
            
            return mediaQueryCache.get('desktop');
        },
        
        supportsWebP: function() {
            if (!mediaQueryCache.has('webp')) {
                // Feature detect WebP support
                const canvas = document.createElement('canvas');
                if (canvas.getContext && canvas.getContext('2d')) {
                    // If browser supports canvas, check if WebP rendering is supported
                    const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
                    mediaQueryCache.set('webp', supportsWebP);
                } else {
                    mediaQueryCache.set('webp', false);
                }
            }
            
            return mediaQueryCache.get('webp');
        },
        
        // Check for touch support
        hasTouch: function() {
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        }
    };
})();

/**
 * =========================================================
 * ACCESSIBILITY MODULE
 * =========================================================
 */
const Accessibility = (function() {
    let currentTrap = null;
    
    function getFocusableElements(container) {
        // More comprehensive selector for focusable elements
        return Array.from(container.querySelectorAll(
            'a[href]:not([disabled]):not([aria-hidden="true"]), ' +
            'button:not([disabled]):not([aria-hidden="true"]), ' +
            'input:not([disabled]):not([aria-hidden="true"]):not([type="hidden"]), ' +
            'select:not([disabled]):not([aria-hidden="true"]), ' +
            'textarea:not([disabled]):not([aria-hidden="true"]), ' +
            '[tabindex]:not([tabindex="-1"]):not([disabled]):not([aria-hidden="true"]), ' +
            '[contenteditable="true"]:not([disabled]):not([aria-hidden="true"])'
        )).filter(el => {
            // Additional checks for visibility
            const style = window.getComputedStyle(el);
            return el.offsetParent !== null && 
                   style.display !== 'none' && 
                   style.visibility !== 'hidden';
        });
    }
    
    function trapFocus(event, container) {
        if (event.key !== 'Tab') return;
        
        const focusables = getFocusableElements(container);
        if (focusables.length === 0) return;
        
        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];
        
        if (event.shiftKey && document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
        }
    }
    
    function handleKeydown(event) {
        if (!currentTrap) return;
        
        trapFocus(event, currentTrap.container);
        
        if (event.key === 'Escape' && currentTrap.onEscape) {
            currentTrap.onEscape();
            event.preventDefault();
        }
    }
    
    // Initialize accessibility features
    function init() {
        // Add global outline styles for keyboard users only
        const outlineStyleEl = document.createElement('style');
        outlineStyleEl.textContent = `
            body.using-mouse :focus { outline: none !important; }
            body:not(.using-mouse) a:focus, 
            body:not(.using-mouse) button:focus, 
            body:not(.using-mouse) input:focus, 
            body:not(.using-mouse) select:focus, 
            body:not(.using-mouse) textarea:focus, 
            body:not(.using-mouse) [tabindex]:focus {
                outline: 2px solid var(--focus-color, #4d90fe) !important;
                outline-offset: 2px !important;
            }
        `;
        document.head.appendChild(outlineStyleEl);
        
        // Detect interaction mode (mouse vs keyboard)
        document.body.classList.add('using-mouse');
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                document.body.classList.remove('using-mouse');
            }
        });
        
        document.addEventListener('mousedown', function() {
            document.body.classList.add('using-mouse');
        });
        
        document.addEventListener('touchstart', function() {
            document.body.classList.add('using-mouse');
        });
        
        // Add screen reader announcer for dynamic content
        const announcer = document.createElement('div');
        announcer.id = 'sr-announcer';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.classList.add('sr-only');
        document.body.appendChild(announcer);
        
        // Add skip links if they don't exist
        if (!document.querySelector('.skip-to-main')) {
            const skipLink = document.createElement('a');
            skipLink.href = '#main';
            skipLink.className = 'skip-to-main sr-only sr-only-focusable';
            skipLink.textContent = 'Skip to main content';
            document.body.insertBefore(skipLink, document.body.firstChild);
            
            skipLink.addEventListener('click', function(e) {
                e.preventDefault();
                const mainContent = document.getElementById('main') || document.querySelector('main');
                if (mainContent) {
                    mainContent.setAttribute('tabindex', '-1');
                    mainContent.focus();
                    
                    // Remove tabindex after focus
                    setTimeout(() => {
                        mainContent.removeAttribute('tabindex');
                    }, 1000);
                }
            });
        }
    }
    
    return {
        init,
        
        activate: function(container, trigger, onEscape) {
            if (currentTrap) this.deactivate();
            
            currentTrap = { container, trigger, onEscape };
            document.addEventListener('keydown', handleKeydown);
            
            // Set aria-modal on the container
            if (container.getAttribute('role') === 'dialog') {
                container.setAttribute('aria-modal', 'true');
            }
            
            const focusables = getFocusableElements(container);
            if (focusables.length > 0) {
                setTimeout(() => focusables[0].focus(), 50);
            }
        },
        
        deactivate: function() {
            if (!currentTrap) return;
            
            document.removeEventListener('keydown', handleKeydown);
            
            if (currentTrap.container.getAttribute('role') === 'dialog') {
                currentTrap.container.setAttribute('aria-modal', 'false');
            }
            
            if (currentTrap.trigger && !currentTrap.trigger.closest('[aria-hidden="true"]')) {
                currentTrap.trigger.focus();
            }
            
            currentTrap = null;
        },
        
        announce: function(message, assertive = false) {
            const announcer = document.getElementById('sr-announcer');
            if (!announcer) return;
            
            announcer.setAttribute('aria-live', assertive ? 'assertive' : 'polite');
            announcer.textContent = '';
            
            // Force browser to register the emptying of the div
            setTimeout(() => {
                announcer.textContent = message;
            }, 50);
        },
        
        getFocusableElements
    };
})();

/**
 * =========================================================
 * THEME MODULE (Dark/Light Mode)
 * =========================================================
 */
const Theme = (function() {
    // Theme constants
    const THEME_STORAGE_KEY = 'site_theme';
    const THEMES = {
        LIGHT: 'light',
        DARK: 'dark',
        AUTO: 'auto'
    };
    
    // Current theme state
    let currentTheme = THEMES.LIGHT;
    let hasInitialized = false;
    
    // Theme change event
    const themeChangeEvent = new CustomEvent('themeChanged', {
        detail: { theme: currentTheme },
        bubbles: true
    });
    
    // Get the user's preferred theme from storage or system
    function getPreferredTheme() {
        const savedTheme = StorageUtil.get(THEME_STORAGE_KEY);
        
        if (savedTheme === THEMES.DARK || savedTheme === THEMES.LIGHT) {
            return savedTheme;
        }
        
        if (savedTheme === THEMES.AUTO || !savedTheme) {
            return MediaUtil.prefersDarkMode() ? THEMES.DARK : THEMES.LIGHT;
        }
        
        return THEMES.LIGHT; // Default to light mode
    }
    
    // Apply theme to document and toggle button states
    function applyTheme(theme, updateStorage = true) {
        // Store the current theme
        currentTheme = theme;
        
        const isDark = theme === THEMES.DARK || 
                      (theme === THEMES.AUTO && MediaUtil.prefersDarkMode());
        
        // Update document classes
        document.documentElement.classList.toggle('dark', isDark);
        document.documentElement.classList.toggle('light', !isDark);
        
        // Update data attributes for CSS variables control
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        
        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute(
                'content', 
                isDark ? 'var(--dark-bg, #121212)' : 'var(--light-bg, #ffffff)'
            );
        }
        
        // Update toggle buttons
        updateToggleButtons(isDark);
        
        // Save theme preference if requested
        if (updateStorage) {
            StorageUtil.set(THEME_STORAGE_KEY, theme);
        }
        
        // Dispatch theme change event
        document.dispatchEvent(themeChangeEvent);
        
        // Update theme-specific images if present
        updateThemeImages(isDark);
        
        return isDark;
    }
    
    // Toggle between light and dark themes
    function toggleTheme() {
        const currentlyDark = document.documentElement.classList.contains('dark');
        const newTheme = currentlyDark ? THEMES.LIGHT : THEMES.DARK;
        
        return applyTheme(newTheme);
    }
    
    // Update toggle button states
    function updateToggleButtons(isDark) {
        // Find all toggle buttons by attributes or IDs
        const toggleButtons = [
            ...document.querySelectorAll('[data-theme-toggle], .theme-toggle'),
            document.getElementById('dark-mode-toggle'),
            document.getElementById('mobile-dark-mode-toggle'),
            document.getElementById('dark-mode-toggle-float')
        ].filter(Boolean);
        
        toggleButtons.forEach(toggle => {
            // Update aria state
            toggle.setAttribute('aria-pressed', isDark);
            
            // Update toggle text if present
            const textElement = toggle.querySelector('.dark-mode-text, .theme-toggle-text');
            if (textElement) {
                textElement.textContent = isDark ? I18n.get('lightMode') : I18n.get('darkMode');
            }
            
            // Update toggle icons if present
            const iconDark = toggle.querySelector('.icon-dark, .icon-moon');
            const iconLight = toggle.querySelector('.icon-light, .icon-sun');
            
            if (iconDark) iconDark.classList.toggle('hidden', isDark);
            if (iconLight) iconLight.classList.toggle('hidden', !isDark);
        });
    }
    
    // Update theme-specific images
    function updateThemeImages(isDark) {
        // Update images with theme-specific sources
        document.querySelectorAll('[data-light-src][data-dark-src]').forEach(img => {
            const currentSrc = img.getAttribute('src');
            const lightSrc = img.getAttribute('data-light-src');
            const darkSrc = img.getAttribute('data-dark-src');
            const targetSrc = isDark ? darkSrc : lightSrc;
            
            // Only update if needed
            if (currentSrc !== targetSrc) {
                img.setAttribute('src', targetSrc);
            }
        });
        
        // Update inline SVGs with theme-specific classes
        document.querySelectorAll('svg.theme-aware').forEach(svg => {
            svg.classList.toggle('svg-dark', isDark);
            svg.classList.toggle('svg-light', !isDark);
        });
    }
    
    // Set up theme preference listeners
    function setupListeners() {
        // Desktop toggle
        document.querySelectorAll('#dark-mode-toggle, [data-theme-toggle], .theme-toggle').forEach(toggle => {
            if (toggle) {
                toggle.addEventListener('click', toggleTheme);
            }
        });
        
        // System preference change
        try {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = e => {
                const savedTheme = StorageUtil.get(THEME_STORAGE_KEY);
                
                if (!savedTheme || savedTheme === THEMES.AUTO) {
                    applyTheme(THEMES.AUTO, false);
                }
            };
            
            // Use the appropriate event listener method
            try {
                mediaQuery.addEventListener('change', handleChange);
            } catch (e) {
                // Fall back to the deprecated method for older browsers
                mediaQuery.addListener(handleChange);
            }
        } catch (e) {
            console.warn('Browser doesn\'t support prefers-color-scheme media query', e);
        }
    }
    
    return {
        init: function() {
            if (hasInitialized) return;
            
            // Only initialize if feature is enabled
            if (!CONFIG.features.darkMode) {
                document.documentElement.classList.add('light');
                document.documentElement.setAttribute('data-theme', 'light');
                hasInitialized = true;
                return;
            }
            
            applyTheme(getPreferredTheme());
            setupListeners();
            hasInitialized = true;
        },
        
        toggle: toggleTheme,
        
        setTheme: function(theme) {
            if (theme === THEMES.LIGHT || theme === THEMES.DARK || theme === THEMES.AUTO) {
                return applyTheme(theme);
            }
            return false;
        },
        
        getTheme: function() {
            return currentTheme;
        },
        
        isDark: function() {
            return document.documentElement.classList.contains('dark');
        }
    };
})();

/**
 * =========================================================
 * HEADER & NAVIGATION MODULE
 * =========================================================
 */
const Header = (function() {
    let isMobileMenuOpen = false;
    let lastScrollY = 0;
    let headerHeight = 0;
    let isInitialized = false;
    
    // Handle scroll effects for the header
    function handleScroll() {
        const header = document.getElementById('header');
        if (!header) return;
        
        const currentScrollY = window.scrollY;
        
        // Handle scrolled class for styling
        const isScrolled = currentScrollY > CONFIG.headerScrollThreshold;
        header.classList.toggle('scrolled', isScrolled);
        
        // Add auto-hide functionality on scroll down, show on scroll up
        if (header.classList.contains('auto-hide')) {
            // Ignore small movements to prevent jitter
            if (Math.abs(currentScrollY - lastScrollY) < 10) return;
            
            // If scrolling down and past threshold, hide the header
            if (currentScrollY > lastScrollY && currentScrollY > headerHeight) {
                header.classList.add('header-hidden');
            } else {
                header.classList.remove('header-hidden');
            }
            
            lastScrollY = currentScrollY;
        }
    }
    
    // Toggle mobile menu visibility
    function toggleMobileMenu(forceClose = false) {
        const mobileMenu = document.getElementById('mobile-menu');
        const menuBtn = document.getElementById('mobile-menu-btn');
        const overlay = document.getElementById('menu-overlay');
        
        if (!mobileMenu || !menuBtn) return;
        
        const shouldOpen = !forceClose && !isMobileMenuOpen;
        
        // Update menu state
        isMobileMenuOpen = shouldOpen;
        
        // Update ARIA attributes
        menuBtn.setAttribute('aria-expanded', shouldOpen);
        
        // Update button icons if present
        const iconOpen = menuBtn.querySelector('.icon-open, .icon-menu');
        const iconClose = menuBtn.querySelector('.icon-close');
        
        if (iconOpen && iconClose) {
            iconOpen.classList.toggle('hidden', shouldOpen);
            iconClose.classList.toggle('hidden', !shouldOpen);
        }
        
        // Apply transitions for smooth animation
        if (shouldOpen) {
            // Create overlay for mobile menu if it doesn't exist
            if (!overlay && shouldOpen) {
                const newOverlay = document.createElement('div');
                newOverlay.id = 'menu-overlay';
                newOverlay.className = 'fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity opacity-0';
                newOverlay.setAttribute('aria-hidden', 'true');
                document.body.appendChild(newOverlay);
                
                // Fade in overlay
                setTimeout(() => {
                    newOverlay.classList.replace('opacity-0', 'opacity-100');
                }, 10);
                
                // Close menu when clicking overlay
                newOverlay.addEventListener('click', () => toggleMobileMenu(true));
            }
            
            // Show menu with animation
            mobileMenu.classList.remove('hidden');
            
            // Force a reflow before adding transitions
            void mobileMenu.offsetWidth;
            
            // Apply transition
            mobileMenu.style.transform = 'translateX(0)';
            mobileMenu.style.opacity = '1';
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            
            // Set up focus trap for accessibility
            Accessibility.activate(mobileMenu, menuBtn, () => toggleMobileMenu(true));
        } else {
            // Hide menu with animation
            mobileMenu.style.transform = 'translateX(-100%)';
            mobileMenu.style.opacity = '0';
            
            // Return normal scrolling
            document.body.style.overflow = '';
            
            // Release focus trap
            Accessibility.deactivate();
            
            // Hide overlay with animation
            if (overlay) {
                overlay.classList.replace('opacity-100', 'opacity-0');
                
                // Remove after animation completes
                setTimeout(() => {
                    if (overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }
                }, 300);
            }
            
            // Hide menu element after animation completes
            setTimeout(() => {
                if (!isMobileMenuOpen) {
                    mobileMenu.classList.add('hidden');
                }
            }, 300);
        }
    }
    
    /**
     * Enhanced language dropdown functionality with AJAX loading
     */
    function setupLanguageDropdowns() {
        // Toggle language dropdown visibility
        document.querySelectorAll('#lang-toggle, #mobile-lang-toggle').forEach(toggle => {
            if (!toggle) return;
            
            toggle.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent event bubbling
                
                const targetId = this.getAttribute('aria-controls');
                const target = document.getElementById(targetId);
                
                if (!target) return;
                
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', !isExpanded);
                
                if (isExpanded) {
                    target.classList.add('hidden');
                    target.setAttribute('aria-hidden', 'true');
                } else {
                    target.classList.remove('hidden');
                    target.setAttribute('aria-hidden', 'false');
                    
                    // Close dropdown when clicking outside
                    const closeDropdown = (evt) => {
                        if (!target.contains(evt.target) && evt.target !== toggle) {
                            target.classList.add('hidden');
                            target.setAttribute('aria-hidden', 'true');
                            this.setAttribute('aria-expanded', 'false');
                            document.removeEventListener('click', closeDropdown);
                        }
                    };
                    
                    // Add event listener with a slight delay to avoid immediate trigger
                    setTimeout(() => {
                        document.addEventListener('click', closeDropdown);
                    }, 0);
                }
            });
        });
        
        // Handle language selection with enhanced AJAX content loading
        document.querySelectorAll('#lang-menu a, #mobile-lang-menu a').forEach(link => {
            if (!link) return;
            
            link.addEventListener('click', function(e) {
    e.preventDefault(); // Prevent default navigation
    
    // Get the language code
    const langCode = this.getAttribute('hreflang') || this.getAttribute('lang');
    if (!langCode) {
        console.error('Language link missing hreflang or lang attribute');
        return;
    }
    
    // Check if already on this language
    if (document.documentElement.lang === langCode) {
        // Close the language menu
        closeLanguageMenus();
        return;
    }
    
    // Save current page state
    const pageState = capturePageState();
    
    // Construct the new URL with the selected language
    const currentUrl = window.location.pathname;
    let newUrl = currentUrl.replace(/\/[a-z]{2}\//, `/${langCode}/`);
    if (!newUrl.includes(`/${langCode}/`)) {
        // If no language code in URL, add it
        newUrl = `/${langCode}${currentUrl}`;
    }
    
    // Maintain hash and query parameters if present
    let queryAndHash = '';
    if (window.location.search) {
        queryAndHash += window.location.search;
    }
    if (window.location.hash) {
        queryAndHash += window.location.hash;
    }
    newUrl += queryAndHash;
    
    // Update URL without reloading page
    try {
        window.history.pushState({ 
            scrollY: pageState.scrollPosition, 
            language: langCode
        }, '', newUrl);
    } catch (e) {
        console.warn('History API not supported, falling back to URL replacement');
        window.location.href = newUrl;
        return;
    }
    
    // Update the lang attribute on the HTML element
    document.documentElement.lang = langCode;
    
    // Update displayed language in the UI
    document.querySelectorAll('.lang-text').forEach(el => {
        el.textContent = langCode.toUpperCase();
    });
    
    // Update any language flags or indicators
    document.querySelectorAll('.lang-flag').forEach(flag => {
        const newFlag = CONFIG.supportedLanguages.find(lang => lang.code === langCode)?.flag || '';
        if (newFlag) flag.textContent = newFlag;
    });
    
    // Close the language menu
    closeLanguageMenus();
    
    // Show loading indicator with improved positioning
    const loader = createLoader();
    loader.setAttribute('aria-label', I18n.get('loading'));
    loader.setAttribute('role', 'status');
    
    // Add a translucent overlay for a better UX during lengthy loads
    const overlay = createOverlay();
    
    // Start loading with a minimum display time to prevent flickering for fast connections
    const loadStartTime = Date.now();
    
    // Skip the I18n.setLanguage call that's failing and directly fetch content
    // Use a direct fetch approach that doesn't rely on JSON files
    
    // Set up a timeout fallback in case the fetch takes too long
    const fallbackTimeout = setTimeout(() => {
        console.warn("Language loading taking too long, falling back to direct navigation");
        window.location.href = `/${langCode}/`;
    }, 10000); // 10 second timeout
    
    // Directly fetch the HTML content from the language directory
    fetch(`/${langCode}/`, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'text/html',
            'X-Language-Switch': 'true'
        },
        cache: 'no-store'
    })
    .then(response => {
        clearTimeout(fallbackTimeout);
        
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        
        return response.text();
    })
    .then(html => {
        // Parse HTML
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(html, 'text/html');
        
        // Update content
        const currentMain = document.querySelector('main');
        const newMain = newDoc.querySelector('main');
        
        if (currentMain && newMain) {
            currentMain.innerHTML = newMain.innerHTML;
        }
        
        // Update document title
        document.title = newDoc.title;
        
        // Ensure proper directionality
        const langInfo = CONFIG.supportedLanguages.find(lang => lang.code === langCode);
        if (langInfo && langInfo.dir) {
            document.documentElement.dir = langInfo.dir;
        }
        
        // Ensure the loader stays visible for at least 300ms for better UX
        const elapsedTime = Date.now() - loadStartTime;
        const minDisplayTime = 300;
        
        if (elapsedTime < minDisplayTime) {
            return new Promise(resolve => {
                setTimeout(resolve, minDisplayTime - elapsedTime);
            });
        }
    })
    .then(() => {
        // Remove loader and overlay with fade-out animation
        loader.classList.add('fade-out');
        overlay.classList.add('fade-out');
        
        setTimeout(() => {
            loader.remove();
            overlay.remove();
            
            // Reinitialize any necessary components
            if (typeof initWebsite === 'function') {
                initWebsite();
            }
            
            // Announce language change to screen readers
            const langName = CONFIG.supportedLanguages.find(l => l.code === langCode)?.name || langCode;
            Accessibility.announce(`Switched to ${langName}`);
        }, 300);
    })
    .catch(error => {
        clearTimeout(fallbackTimeout);
        console.error('Language switching failed:', error);
        
        // Remove loader and overlay with fade-out
        loader.classList.add('fade-out');
        overlay.classList.add('fade-out');
        
        setTimeout(() => {
            loader.remove();
            overlay.remove();
            
            // Instead of showing error message, just navigate directly
            window.location.href = `/${langCode}/`;
        }, 300);
    });
    
    console.log(`Language switching initiated: ${langCode}, preserving page state`);
});
        });
        
        // Add dedicated listener for popstate to handle browser back/forward navigation
        window.addEventListener('popstate', function(event) {
            if (event.state) {
                // Handle language change if URL contains language code
                const urlLangMatch = window.location.pathname.match(/\/([a-z]{2})\//);
                if (urlLangMatch && urlLangMatch[1]) {
                    const langCode = urlLangMatch[1];
                    
                    // Only reload if language actually changed
                    if (document.documentElement.lang !== langCode) {
                        // Create state object to preserve scroll
                        const pageState = {
                            scrollPosition: event.state.scrollY || 0,
                            formData: captureFormData(),
                            activeElements: captureActiveElements(),
                            expandedElements: captureExpandedElements(),
                            tabStates: captureTabStates()
                        };
                        
                        // Show loading indicator
                        const loader = createLoader();
                        const overlay = createOverlay();
                        
                        // Update language using I18n module
                        I18n.setLanguage(langCode)
                            .then(() => {
                                // Apply translations
                                I18n.translatePage();
                                
                                // Fetch content for the language in the URL
                                return fetchLanguageContent(window.location.href, langCode, pageState);
                            })
                            .then(() => {
                                // Hide and remove loader with animation
                                loader.classList.add('fade-out');
                                overlay.classList.add('fade-out');
                                
                                setTimeout(() => {
                                    loader.remove();
                                    overlay.remove();
                                }, 300);
                            })
                            .catch(error => {
                                console.error('Language switching failed during navigation:', error);
                                
                                // Hide loader and show error
                                loader.classList.add('fade-out');
                                overlay.classList.add('fade-out');
                                
                                setTimeout(() => {
                                    loader.remove();
                                    overlay.remove();
                                    showLanguageSwitchError(langCode);
                                }, 300);
                            });
                    } else {
                        // Just restore scroll position if language didn't change
                        if (typeof event.state.scrollY === 'number') {
                            window.scrollTo(0, event.state.scrollY);
                        }
                    }
                } else {
                    // Regular navigation, restore scroll position
                    if (typeof event.state.scrollY === 'number') {
                        window.scrollTo(0, event.state.scrollY);
                    }
                }
            }
        });
    }
    
    /**
     * Close all language menus
     */
    function closeLanguageMenus() {
        const toggles = document.querySelectorAll('#lang-toggle[aria-expanded="true"], #mobile-lang-toggle[aria-expanded="true"]');
        toggles.forEach(toggle => {
            toggle.setAttribute('aria-expanded', 'false');
            const menuId = toggle.getAttribute('aria-controls');
            const menu = document.getElementById(menuId);
            if (menu) {
                menu.classList.add('hidden');
                menu.setAttribute('aria-hidden', 'true');
            }
        });
    }
    
    /**
     * Create and append a loading indicator with improved styling
     */
    function createLoader() {
        // First, remove any existing loaders
        const existingLoader = document.getElementById('language-loader');
        if (existingLoader) existingLoader.remove();
        
        // Create new loader
        const loader = document.createElement('div');
        loader.id = 'language-loader';
        loader.classList.add('fixed', 'top-0', 'left-0', 'w-full', 'h-1', 'bg-primary-600', 'z-50', 'language-loader');
        
        // Create primary loading bar with shine effect
        const bar = document.createElement('div');
        bar.classList.add('h-full', 'loading-bar-progress');
        
        // Add animation keyframes to document if they don't exist
        if (!document.getElementById('language-loader-styles')) {
            const style = document.createElement('style');
            style.id = 'language-loader-styles';
            style.textContent = `
                .language-loader {
                    overflow: hidden;
                    transition: opacity 0.3s ease;
                }
                .language-loader.fade-out {
                    opacity: 0;
                }
                .loading-bar-progress {
                    width: 100%;
                    transform-origin: left;
                    background: linear-gradient(90deg, var(--primary-600, #2563eb) 0%, var(--primary-400, #60a5fa) 50%, var(--primary-600, #2563eb) 100%);
                    background-size: 200% 100%;
                    animation: loading-bar-anim 2s infinite ease-in-out, loading-bar-progress 15s ease-in-out forwards;
                    position: relative;
                }
                @keyframes loading-bar-anim {
                    0% { background-position: 0% 0%; }
                    100% { background-position: 200% 0%; }
                }
                @keyframes loading-bar-progress {
                    0% { transform: scaleX(0); }
                    10% { transform: scaleX(0.3); }
                    30% { transform: scaleX(0.6); }
                    60% { transform: scaleX(0.8); }
                    85% { transform: scaleX(0.92); }
                    100% { transform: scaleX(0.98); }
                }
                .overlay-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(255, 255, 255, 0.3);
                    backdrop-filter: blur(2px);
                    z-index: 49;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    pointer-events: none;
                }
                .dark .overlay-container {
                    background-color: rgba(0, 0, 0, 0.3);
                }
                .overlay-container.visible {
                    opacity: 1;
                }
                .overlay-container.fade-out {
                    opacity: 0;
                }
                .language-error-message {
                    position: fixed;
                    top: 20%;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    padding: 1.5rem;
                    z-index: 1000;
                    max-width: 90%;
                    width: 450px;
                    text-align: center;
                    animation: slide-in 0.3s ease-out forwards;
                }
                .dark .language-error-message {
                    background-color: #1f2937;
                    color: white;
                }
                @keyframes slide-in {
                    0% { transform: translate(-50%, -20px); opacity: 0; }
                    100% { transform: translate(-50%, 0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        loader.appendChild(bar);
        document.body.appendChild(loader);
        return loader;
    }
    
    /**
     * Create a translucent overlay for better UX during loading
     */
    function createOverlay() {
        // First, remove any existing overlay
        const existingOverlay = document.getElementById('language-switch-overlay');
        if (existingOverlay) existingOverlay.remove();
        
        // Create new overlay
        const overlay = document.createElement('div');
        overlay.id = 'language-switch-overlay';
        overlay.classList.add('overlay-container');
        
        // Add to DOM
        // Add to DOM
        document.body.appendChild(overlay);
        
        // Trigger reflow to ensure animation works
        overlay.offsetWidth;
        
        // Show overlay with animation
        overlay.classList.add('visible');
        
        return overlay;
    }
    
/**
 * Show improved error message when language switching fails
 */
function showLanguageSwitchError(langCode) {
    // Get language name
    const langName = CONFIG.supportedLanguages.find(lang => lang.code === langCode)?.name || langCode;
    
    // Create error message container
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('language-error-message');
    messageContainer.setAttribute('role', 'alert');
    
    // Create error content with more helpful information
    messageContainer.innerHTML = `
        <div class="text-red-600 dark:text-red-400 text-xl mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-block mr-2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            ${I18n.get('errorTitle')}
        </div>
        <p class="mb-4">${I18n.get('languageLoadError').replace('{language}', langName)}</p>
        <p class="mb-4">Try refreshing the page or using the direct URL: /${langCode}/</p>
        <div class="flex justify-center gap-2">
            <button id="language-error-direct-link" class="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                Go to ${langName} Version
            </button>
            <button id="language-error-close" class="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
                ${I18n.get('close')}
            </button>
        </div>
    `;
    
    // Add to DOM
    document.body.appendChild(messageContainer);
    
    // Add to modal management for screen readers
    Accessibility.announce(I18n.get('languageLoadError', { language: langName }), true);
    
    // Handle buttons
    const directLinkBtn = document.getElementById('language-error-direct-link');
    const closeBtn = document.getElementById('language-error-close');
    
    if (directLinkBtn) {
        directLinkBtn.addEventListener('click', () => {
            // Navigate directly to the language version
            window.location.href = `/${langCode}/`;
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            messageContainer.remove();
        });
    }
    
    // Add keyboard handling
    messageContainer.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            messageContainer.remove();
        }
    });
    
    // Auto-close after 10 seconds
    setTimeout(() => {
        if (document.body.contains(messageContainer)) {
            messageContainer.style.opacity = '0';
            messageContainer.style.transform = 'translate(-50%, -20px)';
            messageContainer.style.transition = 'opacity 0.3s, transform 0.3s';
            
            setTimeout(() => {
                if (document.body.contains(messageContainer)) {
                    messageContainer.remove();
                }
            }, 300);
        }
    }, 10000);
}
    
    /**
     * Capture current page state before language switch
     */
    function capturePageState() {
        return {
            scrollPosition: window.scrollY,
            formData: captureFormData(),
            activeElements: captureActiveElements(),
            expandedElements: captureExpandedElements(),
            tabStates: captureTabStates(),
            modalStates: captureModalStates(),
            videoStates: captureVideoStates(),
            sliderPositions: captureSliderPositions()
        };
    }
    
    /**
     * Capture form data from all forms on the page
     */
    function captureFormData() {
        const forms = document.querySelectorAll('form');
        const formData = [];
        
        forms.forEach(form => {
            const data = {
                id: form.id || null,
                selector: getUniqueSelector(form),
                values: {},
                checkedRadios: {},
                checkedCheckboxes: {},
                fileInputs: {},
                selects: {},
                textareas: {}
            };
            
            // Capture text inputs
            form.querySelectorAll('input:not([type="radio"]):not([type="checkbox"]):not([type="file"])').forEach(input => {
                if (input.name) {
                    data.values[input.name] = input.value;
                } else if (input.id) {
                    data.values[`#${input.id}`] = input.value;
                }
            });
            
            // Capture radio buttons
            form.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
                if (radio.name) {
                    data.checkedRadios[radio.name] = radio.value;
                }
            });
            
            // Capture checkboxes
            form.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                if (checkbox.name) {
                    data.checkedCheckboxes[checkbox.name] = checkbox.checked;
                } else if (checkbox.id) {
                    data.checkedCheckboxes[`#${checkbox.id}`] = checkbox.checked;
                }
            });
            
            // Capture file inputs (just store if files are selected, can't transfer files)
            form.querySelectorAll('input[type="file"]').forEach(fileInput => {
                if (fileInput.name) {
                    data.fileInputs[fileInput.name] = fileInput.files.length > 0;
                } else if (fileInput.id) {
                    data.fileInputs[`#${fileInput.id}`] = fileInput.files.length > 0;
                }
            });
            
            // Capture select elements
            form.querySelectorAll('select').forEach(select => {
                if (select.name) {
                    if (select.multiple) {
                        data.selects[select.name] = Array.from(select.selectedOptions).map(option => option.value);
                    } else {
                        data.selects[select.name] = select.value;
                    }
                } else if (select.id) {
                    if (select.multiple) {
                        data.selects[`#${select.id}`] = Array.from(select.selectedOptions).map(option => option.value);
                    } else {
                        data.selects[`#${select.id}`] = select.value;
                    }
                }
            });
            
            // Capture textareas
            form.querySelectorAll('textarea').forEach(textarea => {
                if (textarea.name) {
                    data.textareas[textarea.name] = textarea.value;
                } else if (textarea.id) {
                    data.textareas[`#${textarea.id}`] = textarea.value;
                }
            });
            
            formData.push(data);
        });
        
        return formData;
    }
    
    /**
     * Capture active navigation links and tabs
     */
    function captureActiveElements() {
        return Array.from(document.querySelectorAll('a.active, [aria-current="page"], .nav-link.active'))
            .map(el => ({
                selector: getUniqueSelector(el),
                href: el.getAttribute('href'),
                ariaCurrent: el.getAttribute('aria-current'),
                dataTab: el.getAttribute('data-tab')
            }));
    }
    
    /**
     * Capture expanded UI elements like accordions and dropdowns
     */
    function captureExpandedElements() {
        return Array.from(document.querySelectorAll('[aria-expanded="true"]'))
            .map(el => ({
                selector: getUniqueSelector(el),
                controls: el.getAttribute('aria-controls')
            }));
    }
    
    /**
     * Capture state of tab panels
     */
    function captureTabStates() {
        const tabContainers = document.querySelectorAll('.tabs-nav, .tab-container');
        const tabStates = [];
        
        tabContainers.forEach(container => {
            const activeTab = container.querySelector('.tab-btn.active, [role="tab"][aria-selected="true"]');
            
            if (activeTab) {
                tabStates.push({
                    containerSelector: getUniqueSelector(container),
                    activeTabSelector: getUniqueSelector(activeTab),
                    activeTabId: activeTab.id,
                    activeTabTarget: activeTab.getAttribute('data-target') || activeTab.getAttribute('aria-controls')
                });
            }
        });
        
        return tabStates;
    }
    
    /**
     * Capture open modal states
     */
    function captureModalStates() {
        return Array.from(document.querySelectorAll('.modal-container:not(.hidden), [role="dialog"]:not(.hidden)'))
            .map(modal => ({
                selector: getUniqueSelector(modal),
                id: modal.id
            }));
    }
    
    /**
     * Capture video player states
     */
    function captureVideoStates() {
        return Array.from(document.querySelectorAll('video'))
            .map(video => ({
                selector: getUniqueSelector(video),
                currentTime: video.currentTime,
                paused: video.paused,
                volume: video.volume,
                muted: video.muted
            }));
    }

	/**
     * Capture slider positions for carousels
     */
    function captureSliderPositions() {
        const sliders = [];
        
        // Capture Swiper slider positions
        document.querySelectorAll('.swiper').forEach(slider => {
            if (slider.swiper) {
                sliders.push({
                    selector: getUniqueSelector(slider),
                    type: 'swiper',
                    activeIndex: slider.swiper.activeIndex,
                    realIndex: slider.swiper.realIndex
                });
            }
        });
        
        return sliders;
    }
    
    /**
     * Fetch the content for the new language using AJAX
     */
    function fetchLanguageContent(url, langCode, pageState) {
    // Use AbortController for timeout capability
    const controller = new AbortController();
    const signal = controller.signal;
    
    // Set a timeout for the fetch
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
    
    // Ensure we're fetching from the correct language folder
    // Make sure the URL includes the language code
    let fetchUrl = url;
    if (!fetchUrl.includes(`/${langCode}/`)) {
        fetchUrl = `/${langCode}/`;
    }
    
    return fetch(fetchUrl, { 
        signal,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'text/html',
            'X-Language-Switch': 'true' // Custom header to identify language switch requests
        },
        cache: 'no-store' // Always fetch fresh content
    })
    .then(response => {
        clearTimeout(timeoutId);
        
        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        
        // Check content type to ensure we're getting HTML
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('text/html')) {
            throw new Error(`Expected HTML but got ${contentType}`);
        }
        
        return response.text();
    })
    .then(html => {
        // Parse the HTML response
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(html, 'text/html');
        
        // Validate parsed document
        if (newDoc.documentElement.querySelector('parsererror')) {
            throw new Error('Failed to parse the HTML response');
        }
        
        // Update page title and metadata
        updateDocumentMetadata(newDoc);
        
        // Update page content
        updatePageContent(newDoc, pageState);
        
        // Restore scroll position
        if (pageState.scrollPosition !== undefined) {
            window.scrollTo(0, pageState.scrollPosition);
        }
        
        // Dispatch a language change event to notify other components
        const event = new CustomEvent('languageChanged', { 
            detail: { 
                language: langCode,
                previousLanguage: document.documentElement.lang
            }
        });
        document.dispatchEvent(event);
        
        // No need to update I18n strings, we're using the full HTML content
        
        // Reinitialize components
        return reinitializeComponentsAfterLanguageChange(newDoc, pageState);
    })
    .catch(error => {
        clearTimeout(timeoutId);
        
        // Enhanced error handling
        if (error.name === 'AbortError') {
            console.error('Language content fetch timed out');
            throw new Error('The request timed out. Please check your internet connection and try again.');
        }
        
        // Try fallback approach for browsers without proper fetch support
        if (typeof XMLHttpRequest !== 'undefined' && error.message.includes('Failed to fetch')) {
            return fetchWithXHRFallback(url, langCode, pageState);
        }
        
        console.error('Error fetching language content:', error);
        throw error;
    });
}
    
    /**
     * Fallback to XMLHttpRequest for older browsers
     */
    function fetchWithXHRFallback(url, langCode, pageState) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.setRequestHeader('X-Language-Switch', 'true');
            xhr.timeout = 20000; // 20 second timeout
            
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const html = xhr.responseText;
                    
                    // Parse the HTML response
                    const parser = new DOMParser();
                    const newDoc = parser.parseFromString(html, 'text/html');
                    
                    // Update page title and metadata
                    updateDocumentMetadata(newDoc);
                    
                    // Update page content
                    updatePageContent(newDoc, pageState);
                    
                    // Restore scroll position
                    if (pageState.scrollPosition !== undefined) {
                        window.scrollTo(0, pageState.scrollPosition);
                    }
                    
                    // Dispatch language change event
                    const event = new CustomEvent('languageChanged', { 
                        detail: { 
                            language: langCode,
                            previousLanguage: document.documentElement.lang
                        }
                    });
                    document.dispatchEvent(event);
                    
                    // Update STRINGS object
                    updateLanguageStrings(newDoc, langCode);
                    
                    // Reinitialize components
                    reinitializeComponentsAfterLanguageChange(newDoc, pageState)
                        .then(resolve)
                        .catch(reject);
                } else {
                    reject(new Error(`XHR request failed with status ${xhr.status}`));
                }
            };
            
            xhr.onerror = function() {
                reject(new Error('Network error occurred during XHR request'));
            };
            
            xhr.ontimeout = function() {
                reject(new Error('XHR request timed out'));
            };
            
            xhr.send();
        });
    }
	
	// After the language dropdown setup code, you should have or create these helper functions
// Look for other functions like fetchLanguageContent, createLoader, etc.

/**
 * Update page content based on the new language HTML
 */
function updatePageContent(newDoc, pageState) {
    try {
        // Update main content
        const currentMain = document.querySelector('main');
        const newMain = newDoc.querySelector('main');
        
        if (currentMain && newMain) {
            currentMain.innerHTML = newMain.innerHTML;
        } else {
            console.warn('Main content elements not found, using body content instead');
            // Fallback to updating body content excluding head and scripts
            const currentBody = document.body;
            const newBody = newDoc.body;
            
            if (currentBody && newBody) {
                // Keep header, scripts and other important elements
                // Only update the content sections
                document.querySelectorAll('section').forEach(section => {
                    const newSection = newDoc.querySelector(`section#${section.id}`);
                    if (newSection) {
                        section.innerHTML = newSection.innerHTML;
                    }
                });
            }
        }
        
        // Update header if it exists
        const currentHeader = document.querySelector('header');
        const newHeader = newDoc.querySelector('header');
        if (currentHeader && newHeader) {
            currentHeader.innerHTML = newHeader.innerHTML;
        }
        
        // Update footer if it exists
        const currentFooter = document.querySelector('footer');
        const newFooter = newDoc.querySelector('footer');
        if (currentFooter && newFooter) {
            currentFooter.innerHTML = newFooter.innerHTML;
        }
        
        // Restore form data if available
        if (pageState && pageState.formData) {
            restoreFormData(pageState.formData);
        }
        
        // Restore active elements if available
        if (pageState && pageState.activeElements) {
            restoreActiveElements(pageState.activeElements);
        }
        
        // Restore expanded elements if available
        if (pageState && pageState.expandedElements) {
            restoreExpandedElements(pageState.expandedElements);
        }
        
        // Restore tab states if available
        if (pageState && pageState.tabStates) {
            restoreTabStates(pageState.tabStates);
        }
        
        // Re-bind event handlers that might have been lost
        rebindEventHandlers();
        
        return true;
    } catch (error) {
        console.error('Error updating page content:', error);
        throw error;
    }
}

/**
 * Re-bind event handlers after content update
 */
function rebindEventHandlers() {
    // Rebind language dropdown toggles if they exist
    document.querySelectorAll('#lang-toggle, #mobile-lang-toggle').forEach(toggle => {
        if (toggle) {
            // Remove existing listeners to avoid duplicates
            const newToggle = toggle.cloneNode(true);
            toggle.parentNode.replaceChild(newToggle, toggle);
        }
    });
    
    // You might need to re-run parts of your initialization code
    // that set up event handlers on dynamic content
    setupLanguageDropdowns();
    
    // Re-initialize other components if needed
    if (typeof initWebsite === 'function') {
        initWebsite();
    }
}

/**
 * Restore form data after content update
 */
function restoreFormData(formData) {
    if (!formData || !formData.length) return;
    
    formData.forEach(data => {
        let form;
        
        // Find the form either by ID or selector
        if (data.id) {
            form = document.getElementById(data.id);
        } else if (data.selector) {
            form = document.querySelector(data.selector);
        }
        
        if (!form) return;
        
        // Restore text inputs
        Object.entries(data.values || {}).forEach(([name, value]) => {
            const input = name.startsWith('#') 
                ? document.getElementById(name.substring(1))
                : form.querySelector(`[name="${name}"]`);
                
            if (input) input.value = value;
        });
        
        // Restore radio buttons
        Object.entries(data.checkedRadios || {}).forEach(([name, value]) => {
            const radio = form.querySelector(`[name="${name}"][value="${value}"]`);
            if (radio) radio.checked = true;
        });
        
        // Restore checkboxes
        Object.entries(data.checkedCheckboxes || {}).forEach(([name, checked]) => {
            const checkbox = name.startsWith('#') 
                ? document.getElementById(name.substring(1))
                : form.querySelector(`[name="${name}"]`);
                
            if (checkbox) checkbox.checked = checked;
        });
        
        // Restore selects
        Object.entries(data.selects || {}).forEach(([name, value]) => {
            const select = name.startsWith('#') 
                ? document.getElementById(name.substring(1))
                : form.querySelector(`[name="${name}"]`);
                
            if (!select) return;
            
            if (Array.isArray(value)) {
                // Multiple select
                Array.from(select.options).forEach(option => {
                    option.selected = value.includes(option.value);
                });
            } else {
                // Single select
                select.value = value;
            }
        });
        
        // Restore textareas
        Object.entries(data.textareas || {}).forEach(([name, value]) => {
            const textarea = name.startsWith('#') 
                ? document.getElementById(name.substring(1))
                : form.querySelector(`[name="${name}"]`);
                
            if (textarea) textarea.value = value;
        });
    });
}

/**
 * Restore active elements (like nav links)
 */
function restoreActiveElements(activeElements) {
    if (!activeElements || !activeElements.length) return;
    
    activeElements.forEach(data => {
        let element;
        
        if (data.selector) {
            element = document.querySelector(data.selector);
        }
        
        if (!element) return;
        
        // Restore active state
        element.classList.add('active');
        
        // Restore aria-current if needed
        if (data.ariaCurrent) {
            element.setAttribute('aria-current', data.ariaCurrent);
        }
    });
}

/**
 * Restore expanded elements (like accordions)
 */
function restoreExpandedElements(expandedElements) {
    if (!expandedElements || !expandedElements.length) return;
    
    expandedElements.forEach(data => {
        let element;
        
        if (data.selector) {
            element = document.querySelector(data.selector);
        }
        
        if (!element) return;
        
        // Restore expanded state
        element.setAttribute('aria-expanded', 'true');
        
        // Show controlled element if exists
        if (data.controls) {
            const controlled = document.getElementById(data.controls);
            if (controlled) {
                controlled.classList.remove('hidden');
                controlled.setAttribute('aria-hidden', 'false');
            }
        }
    });
}

/**
 * Restore tab states
 */
function restoreTabStates(tabStates) {
    if (!tabStates || !tabStates.length) return;
    
    tabStates.forEach(data => {
        // Find container
        const container = document.querySelector(data.containerSelector);
        if (!container) return;
        
        // Find active tab
        const activeTab = document.querySelector(data.activeTabSelector);
        if (!activeTab) return;
        
        // Re-activate tab
        setTimeout(() => {
            activeTab.click();
        }, 100);
    });
}

// Then make sure fetchLanguageContent is using this function properly
    
    /**
     * Update document title, meta tags, and other metadata
     */
    function updateDocumentMetadata(newDoc) {
        // Update page title
        document.title = newDoc.title;
        
        // Update meta tags related to language
        const metaSelector = 'meta[name="language"], meta[http-equiv="Content-Language"], meta[property="og:locale"]';
        
        document.querySelectorAll(metaSelector).forEach(metaTag => {
            const name = metaTag.getAttribute('name');
            const httpEquiv = metaTag.getAttribute('http-equiv');
            const property = metaTag.getAttribute('property');
            
            let newMeta;
            
            if (name) {
                newMeta = newDoc.querySelector(`meta[name="${name}"]`);
            } else if (httpEquiv) {
                newMeta = newDoc.querySelector(`meta[http-equiv="${httpEquiv}"]`);
            } else if (property) {
                newMeta = newDoc.querySelector(`meta[property="${property}"]`);
            }
            
            if (newMeta) {
                metaTag.setAttribute('content', newMeta.getAttribute('content'));
            }
        });
        
        // Update canonical link
        const canonical = document.querySelector('link[rel="canonical"]');
        const newCanonical = newDoc.querySelector('link[rel="canonical"]');
        
        if (canonical && newCanonical) {
            canonical.setAttribute('href', newCanonical.getAttribute('href'));
        }
        
        // Update hreflang links
        document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(link => {
            const hreflang = link.getAttribute('hreflang');
            const newLink = newDoc.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`);
            
            if (newLink) {
                link.setAttribute('href', newLink.getAttribute('href'));
            }
        });
        
        // Update meta description
        const description = document.querySelector('meta[name="description"]');
        const newDescription = newDoc.querySelector('meta[name="description"]');
        
        if (description && newDescription) {
            description.setAttribute('content', newDescription.getAttribute('content'));
        }
        
        // Update JSON-LD structured data for SEO
        const structuredData = document.querySelector('script[type="application/ld+json"]');
        const newStructuredData = newDoc.querySelector('script[type="application/ld+json"]');
        
        if (structuredData && newStructuredData) {
            structuredData.textContent = newStructuredData.textContent;
        }
    }
    
    /**
     * Setup navigation links with smooth scrolling
     */
    function setupNavLinks() {
        // Handle smooth scrolling for nav links
        document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(link => {
            if (link.getAttribute('href') === '#proposal-view') return; // Special handling for proposal view
        
            link.addEventListener('click', function(e) {
                e.preventDefault();
            
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
            
                if (!targetElement) return;
            
                // Close mobile menu if open
                if (isMobileMenuOpen) toggleMobileMenu(true);
            
                // Handle tab activation if specified
                const targetTab = this.dataset.targetTab;
                if (targetTab && targetId === 'services') {
                    const tabButton = document.querySelector(`.tab-btn[data-tab="${targetTab}"]`);
                    if (tabButton) {
                        setTimeout(() => tabButton.click(), CONFIG.smoothScrollDuration + 100);
                    }
                }
            
                // Find section title to scroll to
                const sectionTitle = targetElement.querySelector('h2, h3, .section-header') || targetElement;
                
                // Calculate the correct position to land on the title
                const headerHeight = document.getElementById('header')?.offsetHeight || 0;
                const targetPosition = sectionTitle.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
            
                // Use smooth scroll with native API or polyfill for older browsers
                if ('scrollBehavior' in document.documentElement.style) {
                    window.scrollTo({
                        top: targetPosition,
                        behavior: MediaUtil.prefersReducedMotion() ? 'auto' : 'smooth'
                    });
                } else {
                    // Fallback smooth scroll for older browsers
                    smoothScrollPolyfill(targetPosition, CONFIG.smoothScrollDuration);
                }
            
                // Update URL hash
                window.history.pushState(null, '', `#${targetId}`);
                
                // Update active state in navigation
                document.querySelectorAll('.nav-link').forEach(navLink => {
                    const navLinkTarget = navLink.getAttribute('href');
                    const isActive = navLinkTarget === `#${targetId}`;
                    navLink.classList.toggle('active', isActive);
                    if (isActive) {
                        navLink.setAttribute('aria-current', 'page');
                    } else {
                        navLink.removeAttribute('aria-current');
                    }
                });
            });
        });
    }
    
    /**
     * Smooth scroll polyfill for older browsers
     */
    function smoothScrollPolyfill(targetPosition, duration) {
        const startPosition = window.scrollY;
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const scrollProgress = Math.min(timeElapsed / duration, 1);
            
            // Easing function: easeInOutQuad
            const scrollValue = startPosition + distance * (scrollProgress < 0.5 
                ? 2 * scrollProgress * scrollProgress 
                : 1 - Math.pow(-2 * scrollProgress + 2, 2) / 2);
            
            window.scrollTo(0, scrollValue);
            
            if (timeElapsed < duration) {
                window.requestAnimationFrame(animation);
            }
        }
        
        window.requestAnimationFrame(animation);
    }
    
    /**
     * Initialize back-to-top button functionality
     */
    function initBackToTop() {
        const backToTopBtn = document.getElementById('back-to-top');
        if (!backToTopBtn) return;
    
        // Show/hide button based on scroll position
        function updateBackToTopVisibility() {
            const shouldShow = window.scrollY > CONFIG.backToTopThreshold;
            
            if (backToTopBtn.classList.contains('opacity-0') === shouldShow) {
                backToTopBtn.classList.toggle('opacity-0', !shouldShow);
                backToTopBtn.classList.toggle('invisible', !shouldShow);
                
                // Ensure button is not focusable when invisible
                backToTopBtn.setAttribute('tabindex', shouldShow ? '0' : '-1');
                
                // Ensure aria-hidden is properly set
                backToTopBtn.setAttribute('aria-hidden', !shouldShow);
            }
        }
    
        window.addEventListener('scroll', throttle(updateBackToTopVisibility, 100));
        updateBackToTopVisibility(); // Initial state
    
        // Scroll to top when clicked with smooth animation
        backToTopBtn.addEventListener('click', () => {
            // Use native smooth scroll when available and reduced motion not preferred
            if ('scrollBehavior' in document.documentElement.style && !MediaUtil.prefersReducedMotion()) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // Custom smooth scroll for older browsers or reduced motion preference
                smoothScrollPolyfill(0, CONFIG.smoothScrollDuration);
            }
            
            // Focus on top of page for better accessibility
            setTimeout(() => {
                const firstFocusable = document.querySelector('h1, [role="banner"] a, #skip-to-content');
                if (firstFocusable) {
                    firstFocusable.focus();
                }
            }, CONFIG.smoothScrollDuration);
            
            // Track the event for analytics
            if (window.dataLayer) {
                window.dataLayer.push({
                    event: 'backToTop',
                    eventCategory: 'UI Interaction',
                    eventAction: 'Back to Top',
                    eventLabel: document.location.pathname
                });
            }
        });
    }
    
    /**
     * Initialize scroll spy for navigation highlighting
     */
    function initScrollSpy() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
    
        if (!sections.length || !navLinks.length) return;
    
        // Optimize scroll spy with proper throttling and IntersectionObserver
        if ('IntersectionObserver' in window) {
            // Use IntersectionObserver for better performance
            const observerOptions = {
                rootMargin: `-${CONFIG.scrollSpyOffset}px 0px -${window.innerHeight - CONFIG.scrollSpyOffset}px 0px`,
                threshold: 0.1
            };
            
            const visibleSections = new Set();
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    // Skip proposal view section
                    if (entry.target.id === 'proposal-view') return;
                    
                    if (entry.isIntersecting) {
                        visibleSections.add(entry.target.id);
                    } else {
                        visibleSections.delete(entry.target.id);
                    }
                });
                
                // Get the current section - take the last one if multiple are visible
                let currentSection = '';
                if (visibleSections.size > 0) {
                    // Convert Set to Array and get the last element
                    const sectionsArray = Array.from(visibleSections);
                    currentSection = sectionsArray[sectionsArray.length - 1];
                } else if (window.scrollY < 100) {
                    // Special case for top of page
                    const firstSection = Array.from(sections).find(s => s.id !== 'proposal-view');
                    if (firstSection) currentSection = firstSection.id;
                }
                
                // Update active state on nav links
                updateActiveNavLinks(currentSection);
            }, observerOptions);
            
            sections.forEach(section => {
                if (section.id !== 'proposal-view') {
                    observer.observe(section);
                }
            });
        } else {
            // Fallback to scroll event
            function updateActiveSection() {
                // Skip if proposal view is active
                if (document.getElementById('proposal-view')?.classList.contains('active')) return;
            
                let currentSection = '';
                const headerHeight = document.getElementById('header')?.offsetHeight || 0;
                const scrollPosition = window.scrollY + headerHeight + CONFIG.scrollSpyOffset;
            
                sections.forEach(section => {
                    // Skip proposal view section
                    if (section.id === 'proposal-view') return;
                
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.offsetHeight;
                
                    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                        currentSection = section.id;
                    }
                });
            
                // Special case for top of page
                if (window.scrollY < 100) {
                    const firstSection = Array.from(sections).find(s => s.id !== 'proposal-view');
                    if (firstSection) currentSection = firstSection.id;
                }
            
                // Update active state on nav links
                updateActiveNavLinks(currentSection);
            }
        
            window.addEventListener('scroll', throttle(updateActiveSection, 100));
            window.addEventListener('load', updateActiveSection);
            updateActiveSection(); // Initial state
        }
    }
    
    // Helper function to update active nav links
    function updateActiveNavLinks(currentSection) {
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;
        
            const linkTarget = href.substring(1);
            const isActive = linkTarget === currentSection;
            
            // Only update if changed to avoid unnecessary repaints
            if (link.classList.contains('active') !== isActive) {
                link.classList.toggle('active', isActive);
            
                if (isActive) {
                    link.setAttribute('aria-current', 'page');
                } else {
                    link.removeAttribute('aria-current');
                }
            }
        });
    }
    
    /**
     * Initialize Structured Data for SEO
     */
    function initStructuredData() {
        if (!CONFIG.generateStructuredData) return;
        
        // Generate Organization Schema
        const orgSchema = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "IAA Solutions",
            "url": window.location.origin,
            "logo": `${window.location.origin}/assets/images/logo.png`,
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": document.querySelector('[itemprop="telephone"]')?.content || "",
                "contactType": "customer service",
                "availableLanguage": CONFIG.supportedLanguages.map(lang => lang.code)
            }
        };
        
        // Generate WebSite Schema
        const websiteSchema = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "IAA Solutions",
            "url": window.location.origin,
            "potentialAction": {
                "@type": "SearchAction",
                "target": `${window.location.origin}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string"
            }
        };
        
        // Generate BreadcrumbList Schema if enabled
        if (CONFIG.breadcrumbsEnabled) {
            const breadcrumbItems = [];
            const sectionHeadings = document.querySelectorAll('section[id] h2, section[id] .section-header');
            
            sectionHeadings.forEach((heading, index) => {
                const section = heading.closest('section[id]');
                if (!section) return;
                
                breadcrumbItems.push({
                    "@type": "ListItem",
                    "position": index + 1,
                    "name": heading.textContent.trim(),
                    "item": `${window.location.origin}${window.location.pathname}#${section.id}`
                });
            });
            
            if (breadcrumbItems.length > 0) {
                const breadcrumbSchema = {
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": breadcrumbItems
                };
                
                // Add breadcrumb schema
                addSchemaToPage(breadcrumbSchema);
            }
        }
        
        // Add schema to page
        addSchemaToPage(orgSchema);
        addSchemaToPage(websiteSchema);
    }
    
    // Helper function to add schema to page
    function addSchemaToPage(schema) {
        // Check if schema already exists
        const schemaType = schema["@type"];
        const existingSchema = document.querySelector(`script[type="application/ld+json"][data-schema-type="${schemaType}"]`);
        
        if (existingSchema) {
            // Update existing schema
            existingSchema.textContent = JSON.stringify(schema);
        } else {
            // Create new schema tag
            const scriptTag = document.createElement('script');
            scriptTag.type = 'application/ld+json';
            scriptTag.setAttribute('data-schema-type', schemaType);
            scriptTag.textContent = JSON.stringify(schema);
            document.head.appendChild(scriptTag);
        }
    }
    
    return {
        init: function() {
            if (isInitialized) return;
            
            // Ensure critical elements exist
            const header = document.getElementById('header');
            if (header) {
                // Store header height for calculations
                headerHeight = header.offsetHeight;
                
                // Set up scroll detection
                handleScroll(); // Initial check
                window.addEventListener('scroll', throttle(handleScroll, 10));
            }
            
            // Initialize mobile menu toggle
            const menuBtn = document.getElementById('mobile-menu-btn');
            if (menuBtn) {
                menuBtn.addEventListener('click', () => toggleMobileMenu());
            }
            
            // Init language switcher if multilingual is enabled
            if (CONFIG.features.multilingual) {
                setupLanguageDropdowns();
            }
            
            // Set up navigation and scrolling features
            setupNavLinks();
            initBackToTop();
            initScrollSpy();
            
            // Add popstate handler for browser navigation
            window.addEventListener('popstate', function(event) {
                if (event.state && typeof event.state.scrollY === 'number') {
                    window.scrollTo(0, event.state.scrollY);
                }
            });
            
            // Initialize structured data for SEO
            if (CONFIG.generateStructuredData) {
                initStructuredData();
            }
            
            // Handle hash navigation on page load
            if (window.location.hash && window.location.hash !== '#') {
                // Delayed navigation to ensure all elements are rendered
                setTimeout(() => {
                    const targetId = window.location.hash.substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        const headerHeight = document.getElementById('header')?.offsetHeight || 0;
                        const targetPosition = targetElement.getBoundingClientRect().top + 
                                             window.scrollY - headerHeight - 20;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'auto' // Use auto for initial load to avoid jumps
                        });
                    }
                }, 200);
            }
            
            isInitialized = true;
            console.log('Header module initialized');
        },
        
        // Public methods
        closeMobileMenu: function() {
            toggleMobileMenu(true);
        },
        
        isMobileMenuOpen: function() {
            return isMobileMenuOpen;
        },
        
        getHeaderHeight: function() {
            return headerHeight;
        },
        
        // Expose language switching methods for other components to use
        fetchLanguageContent,
        createLoader,
        createOverlay
    };
})();

/**
 * =========================================================
 * CONTENT TABS MODULE
 * =========================================================
 */
const Tabs = (function() {
    const activeTabsCache = new Map();
    let isInitialized = false;
    
    /**
     * Initialize service tabs with enhanced features
     */
    function initServiceTabs() {
        const tabsContainers = document.querySelectorAll('.services-tabs, .tabs-container');
        
        tabsContainers.forEach(container => {
            const tabsNav = container.querySelector('.tabs-nav');
            if (!tabsNav) return;
            
            const tabs = tabsNav.querySelectorAll('.tab-btn, [role="tab"]');
            const tabPanes = container.querySelectorAll('.tab-pane, [role="tabpanel"]');
            const indicator = tabsNav.querySelector('.tab-indicator');
            
            // Add proper ARIA attributes for accessibility
            if (tabsNav.getAttribute('role') !== 'tablist') {
                tabsNav.setAttribute('role', 'tablist');
                
                // Generate a unique ID for this tablist
                const tablistId = tabsNav.id || `tablist-${Math.random().toString(36).substring(2, 9)}`;
                if (!tabsNav.id) tabsNav.id = tablistId;
                
                // Set up tabs with proper ARIA attributes
                tabs.forEach((tab, index) => {
                    const existingTabId = tab.id;
                    const tabId = existingTabId || `${tablistId}-tab-${index}`;
                    if (!existingTabId) tab.id = tabId;
                    
                    // Check if tab already has role="tab"
                    if (tab.getAttribute('role') !== 'tab') {
                        tab.setAttribute('role', 'tab');
                    }
                    
                    // Find the target panel
                    const targetId = tab.getAttribute('data-target') || tab.getAttribute('aria-controls');
                    let targetPane = null;
                    
                    if (targetId) {
                        targetPane = document.querySelector(targetId);
                    } else if (tabPanes[index]) {
                        targetPane = tabPanes[index];
                    }
                    
                    if (targetPane) {
                        const paneId = targetPane.id || `${tabId}-panel`;
                        if (!targetPane.id) targetPane.id = paneId;
                        
                        // Link tab and panel
                        tab.setAttribute('aria-controls', paneId);
                        targetPane.setAttribute('aria-labelledby', tabId);
                        
                        // Set role if not already set
                        if (targetPane.getAttribute('role') !== 'tabpanel') {
                            targetPane.setAttribute('role', 'tabpanel');
                        }
                    }
                });
            }
            
            // Get the active tab from URL hash if available
            const urlHash = window.location.hash;
            let activeTabFromUrl = null;
            
            if (urlHash) {
                const targetTab = tabsNav.querySelector(`[data-tab="${urlHash.substring(1)}"], [data-target="${urlHash}"]`);
                if (targetTab) {
                    activeTabFromUrl = targetTab;
                }
            }
            
            // Check if active tab is stored in cache
            const containerKey = tabsNav.id || getUniqueSelector(tabsNav);
            let initialActiveTab = activeTabsCache.get(containerKey);
            
            // Set initial active tab (URL hash takes precedence, then cache, then first tab or existing active)
            const activeTab = activeTabFromUrl || 
                             initialActiveTab || 
                             tabsNav.querySelector('.tab-btn.active, [role="tab"][aria-selected="true"]') || 
                             tabs[0];
            
            // Store for future reference
            if (activeTab && !initialActiveTab) {
                activeTabsCache.set(containerKey, activeTab);
            }
            
            // Function to update indicator position with optimized animation
            function updateIndicator(tab, animate = true) {
                if (!indicator) return;
                
                // Get position and width of active tab
                const tabRect = tab.getBoundingClientRect();
                const navRect = tabsNav.getBoundingClientRect();
                
                // Prepare transition before setting properties
                if (animate) {
                    indicator.style.transition = 'left 0.3s ease, width 0.3s ease';
                } else {
                    indicator.style.transition = 'none';
                }
                
                // Set indicator position
                indicator.style.left = `${tabRect.left - navRect.left}px`;
                indicator.style.width = `${tabRect.width}px`;
                
                // Force reflow to apply transition
                if (!animate) {
                    indicator.offsetWidth;
                    indicator.style.transition = '';
                }
            }
            
            // Function to handle tab change with accessibility improvements
            function activateTab(tab, animate = true) {
                if (!tab) return;
                
                const targetId = tab.getAttribute('data-target') || tab.getAttribute('aria-controls');
                let targetPane = null;
                
                if (targetId) {
                    targetPane = document.querySelector(targetId);
                }
                
                // Update tabs state
                tabs.forEach(t => {
                    const isActive = t === tab;
                    t.classList.toggle('active', isActive);
                    t.setAttribute('aria-selected', isActive);
                    t.setAttribute('tabindex', isActive ? '0' : '-1');
                    
                    // Add/remove pressed styling for touch devices
                    t.classList.remove('tab-pressed');
                });
                
                // Store active tab in cache
                activeTabsCache.set(containerKey, tab);
                
                // Update tab panes if target found
                if (targetPane) {
                    tabPanes.forEach(pane => {
                        const isActive = pane === targetPane;
                        
                        // Use transition for non-first-load changes
                        if (animate) {
                            if (isActive) {
                                // Show new content
                                pane.classList.add('active');
                                pane.style.opacity = '0';
                                pane.hidden = false;
                                
                                // Trigger animation after a small delay
                                setTimeout(() => {
                                    pane.style.opacity = '1';
                                }, 50);
                            } else {
                                // Hide inactive with transition
                                pane.style.opacity = '0';
                                
                                // After transition, complete hiding
                                setTimeout(() => {
                                    if (!pane.classList.contains('active')) {
                                        pane.hidden = true;
                                    }
                                }, 300);
                                
                                pane.classList.remove('active');
                            }
                        } else {
                            // Immediate change without animation
                            pane.classList.toggle('active', isActive);
                            pane.style.opacity = isActive ? '1' : '0';
                            pane.hidden = !isActive;
                        }
                    });
                    
                    // Update tab in URL, but don't scroll
                    const tabId = tab.getAttribute('data-tab') || tab.id;
                    if (tabId && window.history.replaceState) {
                        window.history.replaceState(
                            null, 
                            '', 
                            tabId !== tabs[0].getAttribute('data-tab') 
                                ? `#${tabId}` 
                                : window.location.pathname
                        );
                    }
                    
                    // Send analytics event
                    if (window.dataLayer) {
                        window.dataLayer.push({
                            event: 'tabChange',
                            tabContainer: tabsNav.id || containerKey,
                            activeTab: tab.textContent.trim()
                        });
                    }
                }
                
                // Update indicator position
                updateIndicator(tab, animate);
            }
            
            // Set up click handlers for tabs
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    if (tab.classList.contains('active')) return;
                    activateTab(tab);
                    tab.focus(); // Focus for accessibility
                });
                
                // Add touch feedback effect
                tab.addEventListener('touchstart', () => {
                    tab.classList.add('tab-pressed');
                }, { passive: true });
                
                tab.addEventListener('touchend', () => {
                    setTimeout(() => {
                        tab.classList.remove('tab-pressed');
                    }, 100);
                }, { passive: true });
                
                // Handle keyboard navigation for accessibility
                tab.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                        e.preventDefault();
                        
                        const tabList = Array.from(tabs);
                        const currentIndex = tabList.indexOf(tab);
                        let newIndex;
                        
                        if (e.key === 'ArrowLeft') {
                            newIndex = currentIndex > 0 ? currentIndex - 1 : tabList.length - 1;
                        } else {
                            newIndex = currentIndex < tabList.length - 1 ? currentIndex + 1 : 0;
                        }
                        
                        // Focus the new tab
                        tabList[newIndex].focus();
                        
                        // Activate the new tab
                        activateTab(tabList[newIndex]);
                    } else if (e.key === 'Home') {
                        e.preventDefault();
                        tabs[0].focus();
                        activateTab(tabs[0]);
                    } else if (e.key === 'End') {
                        e.preventDefault();
                        tabs[tabs.length - 1].focus();
                        activateTab(tabs[tabs.length - 1]);
                    }
                });
            });
            
            // Initialize with active tab
            if (activeTab) {
                activateTab(activeTab, false); // No animation for initial load
            }
        });
    }
    
    /**
     * Initialize portfolio filter with improved performance
     */
    function initPortfolioFilter() {
        const filterContainers = document.querySelectorAll('.portfolio-filter, .gallery-filter, .projects-filter');
        
        filterContainers.forEach(filterContainer => {
            if (!filterContainer) return;
            
            const filterButtons = filterContainer.querySelectorAll('.filter-btn, [data-filter]');
            const portfolioItems = document.querySelectorAll('.portfolio-item, .gallery-item, .project-item');
            
            // Add proper ARIA attributes for accessibility
            filterContainer.setAttribute('role', 'tablist');
            filterButtons.forEach(button => {
                if (!button.getAttribute('role')) button.setAttribute('role', 'tab');
                if (!button.hasAttribute('aria-selected')) button.setAttribute('aria-selected', 'false');
            });
            
            // Get initial filter from URL if present
            const urlHash = window.location.hash;
            let activeFilterFromUrl = null;
            
            if (urlHash && urlHash.startsWith('#filter-')) {
                const filterValue = urlHash.substring(1);
                const targetFilter = filterContainer.querySelector(`[data-filter=".${filterValue}"], [data-filter="#${filterValue}"]`);
                if (targetFilter) {
                    activeFilterFromUrl = targetFilter;
                }
            }
            
            // Set initial active filter (URL hash > existing active > first button)
            const activeFilter = activeFilterFromUrl || 
                               filterContainer.querySelector('.filter-btn.active, [data-filter][aria-selected="true"]') || 
                               filterButtons[0];
            
            // Function to filter portfolio items with animation
            function filterItems(filterValue, animate = true) {
                // Get filter selector
                const selector = filterValue === '*' ? '*' : filterValue.startsWith('.') ? filterValue.substring(1) : filterValue;
                
                // Create an array for batched DOM updates
                const showItems = [];
                const hideItems = [];
                
                portfolioItems.forEach(item => {
                    const shouldShow = filterValue === '*' || 
                                      (filterValue.startsWith('.') && item.classList.contains(selector)) ||
                                      (filterValue.startsWith('#') && item.id === selector.substring(1));
                    
                    // Categorize items for efficient DOM updates
                    if (shouldShow) {
                        showItems.push(item);
                    } else {
                        hideItems.push(item);
                    }
                });
                
                // Process in batches for better performance
                if (animate) {
                    // First, set all hide items to start fading out
                    hideItems.forEach(item => {
                        item.style.opacity = '0';
                    });
                    
                    // After transition, complete hiding and show new items
                    setTimeout(() => {
                        // Hide items completely
                        hideItems.forEach(item => {
                            item.style.display = 'none';
                        });
                        
                        // Show new items but with 0 opacity first
                        showItems.forEach(item => {
                            item.style.display = '';
                            item.style.opacity = '0';
                        });
                        
                        // Force reflow to ensure the display change takes effect
                        showItems.forEach(item => item.offsetHeight);
                        
                        // Now fade in
                        showItems.forEach(item => {
                            item.style.opacity = '1';
                        });
                    }, 300);
                } else {
                    // Immediate change without animation for initial load
                    hideItems.forEach(item => {
                        item.style.display = 'none';
                        item.style.opacity = '0';
                    });
                    
                    showItems.forEach(item => {
                        item.style.display = '';
                        item.style.opacity = '1';
                    });
                }
                
                // Update URL hash for selected filter
                if (filterValue !== '*' && window.history.replaceState) {
                    const hashValue = filterValue.startsWith('.') ? filterValue.substring(1) : filterValue;
                    window.history.replaceState(null, '', `#filter-${hashValue}`);
                } else if (window.history.replaceState) {
                    // Remove hash if showing all
                    const currentUrl = window.location.href.split('#')[0];
                    window.history.replaceState(null, '', currentUrl);
                }
                
                // Send analytics event
                if (window.dataLayer) {
                    window.dataLayer.push({
                        event: 'portfolioFilter',
                        filterValue: filterValue
                    });
                }
            }
            
            // Set up click handlers for filter buttons
            filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const filterValue = button.getAttribute('data-filter');
                    
                    // Skip if already active
                    if (button.classList.contains('active')) return;
                    
                    // Update active button
                    filterButtons.forEach(btn => {
                        btn.classList.toggle('active', btn === button);
                        btn.setAttribute('aria-selected', btn === button);
                    });
                    
                    // Filter items
                    filterItems(filterValue);
                });
                
                // Keyboard navigation for accessibility
                button.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                        e.preventDefault();
                        
                        const buttonList = Array.from(filterButtons);
                        const currentIndex = buttonList.indexOf(button);
                        let newIndex;
                        
                        if (e.key === 'ArrowLeft') {
                            newIndex = currentIndex > 0 ? currentIndex - 1 : buttonList.length - 1;
                        } else {
                            newIndex = currentIndex < buttonList.length - 1 ? currentIndex + 1 : 0;
                        }
                        
                        // Focus the new button
                        buttonList[newIndex].focus();
                        
                        // Activate the new filter
                        buttonList[newIndex].click();
                    }
                });
            });
            
            // Initialize with active filter
            if (activeFilter) {
                activeFilter.classList.add('active');
                activeFilter.setAttribute('aria-selected', 'true');
                
                const filterValue = activeFilter.getAttribute('data-filter');
                if (filterValue) {
                    filterItems(filterValue, false); // No animation for initial load
                }
            }
        });
    }
    
    /**
     * Initialize pricing toggle with improved animation
     */
    function initPricingToggle() {
        const toggleCheckbox = document.getElementById('pricing-toggle-checkbox');
        if (!toggleCheckbox) return;
        
        // Function to update pricing display with smooth animation
        function updatePricingDisplay() {
            const isAnnual = toggleCheckbox.checked;
            
            // Find the parent containers that hold both price elements
            document.querySelectorAll('.pricing-card').forEach(card => {
                // Get the price container in each card
                const priceContainer = card.querySelector('.price-container');
                if (!priceContainer) return;
                
                // Add position relative to the container to establish a positioning context
                priceContainer.style.position = 'relative';
                priceContainer.style.height = '80px'; // Fixed height to accommodate both prices
                
                // Get the monthly and annual elements
                const monthlyEl = priceContainer.querySelector('.price-monthly');
                const annualEl = priceContainer.querySelector('.price-annual');
                
                if (monthlyEl && annualEl) {
                    // Set both elements to absolute positioning within the container
                    [monthlyEl, annualEl].forEach(el => {
                        el.style.position = 'absolute';
                        el.style.top = '0';
                        el.style.left = '0';
                        el.style.width = '100%';
                        el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        el.style.display = 'flex';
                        el.style.flexDirection = 'column';
                        el.style.alignItems = 'center';
                        el.style.justifyContent = 'center';
                    });
                    
                    // Toggle visibility with opacity and transform for nicer animation
                    if (isAnnual) {
                        monthlyEl.style.opacity = '0';
                        monthlyEl.style.transform = 'translateY(-10px)';
                        monthlyEl.style.zIndex = '0';
                        
                        annualEl.style.opacity = '1';
                        annualEl.style.transform = 'translateY(0)';
                        annualEl.style.zIndex = '1';
                    } else {
                        monthlyEl.style.opacity = '1';
                        monthlyEl.style.transform = 'translateY(0)';
                        monthlyEl.style.zIndex = '1';
                        
                        annualEl.style.opacity = '0';
                        annualEl.style.transform = 'translateY(10px)';
                        annualEl.style.zIndex = '0';
                    }
                }
            });
            
            // Apply the same approach to price description elements
            document.querySelectorAll('.pricing-card').forEach(card => {
                const descContainer = card.querySelector('.price-description-container');
                if (!descContainer) return;
                
                descContainer.style.position = 'relative';
                descContainer.style.height = '50px'; // Adjust based on your content height
                
                const monthlyDesc = descContainer.querySelector('.price-monthly-description');
                const annualDesc = descContainer.querySelector('.price-annual-description');
                
                if (monthlyDesc && annualDesc) {
                    [monthlyDesc, annualDesc].forEach(el => {
                        el.style.position = 'absolute';
                        el.style.top = '0';
                        el.style.left = '0';
                        el.style.width = '100%';
                        el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        el.style.textAlign = 'center';
                    });
                    
                    // Apply same animation style
                    if (isAnnual) {
                        monthlyDesc.style.opacity = '0';
                        monthlyDesc.style.transform = 'translateY(-5px)';
                        monthlyDesc.style.zIndex = '0';
                        
                        annualDesc.style.opacity = '1';
                        annualDesc.style.transform = 'translateY(0)';
                        annualDesc.style.zIndex = '1';
                    } else {
                        monthlyDesc.style.opacity = '1';
                        monthlyDesc.style.transform = 'translateY(0)';
                        monthlyDesc.style.zIndex = '1';
                        
                        annualDesc.style.opacity = '0';
                        annualDesc.style.transform = 'translateY(5px)';
                        annualDesc.style.zIndex = '0';
                    }
                }
            });
            
            // Update toggle labels
            document.querySelectorAll('.toggle-label').forEach(label => {
                const period = label.getAttribute('data-period');
                
                // Use better class toggling
                if ((period === 'monthly' && !isAnnual) || (period === 'annual' && isAnnual)) {
                    label.classList.add('active');
                    label.setAttribute('aria-pressed', 'true');
                } else {
                    label.classList.remove('active');
                    label.setAttribute('aria-pressed', 'false');
                }
            });
            
            // Show/hide save badge with animation
            const saveBadge = document.querySelector('.save-badge');
            if (saveBadge) {
                if (isAnnual) {
                    saveBadge.style.opacity = '0';
                    saveBadge.style.display = 'block';
                    
                    // Force reflow
                    saveBadge.offsetHeight;
                    
                    // Animate in
                    saveBadge.style.opacity = '1';
                    saveBadge.style.transform = 'rotate(0) scale(1)';
                } else {
                    saveBadge.style.opacity = '0';
                    saveBadge.style.transform = 'rotate(-10deg) scale(0.9)';
                    
                    // Hide after transition
                    setTimeout(() => {
                        if (!toggleCheckbox.checked) { // Recheck in case it changed again
                            saveBadge.style.display = 'none';
                        }
                    }, 300);
                }
            }
            
            // Announce to screen readers
            const message = isAnnual ? 
                I18n.get('annualPricingEnabled') : 
                I18n.get('monthlyPricingEnabled');
            
            Accessibility.announce(message);
            
            // Send analytics event
            if (window.dataLayer) {
                window.dataLayer.push({
                    event: 'pricingToggle',
                    pricingPeriod: isAnnual ? 'annual' : 'monthly'
                });
            }
        }
        
        // Toggle when checkbox changes
        toggleCheckbox.addEventListener('change', updatePricingDisplay);
        
        // Toggle when labels are clicked
        document.querySelectorAll('.toggle-label').forEach(label => {
            label.addEventListener('click', () => {
                const period = label.getAttribute('data-period');
                toggleCheckbox.checked = period === 'annual';
                updatePricingDisplay();
            });
            
            // Support keyboard activation
            label.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const period = label.getAttribute('data-period');
                    toggleCheckbox.checked = period === 'annual';
                    updatePricingDisplay();
                }
            });
        });
        
        // Initial state
        updatePricingDisplay();
    }
    
    /**
     * Initialize accordion functionality
     */
    function initAccordions() {
        const accordionContainers = document.querySelectorAll('.accordion-container, .faq-container');
        
        accordionContainers.forEach(container => {
            const headers = container.querySelectorAll('.accordion-header, .faq-question');
            const isSingleOpen = container.hasAttribute('data-single-open');
            
            // Add proper ARIA attributes for accessibility
            headers.forEach((header, index) => {
                // Skip if already initialized
                if (header.hasAttribute('data-accordion-initialized')) return;
                
                // Generate IDs if needed
                if (!header.id) header.id = `accordion-header-${index}`;
                
                // Find or create content section
                let content = header.nextElementSibling;
                if (!content || !content.classList.contains('accordion-content', 'faq-answer')) {
                    content = document.createElement('div');
                    content.classList.add('accordion-content');
                    header.parentNode.insertBefore(content, header.nextSibling);
                }
                
                if (!content.id) content.id = `accordion-content-${index}`;
                
                // Set accessibility attributes
                header.setAttribute('aria-expanded', 'false');
                header.setAttribute('aria-controls', content.id);
                header.setAttribute('role', 'button');
                header.setAttribute('tabindex', '0');
                
                content.setAttribute('aria-labelledby', header.id);
                content.setAttribute('role', 'region');
                content.setAttribute('aria-hidden', 'true');
                
                // Initial state
                content.style.maxHeight = '0';
                content.style.overflow = 'hidden';
                content.style.transition = 'max-height 0.3s ease-out';
                
                // Add click handler
                header.addEventListener('click', toggleAccordion);
                
                // Add keyboard handler
                header.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleAccordion.call(header);
                    }
                });
                
                // Mark as initialized
                header.setAttribute('data-accordion-initialized', 'true');
            });
            
            // Accordion toggle function
            function toggleAccordion() {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                const contentId = this.getAttribute('aria-controls');
                const content = document.getElementById(contentId);
                
                // Close other accordions if single open mode
if (!isExpanded && isSingleOpen) {
    headers.forEach(otherHeader => {
        if (otherHeader !== this && otherHeader.getAttribute('aria-expanded') === 'true') {
            const otherId = otherHeader.getAttribute('aria-controls');
            const otherContent = document.getElementById(otherId);
            otherHeader.setAttribute('aria-expanded', 'false');
            otherContent.setAttribute('aria-hidden', 'true');
            otherContent.style.maxHeight = '0';
        }
    });
}
                
                // Toggle current accordion
                this.setAttribute('aria-expanded', !isExpanded);
                content.setAttribute('aria-hidden', isExpanded);
                
                if (isExpanded) {
                    // Collapse with animation
                    content.style.maxHeight = '0';
                } else {
                    // Expand with animation - get content height first
                    content.style.maxHeight = content.scrollHeight + 'px';
                    
                    // Allow content to grow dynamically after animation
                    setTimeout(() => {
                        if (this.getAttribute('aria-expanded') === 'true') {
                            content.style.maxHeight = 'none';
                        }
                    }, 300);
                }
                
                // Send analytics event
                if (window.dataLayer) {
                    window.dataLayer.push({
                        event: 'accordionToggle',
                        accordionTitle: this.textContent.trim(),
                        accordionAction: isExpanded ? 'closed' : 'opened'
                    });
                }
            }
            
            // Open the first accordion by default if option is set
            if (container.hasAttribute('data-first-open') && headers.length > 0) {
                const firstHeader = headers[0];
                if (firstHeader.getAttribute('aria-expanded') !== 'true') {
                    firstHeader.click();
                }
            }
            
            // Open accordion if linked via hash
            if (window.location.hash) {
                const targetHeader = container.querySelector(window.location.hash);
                if (targetHeader && targetHeader.classList.contains('accordion-header', 'faq-question')) {
                    setTimeout(() => {
                        if (targetHeader.getAttribute('aria-expanded') !== 'true') {
                            targetHeader.click();
                        }
                    }, 300);
                }
            }
        });
    }
    
    return {
        init: function() {
            if (isInitialized) return;
            
            // Initialize all tab components
            initServiceTabs();
            initPortfolioFilter();
            initPricingToggle();
            initAccordions();
            
            // Handle tab links from URL
            if (window.location.hash) {
                const hash = window.location.hash;
                const targetTab = document.querySelector(`.tab-btn[data-tab="${hash.substring(1)}"]`);
                
                if (targetTab) {
                    setTimeout(() => {
                        targetTab.click();
                    }, 300);
                }
            }
            
            // Listen for language changes to update tabs
            document.addEventListener('languageChanged', () => {
                // Refresh tabs with new language content
                initServiceTabs();
                initAccordions();
            });
            
            isInitialized = true;
            console.log('Tabs module initialized');
        },
        
        // Public methods for external access
        activateTab: function(tabSelector) {
            const tab = document.querySelector(tabSelector);
            if (tab) tab.click();
        },
        
        openAccordion: function(headerSelector) {
            const header = document.querySelector(headerSelector);
            if (header && header.getAttribute('aria-expanded') !== 'true') {
                header.click();
            }
        }
    };
})();

/**
 * =========================================================
 * FORMS MODULE
 * =========================================================
 */
const Forms = (function() {
    let isInitialized = false;
    
    // Form validation messages - will be updated from I18n
    let validationMessages = {
        required: "This field is required",
        email: "Please enter a valid email address",
        number: "Please enter a valid number",
        url: "Please enter a valid URL",
        tel: "Please enter a valid phone number",
        minlength: "Please enter at least {min} characters",
        maxlength: "Please enter no more than {max} characters",
        pattern: "Please match the requested format",
        match: "Fields do not match",
        consent: "You must agree to the terms"
    };
    
    /**
     * Validate a single form field with enhanced feedback
     */
    function validateField(field) {
        const value = field.value.trim();
        let errorElement = document.getElementById(`${field.id}-error`);
        
        if (!errorElement) {
            // Create error element if it doesn't exist
            errorElement = document.createElement('div');
            errorElement.id = `${field.id}-error`;
            errorElement.className = 'error-message text-red-500 text-sm mt-1 hidden';
            errorElement.setAttribute('aria-live', 'polite');
            
            // Insert after the field or its label
            const fieldWrapper = field.closest('.form-group, .input-wrapper, .field-wrapper') || field.parentNode;
            fieldWrapper.appendChild(errorElement);
        }
        
        let isValid = true;
        let errorMessage = '';
        
        // Reset validation state
        field.classList.remove('is-invalid', 'border-red-500');
        field.setAttribute('aria-invalid', 'false');
        errorElement.textContent = '';
        errorElement.classList.add('hidden');
        
        // Skip disabled fields
        if (field.disabled) return true;
        
        // Validate based on field type and requirements
        if (field.hasAttribute('required')) {
            if (field.type === 'checkbox' && !field.checked) {
                isValid = false;
                errorMessage = validationMessages.consent;
            } else if (value === '' && field.type !== 'checkbox') {
                isValid = false;
                errorMessage = validationMessages.required;
            }
        }
        
        // Type validation
        if (isValid && value !== '') {
            switch (field.type) {
                case 'email':
                    // Comprehensive email validation regex
                    const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
                    if (!emailPattern.test(value)) {
                        isValid = false;
                        errorMessage = validationMessages.email;
                    }
                    break;
                    
                case 'tel':
                    // Basic phone format checking (international support)
                    const telPattern = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
                    if (!telPattern.test(value.replace(/\s/g, ''))) {
                        isValid = false;
                        errorMessage = validationMessages.tel;
                    }
                    break;
                    
                case 'url':
                    try {
                        new URL(value);
                    } catch (e) {
                        isValid = false;
                        errorMessage = validationMessages.url;
                    }
                    break;
                    
                case 'number':
                    if (isNaN(parseFloat(value)) || !isFinite(value)) {
                        isValid = false;
                        errorMessage = validationMessages.number;
                    }
                    break;
            }
        }
        
        // Length validation
        if (isValid && value !== '') {
            if (field.hasAttribute('minlength')) {
                const minLength = parseInt(field.getAttribute('minlength'));
                if (value.length < minLength) {
                    isValid = false;
                    errorMessage = validationMessages.minlength.replace('{min}', minLength);
                }
            }
            
            if (field.hasAttribute('maxlength')) {
                const maxLength = parseInt(field.getAttribute('maxlength'));
                if (value.length > maxLength) {
                    isValid = false;
                    errorMessage = validationMessages.maxlength.replace('{max}', maxLength);
                }
            }
        }
        
        // Pattern validation
        if (isValid && value !== '' && field.hasAttribute('pattern')) {
            const pattern = new RegExp(field.getAttribute('pattern'));
            if (!pattern.test(value)) {
                isValid = false;
                errorMessage = field.getAttribute('data-pattern-message') || validationMessages.pattern;
            }
        }
        
        // Match validation (for password confirmation)
        if (isValid && field.hasAttribute('data-match')) {
            const matchField = document.getElementById(field.getAttribute('data-match'));
            if (matchField && value !== matchField.value) {
                isValid = false;
                errorMessage = validationMessages.match;
            }
        }
        
        // Update UI if invalid with enhanced feedback
        if (!isValid) {
            field.classList.add('is-invalid', 'border-red-500');
            field.setAttribute('aria-invalid', 'true');
            
            if (errorElement) {
                errorElement.textContent = errorMessage;
                errorElement.classList.remove('hidden');
            }
            
            // Add shake animation for visual feedback
            field.classList.add('shake-error');
            setTimeout(() => {
                field.classList.remove('shake-error');
            }, 600);
        }
        
        return isValid;
    }
    
    /**
     * Validate an entire form with enhanced feedback
     */
    function validateForm(form) {
        const fields = form.querySelectorAll('input:not([type="hidden"]), select, textarea');
        let isValid = true;
        let firstInvalid = null;
        
        fields.forEach(field => {
            // Skip fields in hidden containers
            const isVisible = field.offsetParent !== null && 
                             !field.closest('.hidden, [style*="display: none"]');
            
            if (isVisible && !validateField(field)) {
                isValid = false;
                if (!firstInvalid) firstInvalid = field;
            }
        });
        
        // Focus first invalid field
        if (firstInvalid) {
            firstInvalid.focus();
            
            // Scroll into view if needed with smooth behavior
            const headerHeight = Header.getHeaderHeight ? Header.getHeaderHeight() : 80;
            
            if ('scrollMarginTop' in document.documentElement.style) {
                // Modern browsers support scroll margin
                firstInvalid.style.scrollMarginTop = `${headerHeight + 20}px`;
            } else {
                // Scroll with offset for older browsers
                const fieldTop = firstInvalid.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
                window.scrollTo({ top: fieldTop, behavior: 'smooth' });
            }
            
            // Announce validation error to screen readers
            Accessibility.announce(`Form validation failed. ${firstInvalid.labels[0]?.textContent || 'A field'} ${validationMessages.required}`);
        }
        
        return isValid;
    }
    
    /**
     * Initialize a form with enhanced validation and UX features
     */
    function initForm(form) {
        if (!form || form.hasAttribute('data-form-initialized')) return;
        
        // Add proper attributes
        form.setAttribute('novalidate', 'true');
        form.setAttribute('data-form-initialized', 'true');
        
        // Add required field markers
        form.querySelectorAll('[required]').forEach(field => {
            const label = document.querySelector(`label[for="${field.id}"]`);
            
            if (label && !label.querySelector('.required-marker')) {
                const marker = document.createElement('span');
                marker.className = 'required-marker text-red-500 ml-1';
                marker.setAttribute('aria-hidden', 'true');
                marker.textContent = '*';
                label.appendChild(marker);
            }
        });
        
        // Add form validation styles if not present
        if (!document.getElementById('form-validation-styles')) {
            const style = document.createElement('style');
            style.id = 'form-validation-styles';
            style.textContent = `
                .is-invalid {
                    border-color: var(--error-color, #f56565) !important;
                }
                .shake-error {
                    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                }
                @keyframes shake {
                    10%, 90% { transform: translateX(-1px); }
                    20%, 80% { transform: translateX(2px); }
                    30%, 50%, 70% { transform: translateX(-4px); }
                    40%, 60% { transform: translateX(4px); }
                }
                .form-feedback-icon {
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    pointer-events: none;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Live validation on blur
        form.querySelectorAll('input, select, textarea').forEach(field => {
            // Skip if already initialized
            if (field.hasAttribute('data-validation-initialized')) return;
            
            // Add input validation
            field.addEventListener('blur', () => {
                // Only validate if user has interacted with the field
                if (field.value !== '' || field.classList.contains('is-invalid')) {
                    validateField(field);
                }
            });
            
            // Add live feedback for required fields
            if (field.hasAttribute('required')) {
                field.addEventListener('input', () => {
                    // If field was invalid, revalidate on input to provide immediate feedback
                    if (field.classList.contains('is-invalid')) {
                        validateField(field);
                    }
                });
            }
            
            // Mark as initialized
            field.setAttribute('data-validation-initialized', 'true');
        });
        
        // Prevent multiple submissions
        form.addEventListener('submit', function(e) {
            // Skip if already processing
            if (form.classList.contains('is-submitting')) {
                e.preventDefault();
                return;
            }
            
            // Validate the form
            if (!validateForm(form)) {
                e.preventDefault();
                return;
            }
            
            // Mark as submitting to prevent multiple submissions
            form.classList.add('is-submitting');
            
            // Get submit button
            const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
            
            // Update UI for submitting state
            if (submitBtn) {
                // Store original text/state
                submitBtn.setAttribute('data-original-text', submitBtn.innerHTML);
                
                // Update with loading state
                const loadingState = `
                    <span class="inline-flex items-center">
                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        ${I18n.get('submitting')}
                    </span>
                `;
                
                submitBtn.innerHTML = loadingState;
                submitBtn.disabled = true;
            }
            
            // For AJAX forms, take over the submission process
            if (form.hasAttribute('data-ajax-form')) {
                e.preventDefault();
                submitFormViaAjax(form);
            } else {
                // For regular forms, reset submitting state after navigation starts
                setTimeout(() => {
                    form.classList.remove('is-submitting');
                    
                    if (submitBtn) {
                        submitBtn.innerHTML = submitBtn.getAttribute('data-original-text');
                        submitBtn.disabled = false;
                    }
                }, 5000); // Timeout fallback in case form submission hangs
            }
        });
        
        // Add character counters for textareas with maxlength
        form.querySelectorAll('textarea[maxlength]').forEach(textarea => {
            const container = textarea.closest('.form-group, .input-wrapper') || textarea.parentNode;
            const maxLength = parseInt(textarea.getAttribute('maxlength'));
            
            // Create counter element if it doesn't exist
            if (!container.querySelector('.char-counter')) {
                const counter = document.createElement('div');
                counter.className = 'char-counter text-sm text-gray-500 mt-1 text-right';
                counter.textContent = `0/${maxLength}`;
                counter.setAttribute('aria-live', 'polite');
                container.appendChild(counter);
                
                // Update counter on input
                textarea.addEventListener('input', () => {
                    const remaining = maxLength - textarea.value.length;
                    counter.textContent = `${textarea.value.length}/${maxLength}`;
                    
                    // Change color when approaching limit
                    if (remaining <= 10) {
                        counter.classList.add('text-red-500');
                        counter.classList.remove('text-gray-500');
                    } else {
                        counter.classList.remove('text-red-500');
                        counter.classList.add('text-gray-500');
                    }
                });
                
                // Initialize counter
                textarea.dispatchEvent(new Event('input'));
            }
        });
    }
    
    /**
     * Submit form via AJAX with enhanced error handling
     */
    function submitFormViaAjax(form) {
        // Get form data
        const formData = new FormData(form);
        const formId = form.id || form.getAttribute('data-form-id');
        
        // Get endpoint from form attributes
        let endpoint = form.getAttribute('data-endpoint') ||
                      form.getAttribute('action') ||
                      CONFIG.contactFormEndpoint;
        
        // Get response element
        const responseElementId = form.getAttribute('data-response-element') || `${formId}-response`;
        let responseElement = document.getElementById(responseElementId);
        
        // Create response element if it doesn't exist
        if (!responseElement) {
            responseElement = document.createElement('div');
            responseElement.id = responseElementId;
            responseElement.className = 'form-response mt-4 p-3 rounded hidden';
            responseElement.setAttribute('role', 'status');
            responseElement.setAttribute('aria-live', 'polite');
            form.appendChild(responseElement);
        }
        
        // Get submit button
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
        const originalButtonText = submitBtn ? submitBtn.getAttribute('data-original-text') : '';
        
        // Show loading state
        form.classList.add('is-loading');
        responseElement.classList.add('hidden');
        
        // Submit with fetch API
        fetch(endpoint, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            // Parse JSON or text response
            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.includes('application/json')) {
                return response.json().then(data => ({ 
                    ok: response.ok, 
                    data,
                    status: response.status 
                }));
            } else {
                return response.text().then(text => ({ 
                    ok: response.ok, 
                    data: text,
                    status: response.status 
                }));
            }
        })
        .then(result => {
            // Handle response
            if (result.ok) {
                // Success response
                responseElement.textContent = typeof result.data === 'object' 
                    ? result.data.message || I18n.get('formSuccess')
                    : I18n.get('formSuccess');
                    
                responseElement.classList.remove('hidden', 'bg-red-100', 'text-red-700');
                responseElement.classList.add('bg-green-100', 'text-green-700');
                
                // Reset form
                form.reset();
                
                // Scroll to response
                responseElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                
                // Focus the response for screen readers
                responseElement.setAttribute('tabindex', '-1');
                responseElement.focus();
                
                // Reset after a delay
                setTimeout(() => responseElement.removeAttribute('tabindex'), 1000);
                
                // Track successful submission
                if (window.dataLayer) {
                    window.dataLayer.push({
                        event: 'formSubmissionSuccess',
                        formId: formId,
                        formType: form.getAttribute('data-form-type') || 'contact'
                    });
                }
            } else {
                // Error response
                const errorMessage = typeof result.data === 'object' 
                    ? result.data.message || I18n.get('formError')
                    : I18n.get('formError');
                    
                responseElement.textContent = errorMessage;
                responseElement.classList.remove('hidden', 'bg-green-100', 'text-green-700');
                responseElement.classList.add('bg-red-100', 'text-red-700');
                
                // Scroll to and focus the error message
                responseElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                responseElement.setAttribute('tabindex', '-1');
                responseElement.focus();
                
                // Reset focus after a delay
                setTimeout(() => responseElement.removeAttribute('tabindex'), 1000);
                
                // Track submission error
                if (window.dataLayer) {
                    window.dataLayer.push({
                        event: 'formSubmissionError',
                        formId: formId,
                        formType: form.getAttribute('data-form-type') || 'contact',
                        errorStatus: result.status
                    });
                }
            }
        })
        .catch(error => {
            // Network or parsing error
            console.error('Form submission error:', error);
            
            responseElement.textContent = I18n.get('formNetworkError');
            responseElement.classList.remove('hidden', 'bg-green-100', 'text-green-700');
            responseElement.classList.add('bg-red-100', 'text-red-700');
            
            // Announce for screen readers
            Accessibility.announce(I18n.get('formNetworkError'), true);
        })
        .finally(() => {
            // Reset UI state
            form.classList.remove('is-loading', 'is-submitting');
            
            if (submitBtn && originalButtonText) {
                submitBtn.innerHTML = originalButtonText;
                submitBtn.disabled = false;
            }
        });
    }
    
    /**
     * Initialize contact form with enhanced features
     */
    function initContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;
        
        // Add AJAX form attribute
        form.setAttribute('data-ajax-form', 'true');
        form.setAttribute('data-form-type', 'contact');
        
        // Run standard form initialization
        initForm(form);
    }
    
    /**
     * Initialize newsletter form with enhanced features
     */
    function initNewsletterForm() {
        const form = document.getElementById('newsletter-form');
        if (!form) return;
        
        // Add AJAX form attribute
        form.setAttribute('data-ajax-form', 'true');
        form.setAttribute('data-form-type', 'newsletter');
        
        // Set endpoint for newsletter
        form.setAttribute('data-endpoint', CONFIG.newsletterEndpoint);
        
        // Run standard form initialization
        initForm(form);
    }
    
    /**
     * Initialize payment buttons with security and tracking
     */
    function initPaymentButtons() {
        document.querySelectorAll('.payment-button, [data-payment-method]').forEach(button => {
            const plan = button.getAttribute('data-plan') || 'Unknown';
            const amount = button.getAttribute('data-amount') || '';
            const currency = button.getAttribute('data-currency') || 'USD';
            
            button.addEventListener('click', (e) => {
                // Get payment type
                const paymentType = button.classList.contains('stripe') ? 'Stripe' : 
                              button.classList.contains('mercadopago') ? 'MercadoPago' : 
                              button.classList.contains('crypto') ? 'Cryptocurrency' : 
                              button.getAttribute('data-payment-method') || 'Unknown';
                
                // Simple placeholder for production integration
                const message = `Initiating ${paymentType} payment for: ${plan}${amount ? ' (' + currency + ' ' + amount + ')' : ''}\n\nThis is a placeholder. In production, integrate your payment gateway here.`;
                
                alert(message);
                
                // Track payment click in analytics
                if (window.dataLayer) {
                    window.dataLayer.push({
                        event: 'paymentButtonClick',
                        paymentMethod: paymentType,
                        plan: plan,
                        amount: amount,
                        currency: currency
                    });
                }
            });
        });
    }
    
    return {
        init: function() {
            if (isInitialized) return;
            
            // Update validation messages from translations
            if (I18n.get) {
                validationMessages = {
                    required: I18n.get('formRequired') || validationMessages.required,
                    email: I18n.get('formEmail') || validationMessages.email,
                    number: I18n.get('formNumber') || validationMessages.number,
                    url: I18n.get('formUrl') || validationMessages.url,
                    tel: I18n.get('formTel') || validationMessages.tel,
                    minlength: I18n.get('formMinLength') || validationMessages.minlength,
                    maxlength: I18n.get('formMaxLength') || validationMessages.maxlength,
                    pattern: I18n.get('formPattern') || validationMessages.pattern,
                    match: I18n.get('formMatch') || validationMessages.match,
                    consent: I18n.get('formConsent') || validationMessages.consent
                };
            }
            
            // Initialize all forms on the page
            document.querySelectorAll('form').forEach(form => {
                initForm(form);
            });
            
            // Initialize specific forms
            if (CONFIG.features.contactForm) {
                initContactForm();
            }
            
            if (CONFIG.features.newsletter) {
                initNewsletterForm();
            }
            
            initPaymentButtons();
            
            // Update when language changes
            document.addEventListener('languageChanged', () => {
                // Update validation messages
                if (I18n.get) {
                    validationMessages = {
                        required: I18n.get('formRequired') || validationMessages.required,
                        email: I18n.get('formEmail') || validationMessages.email,
                        number: I18n.get('formNumber') || validationMessages.number,
                        url: I18n.get('formUrl') || validationMessages.url,
                        tel: I18n.get('formTel') || validationMessages.tel,
                        minlength: I18n.get('formMinLength') || validationMessages.minlength,
                        maxlength: I18n.get('formMaxLength') || validationMessages.maxlength,
                        pattern: I18n.get('formPattern') || validationMessages.pattern,
                        match: I18n.get('formMatch') || validationMessages.match,
                        consent: I18n.get('formConsent') || validationMessages.consent
                    };
                }
                
                // Clear existing error messages
                document.querySelectorAll('.error-message').forEach(el => {
                    el.textContent = '';
                    el.classList.add('hidden');
                });
                
                // Remove validation states
                document.querySelectorAll('.is-invalid').forEach(field => {
                    field.classList.remove('is-invalid', 'border-red-500');
                    field.setAttribute('aria-invalid', 'false');
                });
            });
            
            isInitialized = true;
            console.log('Forms module initialized');
        },
        
        // Public methods
        validateForm,
        validateField,
        
        // Allow external submission of AJAX forms
        submitFormViaAjax
    };
})();

/**
 * =========================================================
 * COOKIE CONSENT MODULE
 * =========================================================
 */
const CookieConsent = (function() {
    let isInitialized = false;
    
    function checkCookieConsent() {
        return CookieUtil.get('cookie_consent') === 'accepted';
    }
    
    /**
     * Initialize the cookie consent banner with enhanced features
     */
    function init() {
        if (isInitialized) return;
        
        // Skip if cookie consent is disabled in config
        if (!CONFIG.features.cookieConsent) {
            isInitialized = true;
            return;
        }
        
        const consentBanner = document.getElementById('cookie-consent-banner');
        const acceptBtn = document.getElementById('cookie-accept');
        const declineBtn = document.getElementById('cookie-decline');
        const settingsBtn = document.getElementById('cookie-settings');
        
        // If banner elements don't exist and cookie consent not yet given, create them
        if (!consentBanner && !checkCookieConsent()) {
            createConsentBanner();
            
            // Redefine elements
            const consentBanner = document.getElementById('cookie-consent-banner');
            const acceptBtn = document.getElementById('cookie-accept');
            const declineBtn = document.getElementById('cookie-decline');
            const settingsBtn = document.getElementById('cookie-settings');
            
            setupConsentControls(consentBanner, acceptBtn, declineBtn, settingsBtn);
        } else if (consentBanner) {
            setupConsentControls(consentBanner, acceptBtn, declineBtn, settingsBtn);
        }
        
        isInitialized = true;
    }
    
    /**
     * Create cookie consent banner if it doesn't exist in the HTML
     */
    function createConsentBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.className = 'fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg p-4 transform translate-y-full transition-transform duration-500 z-50';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-labelledby', 'cookie-consent-title');
        banner.setAttribute('aria-describedby', 'cookie-consent-description');
        
        // Add content to the banner
        banner.innerHTML = `
            <div class="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                <div class="flex-1 pr-4">
                    <h2 id="cookie-consent-title" class="text-lg font-bold mb-2">${I18n.get('cookieTitle')}</h2>
                    <p id="cookie-consent-description" class="text-sm text-gray-600 dark:text-gray-300">
                        ${I18n.get('cookieConsentText')}
                        <a href="/privacy-policy" class="underline text-primary-600 hover:text-primary-700 dark:text-primary-400">
                            ${I18n.get('moreInfo')}
                        </a>
                    </p>
                </div>
                <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button id="cookie-settings" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400">
                        ${I18n.get('cookieSettings')}
                    </button>
                    <button id="cookie-decline" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400">
                        ${I18n.get('cookieDecline')}
                    </button>
                    <button id="cookie-accept" class="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
                        ${I18n.get('cookieAccept')}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(banner);
    }
    
    /**
     * Set up consent controls and animation
     */
    function setupConsentControls(banner, acceptBtn, declineBtn, settingsBtn) {
        if (!banner) return;
        
        // Check if consent has been given
        const hasConsent = checkCookieConsent();
        
        if (!hasConsent) {
            // Show banner with animation
            banner.classList.remove('hidden');
            
            // Delay animation slightly for better rendering
            setTimeout(() => {
                banner.style.transform = 'translateY(0)';
                
                // Announce for screen readers
                Accessibility.announce(I18n.get('cookieConsentText'), false);
            }, 300);
        }
        
        // Accept cookies
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                // Set cookie with secure attributes
                CookieUtil.set('cookie_consent', 'accepted', { 
                    expires: CONFIG.cookieExpiryDays,
                    sameSite: 'Lax',
                    domain: CONFIG.cookieDomain
                });
                
                // Hide banner with animation
                banner.style.transform = 'translateY(100%)';
                
                // Delay removal until animation completes
                setTimeout(() => {
                    banner.classList.add('hidden');
                }, 500);
                
                // Trigger accepted event for analytics
                document.dispatchEvent(new CustomEvent('cookieConsentAccepted'));
                
                // Initialize tracking if present
                initializeTracking();
            });
        }
        
        // Decline cookies
        if (declineBtn) {
            declineBtn.addEventListener('click', () => {
                // Set declined cookie
                CookieUtil.set('cookie_consent', 'declined', { 
                    expires: CONFIG.cookieExpiryDays,
                    sameSite: 'Lax',
                    domain: CONFIG.cookieDomain
                });
                
                // Hide banner with animation
                banner.style.transform = 'translateY(100%)';
                
                // Delay removal until animation completes
                setTimeout(() => {
                    banner.classList.add('hidden');
                }, 500);
                
                // Trigger declined event for analytics
                document.dispatchEvent(new CustomEvent('cookieConsentDeclined'));
            });
        }
        
        // Open cookie settings
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                // Open cookie settings modal
                openCookieSettings();
            });
        }
    }
    
    /**
     * Open detailed cookie settings modal
     */
    function openCookieSettings() {
        // Check if the modal already exists
        let modal = document.getElementById('cookie-settings-modal');
        
        if (!modal) {
            // Create the modal
            modal = document.createElement('div');
            modal.id = 'cookie-settings-modal';
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 opacity-0 transition-opacity duration-300';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-labelledby', 'cookie-settings-title');
            modal.setAttribute('aria-modal', 'true');
            
            // Create the modal content
            modal.innerHTML = `
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-90vh overflow-y-auto transform scale-95 transition-transform duration-300">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h2 id="cookie-settings-title" class="text-xl font-bold">${I18n.get('cookieSettingsTitle')}</h2>
                            <button id="close-cookie-settings" class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 focus:outline-none">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <p class="mb-6 text-gray-600 dark:text-gray-300">${I18n.get('cookieSettingsDescription')}</p>
                        
                        <div class="space-y-6">
                            <!-- Essential Cookies -->
                            <div class="flex items-center justify-between pb-4 border-b">
                                <div>
                                    <h3 class="font-medium">${I18n.get('essentialCookies')}</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">${I18n.get('essentialCookiesDescription')}</p>
                                </div>
                                <div class="relative">
                                    <input type="checkbox" id="essential-cookies" checked disabled class="sr-only">
                                    <div class="w-11 h-6 bg-gray-200 rounded-full">
                                        <div class="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-5"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Analytics Cookies -->
                            <div class="flex items-center justify-between pb-4 border-b">
                                <div>
                                    <h3 class="font-medium">${I18n.get('analyticsCookies')}</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">${I18n.get('analyticsCookiesDescription')}</p>
                                </div>
                                <div class="relative">
                                    <input type="checkbox" id="analytics-cookies" class="sr-only">
                                    <label for="analytics-cookies" class="flex items-center cursor-pointer">
                                        <div class="toggle-bg w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full transition"></div>
                                        <div class="toggle-dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                                    </label>
                                </div>
                            </div>
                            
                            <!-- Marketing Cookies -->
                            <div class="flex items-center justify-between pb-4 border-b">
                                <div>
                                    <h3 class="font-medium">${I18n.get('marketingCookies')}</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">${I18n.get('marketingCookiesDescription')}</p>
                                </div>
                                <div class="relative">
                                    <input type="checkbox" id="marketing-cookies" class="sr-only">
                                    <label for="marketing-cookies" class="flex items-center cursor-pointer">
                                        <div class="toggle-bg w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full transition"></div>
                                        <div class="toggle-dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                                    </label>
                                </div>
                            </div>
                            
                            <!-- Preference Cookies -->
                            <div class="flex items-center justify-between">
                                <div>
                                    <h3 class="font-medium">${I18n.get('preferenceCookies')}</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">${I18n.get('preferenceCookiesDescription')}</p>
                                </div>
                                <div class="relative">
                                    <input type="checkbox" id="preference-cookies" class="sr-only">
                                    <label for="preference-cookies" class="flex items-center cursor-pointer">
                                        <div class="toggle-bg w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full transition"></div>
                                        <div class="toggle-dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-8 flex justify-end space-x-4">
                            <button id="save-cookie-preferences" class="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
                                ${I18n.get('savePreferences')}
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Get current preferences
            initializeToggles();
            
            // Add event listeners
            document.getElementById('close-cookie-settings').addEventListener('click', () => {
                closeModal();
            });
            
            document.getElementById('save-cookie-preferences').addEventListener('click', () => {
                savePreferences();
                closeModal();
            });
            
            // Close when clicking overlay
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });
            
            // Close with Escape key
            document.addEventListener('keydown', function handleEscKey(e) {
                if (e.key === 'Escape' && modal.classList.contains('opacity-100')) {
                    closeModal();
                    document.removeEventListener('keydown', handleEscKey);
                }
            });
            
            // Style toggle switches
            const toggleStyle = document.createElement('style');
            toggleStyle.textContent = `
                input:checked + label .toggle-bg {
                    background-color: var(--primary-600, #2563eb);
                }
                input:checked + label .toggle-dot {
                    transform: translateX(100%);
                }
                input:focus + label .toggle-bg {
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
                }
            `;
            document.head.appendChild(toggleStyle);
        }
        
        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('opacity-100');
            modal.querySelector('div').classList.remove('scale-95');
            modal.querySelector('div').classList.add('scale-100');
            
            // Focus first focusable element
            const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }, 10);
        
        // Trap focus in modal
        Accessibility.activate(modal, null, () => closeModal());
    }
    
    /**
     * Close cookie settings modal
     */
    function closeModal() {
        const modal = document.getElementById('cookie-settings-modal');
        
        if (modal) {
            modal.classList.remove('opacity-100');
            modal.querySelector('div').classList.remove('scale-100');
            modal.querySelector('div').classList.add('scale-95');
            
            // Remove after animation
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
                Accessibility.deactivate();
            }, 300);
        }
    }
    
    /**
     * Initialize toggle switches based on current preferences
     */
    function initializeToggles() {
        const preferences = getCookiePreferences();
        
        // Set toggle states
        document.getElementById('analytics-cookies').checked = preferences.analytics || false;
        document.getElementById('marketing-cookies').checked = preferences.marketing || false;
        document.getElementById('preference-cookies').checked = preferences.preferences || false;
    }
    
    /**
     * Save cookie preferences
     */
    function savePreferences() {
        const preferences = {
            essential: true, // Always required
            analytics: document.getElementById('analytics-cookies').checked,
            marketing: document.getElementById('marketing-cookies').checked,
            preferences: document.getElementById('preference-cookies').checked
        };
        
        // Save preferences
        CookieUtil.set('cookie_preferences', JSON.stringify(preferences), { 
            expires: CONFIG.cookieExpiryDays,
            sameSite: 'Lax',
            domain: CONFIG.cookieDomain
        });
        
        // Set consented flag
        CookieUtil.set('cookie_consent', 'accepted', { 
            expires: CONFIG.cookieExpiryDays,
            sameSite: 'Lax',
            domain: CONFIG.cookieDomain
        });
        
        // Hide the banner if it's visible
        const banner = document.getElementById('cookie-consent-banner');
        if (banner && getComputedStyle(banner).transform !== 'matrix(1, 0, 0, 1, 0, 0)') {
            banner.style.transform = 'translateY(100%)';
            
            setTimeout(() => {
                banner.classList.add('hidden');
            }, 500);
        }
        
        // Apply preferences (enable/disable tracking)
        applyPreferences(preferences);
        
        // Trigger event for analytics
        document.dispatchEvent(new CustomEvent('cookiePreferencesUpdated', { 
            detail: preferences 
        }));
    }
    
    /**
     * Apply cookie preferences
     */
    function applyPreferences(preferences) {
        // Apply analytics preferences
        if (preferences.analytics) {
            initializeAnalytics();
        } else {
            disableAnalytics();
        }
        
        // Apply marketing preferences
        if (preferences.marketing) {
            initializeMarketingTools();
        } else {
            disableMarketingTools();
        }
    }
    
    /**
     * Get current cookie preferences
     */
    function getCookiePreferences() {
        const preferencesStr = CookieUtil.get('cookie_preferences');
        
        if (preferencesStr) {
            try {
                return JSON.parse(preferencesStr);
            } catch (e) {
                console.error('Error parsing cookie preferences:', e);
            }
        }
        
        // Default preferences
        return {
            essential: true,
            analytics: false,
            marketing: false,
            preferences: false
        };
    }
    
    /**
     * Initialize tracking scripts based on consent
     */
    function initializeTracking() {
        const preferences = getCookiePreferences();
        
        // Apply preferences
        applyPreferences(preferences);
    }
    
    /**
     * Initialize analytics scripts
     */
    function initializeAnalytics() {
        // Only add scripts if they don't already exist
        if (!document.getElementById('analytics-script')) {
            console.log('Analytics enabled - would load scripts in production');
            
            // Example: Google Analytics script
            // const script = document.createElement('script');
            // script.id = 'analytics-script';
            // script.src = 'https://www.googletagmanager.com/gtag/js?id=YOUR-GA-ID';
            // script.async = true;
            // document.head.appendChild(script);
            
            // Example: Google Analytics initialization
            // window.dataLayer = window.dataLayer || [];
            // function gtag() { dataLayer.push(arguments); }
            // gtag('js', new Date());
            // gtag('config', 'YOUR-GA-ID', { 'anonymize_ip': true });
        }
    }
    
    /**
     * Disable analytics scripts
     */
    function disableAnalytics() {
        console.log('Analytics disabled - would remove scripts in production');
        
        // Remove existing analytics cookies
        document.cookie.split(';').forEach(function(c) {
            if (c.trim().startsWith('_ga') || c.trim().startsWith('_gid') || c.trim().startsWith('_gat')) {
                document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
            }
        });
    }
    
    /**
     * Initialize marketing scripts
     */
    function initializeMarketingTools() {
        console.log('Marketing cookies enabled - would load scripts in production');
        
        // Example: Facebook Pixel, Google Ads, etc.
    }
    
    /**
     * Disable marketing scripts
     */
    function disableMarketingTools() {
        console.log('Marketing cookies disabled - would remove scripts in production');
        
        // Remove marketing cookies
        document.cookie.split(';').forEach(function(c) {
            if (c.trim().startsWith('_fbp') || c.trim().startsWith('_fbc')) {
                document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
            }
        });
    }
    
    // Return public API
    return {
        init,
        checkConsent: checkCookieConsent,
        openSettings: openCookieSettings
    };
})();

/**
 * =========================================================
 * PROPOSAL VIEW MODULE
 * =========================================================
 */
const ProposalView = (function() {
    let activeState = false;
    let isInitialized = false;
    
    /**
     * Initialize proposal view functionality
     */
    function init() {
        if (isInitialized) return;
        
        // Skip if proposal feature is disabled
        if (!CONFIG.features.proposalView) {
            // Hide proposal links if the feature is disabled
            document.querySelectorAll('#view-proposal-link, #view-proposal-link-mobile').forEach(link => {
                if (link) link.style.display = 'none';
            });
            
            isInitialized = true;
            return;
        }
        
        const proposalView = document.getElementById('proposal-view');
        const viewLinks = document.querySelectorAll('#view-proposal-link, #view-proposal-link-mobile, [data-target="proposal-view"]');
        
        if (!proposalView) {
            // Hide proposal links if the view doesn't exist
            viewLinks.forEach(link => {
                if (link) link.style.display = 'none';
            });
            
            isInitialized = true;
            return;
        }
        
        /**
         * Update view state based on URL hash
         */
        function updateView() {
            const shouldShow = window.location.hash === '#proposal-view';
            const mainSections = document.querySelectorAll('main > section:not(#proposal-view)');
            const footer = document.querySelector('footer');
            
            // Update state tracking
            activeState = shouldShow;
            
            if (shouldShow) {
                // First, ensure the section is not hidden by display: none
                proposalView.classList.remove('hidden');
                proposalView.hidden = false;
                proposalView.style.display = 'block';
                
                // Add appearing animation
                proposalView.style.opacity = '0';
                
                // Hide main sections with smooth transition
                mainSections.forEach(section => {
                    section.style.opacity = '0';
                    section.style.transition = 'opacity 0.3s ease-out';
                });
                
                if (footer) {
                    footer.style.opacity = '0';
                    footer.style.transition = 'opacity 0.3s ease-out';
                }
                
                // After main sections fade out, complete the transition
                setTimeout(() => {
                    mainSections.forEach(section => {
                        section.style.display = 'none';
                    });
                    
                    if (footer) footer.style.display = 'none';
                    
                    // Show the proposal view with fade-in
                    proposalView.style.opacity = '1';
                    proposalView.style.transition = 'opacity 0.3s ease-in';
                    
                    // Scroll to top of proposal
                    const heroProposal = document.getElementById('hero-proposal');
                    if (heroProposal) {
                        heroProposal.scrollIntoView({ behavior: 'smooth' });
                    }
                    
                    // Update document title for better SEO and bookmarking
                    const proposalTitle = proposalView.querySelector('h1, .proposal-title')?.textContent || 'Proposal';
                    document.title = `${proposalTitle} | ${document.title.split(' | ')[1] || 'IAA Solutions'}`;
                    
                    // Update meta description for better SEO
                    const metaDescription = document.querySelector('meta[name="description"]');
                    if (metaDescription) {
                        metaDescription.setAttribute('data-original-description', metaDescription.getAttribute('content'));
                        
                        const proposalDescription = proposalView.querySelector('.proposal-description')?.textContent || 
                                                  proposalView.querySelector('p')?.textContent;
                                                  
                        if (proposalDescription) {
                            metaDescription.setAttribute('content', proposalDescription.substring(0, 160));
                        }
                    }
                    
                    // Create breadcrumb schema for proposal view
                    if (CONFIG.generateStructuredData) {
                        const breadcrumbSchema = {
                            "@context": "https://schema.org",
                            "@type": "BreadcrumbList",
                            "itemListElement": [
                                {
                                    "@type": "ListItem",
                                    "position": 1,
                                    "name": "Home",
                                    "item": window.location.origin
                                },
                                {
                                    "@type": "ListItem",
                                    "position": 2,
                                    "name": proposalTitle,
                                    "item": window.location.href
                                }
                            ]
                        };
                        
                        // Add proposal schema
                        const scriptTag = document.createElement('script');
                        scriptTag.type = 'application/ld+json';
                        scriptTag.id = 'proposal-schema';
                        scriptTag.textContent = JSON.stringify(breadcrumbSchema);
                        document.head.appendChild(scriptTag);
                    }
                }, 300);
                
                // Update active state on nav links
                viewLinks.forEach(link => {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                });
                
                // Track view in analytics
                if (window.dataLayer) {
                    window.dataLayer.push({
                        event: 'proposalView',
                        proposalTitle: proposalView.querySelector('h1, .proposal-title')?.textContent || 'Proposal'
                    });
                }
                
                // Announce to screen readers
                Accessibility.announce(I18n.get('proposalViewActive'), false);
            } else {
                // Hide proposal view with animation
                proposalView.style.opacity = '0';
                proposalView.style.transition = 'opacity 0.3s ease-out';
                
                // After fade-out, complete the transition
                setTimeout(() => {
                    proposalView.classList.add('hidden');
                    proposalView.hidden = true;
                    
                    // Show main sections with fade-in
                    mainSections.forEach(section => {
                        section.style.display = '';
                        section.style.opacity = '0';
                        
                        // Force reflow
                        section.offsetHeight;
                        
                        section.style.opacity = '1';
                        section.style.transition = 'opacity 0.3s ease-in';
                    });
                    
                    if (footer) {
                        footer.style.display = '';
                        footer.style.opacity = '0';
                        
                        // Force reflow
                        footer.offsetHeight;
                        
                        footer.style.opacity = '1';
                        footer.style.transition = 'opacity 0.3s ease-in';
                    }
                    
                    // Restore original document title
                    document.title = document.title.split(' | ')[1] || 'IAA Solutions';
                    
                    // Restore original meta description
                    const metaDescription = document.querySelector('meta[name="description"]');
                    if (metaDescription && metaDescription.hasAttribute('data-original-description')) {
                        metaDescription.setAttribute('content', metaDescription.getAttribute('data-original-description'));
                        metaDescription.removeAttribute('data-original-description');
                    }
                    
                    // Remove proposal schema
                    const proposalSchema = document.getElementById('proposal-schema');
                    if (proposalSchema) {
                        proposalSchema.parentNode.removeChild(proposalSchema);
                    }
                }, 300);
                
                // Update active state on nav links
                viewLinks.forEach(link => {
                    link.classList.remove('active');
                    link.removeAttribute('aria-current');
                });
                
                // Announce to screen readers
                Accessibility.announce(I18n.get('mainViewActive'), false);
            }
        }
        
        // Initial check
        updateView();
        
        // Listen for hash changes
        window.addEventListener('hashchange', updateView);
        
        // Handle links to the proposal view
        viewLinks.forEach(link => {
            if (!link) return;
            
            link.addEventListener('click', function(e) {
                // Default behavior for hash navigation, but with enhancements
                
                // Close mobile menu if open
                if (Header.isMobileMenuOpen && Header.isMobileMenuOpen()) {
                    Header.closeMobileMenu();
                }
                
                // If already on proposal view, prevent default and just scroll to top
                if (window.location.hash === '#proposal-view' && activeState) {
                    e.preventDefault();
                    
                    const heroProposal = document.getElementById('hero-proposal');
                    if (heroProposal) {
                        heroProposal.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                }
                
                // Force hash change event if the hash hasn't changed
                if (window.location.hash === '#proposal-view') {
                    setTimeout(updateView, 0);
                }
                
                // Track click in analytics
                if (window.dataLayer) {
                    window.dataLayer.push({
                        event: 'proposalLinkClick',
                        linkLocation: link.closest('header') ? 'header' : 'page'
                    });
                }
            });
        });
        
        // Handle section links when proposal view is active
        document.querySelectorAll('a[href^="#"]:not([href="#"]):not([href="#proposal-view"])').forEach(link => {
            link.addEventListener('click', function(e) {
                // If proposal view is active
                if (activeState) {
                    // Get the target section ID
                    const targetId = this.getAttribute('href').substring(1);
                    const targetSection = document.getElementById(targetId);
                    
                    if (!targetSection) return;
                    
                    // Prevent default to handle navigation manually
                    e.preventDefault();
                    
                    // Update hash without scrolling
                    history.pushState(null, '', `#${targetId}`);
                    
                    // Hide proposal view
                    proposalView.style.opacity = '0';
                    proposalView.style.transition = 'opacity 0.3s ease-out';
                    
                    setTimeout(() => {
                        proposalView.classList.add('hidden');
                        proposalView.hidden = true;
                        
                        // Show main sections and footer
                        const mainSections = document.querySelectorAll('main > section:not(#proposal-view)');
                        const footer = document.querySelector('footer');
                        
                        mainSections.forEach(section => {
                            section.style.display = '';
                            section.style.opacity = '1';
                        });
                        
                        if (footer) {
                            footer.style.display = '';
                            footer.style.opacity = '1';
                        }
                        
                        // Update nav links
                        viewLinks.forEach(vLink => {
                            vLink.classList.remove('active');
                            vLink.removeAttribute('aria-current');
                        });
                        
                        // Calculate header height for offset
                        const headerHeight = document.getElementById('header')?.offsetHeight || 0;
                        
                        // Scroll to the target section with proper offset
                        const sectionTitle = targetSection.querySelector('h2, h3, .section-header') || targetSection;
                        const targetPosition = sectionTitle.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                        
                        // Update active state for the clicked link
                        document.querySelectorAll('.nav-link').forEach(navLink => {
                            const navLinkTarget = navLink.getAttribute('href');
                            const isActive = navLinkTarget === `#${targetId}`;
                            navLink.classList.toggle('active', isActive);
                            
                            if (isActive) {
                                navLink.setAttribute('aria-current', 'page');
                            } else {
                                navLink.removeAttribute('aria-current');
                            }
                        });
                        
                        // Update activeState flag
                        activeState = false;
                        
                        // Restore original document title
                        document.title = document.title.split(' | ')[1] || 'IAA Solutions';
                        
                        // Restore original meta description
                        const metaDescription = document.querySelector('meta[name="description"]');
                        if (metaDescription && metaDescription.hasAttribute('data-original-description')) {
                            metaDescription.setAttribute('content', metaDescription.getAttribute('data-original-description'));
                            metaDescription.removeAttribute('data-original-description');
                        }
                        
                        // Remove proposal schema
                        const proposalSchema = document.getElementById('proposal-schema');
                        if (proposalSchema) {
                            proposalSchema.parentNode.removeChild(proposalSchema);
                        }
                    }, 300);
                    
                    // Track navigation in analytics
                    if (window.dataLayer) {
                        window.dataLayer.push({
                            event: 'proposalToSectionNavigation',
                            targetSection: targetId
                        });
                    }
                }
            });
        });
        
        // Handle back/forward navigation with proper focus management
        window.addEventListener('popstate', function(event) {
            // Call updateView to handle the state change
            updateView();
            
            // Set focus appropriately based on the new state
            if (window.location.hash === '#proposal-view') {
                // Focus on the proposal view
                const proposalHeading = proposalView.querySelector('h1, .proposal-title');
                if (proposalHeading) {
                    proposalHeading.setAttribute('tabindex', '-1');
                    proposalHeading.focus();
                    setTimeout(() => proposalHeading.removeAttribute('tabindex'), 1000);
                }
            } else if (window.location.hash && window.location.hash !== '#') {
                // Focus on the section that was navigated to
                const targetSection = document.querySelector(window.location.hash);
                if (targetSection) {
                    targetSection.setAttribute('tabindex', '-1');
                    targetSection.focus();
                    setTimeout(() => targetSection.removeAttribute('tabindex'), 1000);
                }
            }
        });
        
        isInitialized = true;
        console.log('Proposal View module initialized');
    }
    
    return {
        init,
        
        // Public method to check if proposal view is active
        isActive: function() {
            return activeState;
        },
        
        // Method to programmatically show the proposal view
        show: function() {
            if (!isInitialized) init();
            
            if (!activeState) {
                window.location.hash = 'proposal-view';
            }
        },
        
        // Method to programmatically hide the proposal view
        hide: function() {
            if (!isInitialized) init();
            
            if (activeState) {
                // Remove the hash but keep the rest of the URL
                history.pushState("", document.title, window.location.pathname + window.location.search);
                
                // Update the view
                const event = new HashChangeEvent('hashchange');
                window.dispatchEvent(event);
            }
        }
    };
})();

/**
 * =========================================================
 * ANIMATIONS MODULE
 * =========================================================
 */
const Animations = (function() {
    let isInitialized = false;
    
    /**
     * Initialize AOS (Animate On Scroll) with enhanced configuration
     */
    function initAOS() {
        if (typeof AOS === 'undefined') return;
        
        // Skip animations for users who prefer reduced motion
        if (MediaUtil.prefersReducedMotion() && CONFIG.prefersReducedMotionEnabled) {
            console.log('Reduced motion preference detected, disabling animations');
            return;
        }
        
        AOS.init({
            duration: CONFIG.aosDuration || 800,
            easing: 'ease-in-out',
            once: true,
            offset: 50,
            delay: 0,
            mirror: false,
            anchorPlacement: 'top-bottom',
            disable: function() {
                return window.innerWidth < 768 || 
                      (MediaUtil.prefersReducedMotion() && CONFIG.prefersReducedMotionEnabled);
            }
        });
        
        // Refresh AOS when the window is resized to handle layout changes
        window.addEventListener('resize', debounce(() => {
            AOS.refresh();
        }, 150));
        
        // Manually refresh AOS after any collapse/expand that might affect layout
        document.addEventListener('layoutChange', () => {
            setTimeout(() => AOS.refresh(), 50);
        });
    }
    
    /**
     * Initialize counter animations with intersection observer
     */
    function initCounters() {
        if (typeof CountUp === 'undefined') return;
        
        const counters = document.querySelectorAll('.stat-number[data-count], [data-counter]');
        if (!counters.length) return;
        
        // Skip animations for users who prefer reduced motion
        const reduceMotion = MediaUtil.prefersReducedMotion() && CONFIG.prefersReducedMotionEnabled;
        
        // Set up intersection observer for counters
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const endVal = parseFloat(target.dataset.count || target.dataset.counter);
                    
                    if (!isNaN(endVal)) {
                        if (reduceMotion) {
                            // Skip animation for reduced motion preference
                            target.textContent = endVal.toLocaleString();
                        } else {
                            // Get counter options
                            const prefix = target.dataset.prefix || '';
                            const suffix = target.dataset.suffix || '';
                            const duration = parseFloat(target.dataset.duration) || CONFIG.counterDuration || 2.5;
                            const decimals = parseInt(target.dataset.decimals, 10) || 0;
                            
                            // Create CountUp instance with enhanced options
                            const countUp = new CountUp.CountUp(target, endVal, {
                                startVal: 0,
                                duration: duration,
                                decimalPlaces: decimals,
                                useEasing: true,
                                useGrouping: true,
                                separator: ',',
                                decimal: '.',
                                prefix: prefix,
                                suffix: suffix
                            });
                            
                            if (!countUp.error) {
                                countUp.start();
                            } else {
                                console.error('CountUp error:', countUp.error);
                                // Fallback
                                target.textContent = `${prefix}${endVal.toLocaleString()}${suffix}`;
                            }
                        }
                    }
                    
                    // Unobserve after animating
                    observer.unobserve(target);
                }
            });
        }, { threshold: 0.2 });
        
        // Observe counters
        counters.forEach(counter => observer.observe(counter));
    }
    
    /**
     * Initialize testimonial slider with enhanced features
     */
    function initTestimonialSlider() {
        if (typeof Swiper === 'undefined' || !CONFIG.features.testimonials) return;
        
        const sliders = document.querySelectorAll('.testimonial-slider');
        
        sliders.forEach((slider, index) => {
            // Skip if already initialized
            if (slider.swiper) return;
            
            // Give a unique ID if none exists
            if (!slider.id) slider.id = `testimonial-slider-${index}`;
            
            // Get slider container
            const sliderContainer = slider.closest('.testimonials-container') || slider.parentNode;
            
            // Find or create pagination, navigation elements
            let pagination = slider.querySelector('.swiper-pagination') || sliderContainer.querySelector('.slider-pagination');
            let prevButton = sliderContainer.querySelector('.slider-prev');
            let nextButton = sliderContainer.querySelector('.slider-next');
            
            // Create pagination if it doesn't exist
            if (!pagination) {
                pagination = document.createElement('div');
                pagination.className = 'swiper-pagination slider-pagination';
                slider.appendChild(pagination);
            }
            
            // Create navigation buttons if they don't exist
            if (!prevButton) {
                prevButton = document.createElement('button');
                prevButton.className = 'slider-prev swiper-button-prev';
                prevButton.innerHTML = `
                    <span class="sr-only">${I18n.get('previous')}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                `;
                prevButton.setAttribute('aria-label', I18n.get('previous'));
                sliderContainer.appendChild(prevButton);
            }
            
            if (!nextButton) {
                nextButton = document.createElement('button');
                nextButton.className = 'slider-next swiper-button-next';
                nextButton.innerHTML = `
                    <span class="sr-only">${I18n.get('next')}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                `;
                nextButton.setAttribute('aria-label', I18n.get('next'));
                sliderContainer.appendChild(nextButton);
            }
            
            // Configure autoplay based on reduced motion preference
            const shouldAutoplay = !MediaUtil.prefersReducedMotion() || !CONFIG.prefersReducedMotionEnabled;
            
            // Initialize Swiper with enhanced options
            const testimonialSwiper = new Swiper(slider, {
                slidesPerView: 1,
                spaceBetween: 30,
                loop: true,
                grabCursor: true,
                autoHeight: true,
                autoplay: shouldAutoplay ? {
                    delay: CONFIG.testimonialAutoplayDelay || 5000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true
                } : false,
                speed: shouldAutoplay ? 600 : 300,
                pagination: {
                    el: pagination,
                    clickable: true,
                    bulletClass: 'swiper-pagination-bullet',
                    bulletActiveClass: 'swiper-pagination-bullet-active',
                    renderBullet: function(index, className) {
                        return `<button class="${className}" aria-label="${I18n.get('goToTestimonial')} ${index + 1}"></button>`;
                    }
                },
                navigation: {
                    nextEl: nextButton,
                    prevEl: prevButton
                },
                a11y: {
                    enabled: true,
                    prevSlideMessage: I18n.get('previousTestimonial'),
                    nextSlideMessage: I18n.get('nextTestimonial'),
                    paginationBulletMessage: I18n.get('goToTestimonial') + ' {{index}}'
                },
                breakpoints: {
                    768: {
                        slidesPerView: 1.2,
                        centeredSlides: true
                    },
                    1024: {
                        slidesPerView: 1.5,
                        centeredSlides: true
                    }
                },
                on: {
                    slideChange: function() {
                        // Announce slide change to screen readers
                        const activeIndex = this.realIndex + 1;
                        const totalSlides = this.slides.length - this.loopedSlides * 2;
                        Accessibility.announce(`${I18n.get('testimonial')} ${activeIndex} ${I18n.get('of')} ${totalSlides}`);
                        
                        // Track slide change in analytics
                        if (window.dataLayer) {
                            window.dataLayer.push({
                                event: 'testimonialSlideChange',
                                sliderId: slider.id,
                                slideIndex: activeIndex
                            });
                        }
                    }
                }
            });
            
            // Add keyboard navigation for accessibility
            slider.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    testimonialSwiper.slidePrev();
                    e.preventDefault();
                } else if (e.key === 'ArrowRight') {
                    testimonialSwiper.slideNext();
                    e.preventDefault();
                }
            });
            
            // Pause autoplay when tab is not visible for better performance
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    testimonialSwiper.autoplay.stop();
                } else if (shouldAutoplay) {
                    testimonialSwiper.autoplay.start();
                }
            });
        });
    }
    
    /**
     * Initialize parallax backgrounds with high performance
     */
    function initParallax() {
        const parallaxElements = document.querySelectorAll('.parallax-bg, [data-parallax]');
        
        if (!parallaxElements.length) return;
        
        // Skip for reduced motion preference
        if (MediaUtil.prefersReducedMotion() && CONFIG.prefersReducedMotionEnabled) {
            // Add fallback styling for parallax elements
            parallaxElements.forEach(element => {
                element.style.transform = 'none';
                element.style.backgroundPosition = 'center center';
            });
            return;
        }
        
        // Use requestAnimationFrame for smooth parallax effect
        let ticking = false;
        let scrollY = window.scrollY;
        
        function updateParallax() {
            parallaxElements.forEach(element => {
                const speed = parseFloat(element.getAttribute('data-parallax') || element.getAttribute('data-parallax-speed') || 0.2);
                const elementTop = element.getBoundingClientRect().top + scrollY;
                const elementHeight = element.offsetHeight;
                
                // Only apply parallax if element is in viewport (with buffer)
                if (scrollY + window.innerHeight > elementTop - 200 && scrollY < elementTop + elementHeight + 200) {
                    // Calculate parallax offset
                    const offset = (scrollY - elementTop) * speed;
                    
                    // Apply transform with hardware acceleration
                    element.style.transform = `translate3d(0, ${offset}px, 0)`;
                }
            });
            
            ticking = false;
        }
        
        // Listen for scroll events with high performance
        window.addEventListener('scroll', () => {
            scrollY = window.scrollY;
            
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateParallax();
                    ticking = false;
                });
                
                ticking = true;
            }
        }, { passive: true });
        
        // Initial update
        updateParallax();
        
        // Update on resize
        window.addEventListener('resize', debounce(() => {
            scrollY = window.scrollY;
            updateParallax();
        }, 100), { passive: true });
    }
    
    /**
     * Initialize particles background with performance optimizations
     */
    function initParticles() {
        if (typeof particlesJS === 'undefined') return;
        
        const particlesContainer = document.getElementById('particles-js');
        if (!particlesContainer) return;
        
        // Skip for reduced motion preference
        if (MediaUtil.prefersReducedMotion() && CONFIG.prefersReducedMotionEnabled) {
            // Add simple background instead
            particlesContainer.style.backgroundColor = 'var(--primary-100, #e6f2ff)';
            return;
        }
        
        // Determine colors based on theme
        const isDarkMode = document.documentElement.classList.contains('dark');
        const particleColor = isDarkMode ? '#ffffff' : '#000000';
        const lineColor = isDarkMode ? '#ffffff' : '#000000';
        
        // Initialize with optimized settings for performance
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: MediaUtil.isMobile() ? 30 : 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: particleColor
                },
                shape: {
                    type: "circle",
                },
                opacity: {
                    value: 0.5,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: lineColor,
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "out",
                    bounce: false,
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: {
                        enable: true,
                        mode: "grab"
                    },
                    onclick: {
                        enable: false
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 1
                        }
                    }
                }
            },
            retina_detect: true
        });
        
        // Update particles colors when theme changes
        document.addEventListener('themeChanged', (e) => {
            const isDark = e.detail.theme === 'dark';
            
            // Destroy and reinitialize with new colors
            if (window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS) {
                // Update existing particles
                const particles = window.pJSDom[0].pJS.particles;
                particles.color.value = isDark ? '#ffffff' : '#000000';
                particles.line_linked.color = isDark ? '#ffffff' : '#000000';
                
                // Refresh particles
                window.pJSDom[0].pJS.fn.particlesRefresh();
            }
        });
        
        // Pause animation when tab is not visible
        document.addEventListener('visibilitychange', () => {
            if (window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS) {
                if (document.hidden) {
                    window.pJSDom[0].pJS.particles.move.enable = false;
                } else {
                    window.pJSDom[0].pJS.particles.move.enable = true;
                }
            }
        });
    }
    
    /**
     * Initialize lazy loading for images with advanced features
     */
    function initLazyLoading() {
        // Skip if lazy loading is disabled in config
        if (!CONFIG.lazyLoadImages) return;
        
        // Use native lazy loading when available
        if ('loading' in HTMLImageElement.prototype) {
            document.querySelectorAll('img[data-src]:not([loading])').forEach(img => {
                img.src = img.dataset.src;
                if (img.dataset.srcset) {
                    img.srcset = img.dataset.srcset;
                }
                img.setAttribute('loading', 'lazy');
            });
        } else {
            // Fallback to Intersection Observer
            const lazyImageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        
                        if (img.dataset.srcset) {
                            img.srcset = img.dataset.srcset;
                        }
                        
                        img.onload = () => {
                            img.classList.add('loaded');
                            img.classList.remove('lazy-image');
                        };
                        
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: CONFIG.lazyLoadThreshold || '200px'
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                lazyImageObserver.observe(img);
            });
        }
        
        // Handle error fallbacks for all images
        document.querySelectorAll('img').forEach(img => {
            if (!img.hasAttribute('data-error-handled')) {
                img.addEventListener('error', function() {
                    // Try fallback image if specified
                    const fallback = this.getAttribute('data-fallback');
                    if (fallback && this.src !== fallback) {
                        this.src = fallback;
                    } else {
                        // Use default fallback image
                        this.src = '/assets/images/image-placeholder.svg';
                        this.alt = this.alt || 'Image could not be loaded';
                    }
                });
                
                img.setAttribute('data-error-handled', 'true');
            }
        });
    }
    
    /**
     * Initialize animations on scroll with intersection observer
     */
    function initScrollAnimations() {
        // Skip if AOS is available (it will handle animations)
        if (typeof AOS !== 'undefined') return;
        
        // Skip for reduced motion preference
        if (MediaUtil.prefersReducedMotion() && CONFIG.prefersReducedMotionEnabled) return;
        
        // Define animation classes
        const animationClasses = [
            'fade-in', 'fade-up', 'fade-down', 'fade-left', 'fade-right',
            'zoom-in', 'zoom-out', 'slide-up', 'slide-down', 'slide-left', 'slide-right'
        ];
        
        // Get all elements with animation classes
        const elementsToAnimate = [];
        
        animationClasses.forEach(className => {
            const elements = document.querySelectorAll(`.${className}, [data-animation="${className}"]`);
            elements.forEach(el => elementsToAnimate.push(el));
        });
        
        // Early return if no elements to animate
        if (elementsToAnimate.length === 0) return;
        
        // Initialize all elements as hidden
        elementsToAnimate.forEach(el => {
            if (!el.classList.contains('animated')) {
                el.style.opacity = '0';
                el.style.transform = getInitialTransform(el);
                el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            }
        });
        
        // Create observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    
                    // Get animation delay
                    const delay = parseInt(el.getAttribute('data-delay'), 10) || 0;
                    
                    // Apply animation after delay
                    setTimeout(() => {
                        el.style.opacity = '1';
                        el.style.transform = 'translate3d(0, 0, 0)';
                        el.classList.add('animated');
                    }, delay);
                    
                    // Stop observing after animation
                    observer.unobserve(el);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -10% 0px'
        });
        
        // Observe all elements
        elementsToAnimate.forEach(el => {
            observer.observe(el);
        });
        
        // Helper function to get initial transform based on animation class
        function getInitialTransform(el) {
            const classes = el.classList;
            const animation = el.getAttribute('data-animation');
            
            if (classes.contains('fade-up') || animation === 'fade-up') {
                return 'translate3d(0, 40px, 0)';
            } else if (classes.contains('fade-down') || animation === 'fade-down') {
                return 'translate3d(0, -40px, 0)';
            } else if (classes.contains('fade-left') || animation === 'fade-left') {
                return 'translate3d(40px, 0, 0)';
            } else if (classes.contains('fade-right') || animation === 'fade-right') {
                return 'translate3d(-40px, 0, 0)';
            } else if (classes.contains('zoom-in') || animation === 'zoom-in') {
                return 'scale(0.9)';
            } else if (classes.contains('zoom-out') || animation === 'zoom-out') {
                return 'scale(1.1)';
            } else if (classes.contains('slide-up') || animation === 'slide-up') {
                return 'translate3d(0, 100%, 0)';
            } else if (classes.contains('slide-down') || animation === 'slide-down') {
                return 'translate3d(0, -100%, 0)';
            } else if (classes.contains('slide-left') || animation === 'slide-left') {
                return 'translate3d(100%, 0, 0)';
            } else if (classes.contains('slide-right') || animation === 'slide-right') {
                return 'translate3d(-100%, 0, 0)';
            }
            
            return 'translate3d(0, 0, 0)';
        }
    }
    
    /**
     * Initialize typed.js text animations
     */
    function initTypedText() {
        if (typeof Typed === 'undefined') return;
        
        // Skip for reduced motion preference
        if (MediaUtil.prefersReducedMotion() && CONFIG.prefersReducedMotionEnabled) return;
        
        document.querySelectorAll('.typed-text, [data-typed-strings]').forEach(element => {
            let options = {};
            
            // Get strings from data attribute or child elements
            if (element.hasAttribute('data-typed-strings')) {
                try {
                    options.strings = JSON.parse(element.getAttribute('data-typed-strings'));
                } catch (e) {
                    // Fallback to comma-separated string
                    options.strings = element.getAttribute('data-typed-strings').split(',');
                }
            } else {
                // Get strings from child elements
                const stringElements = element.querySelectorAll('.typed-string');
                if (stringElements.length) {
                    options.strings = Array.from(stringElements).map(el => el.textContent);
                    
                    // Hide string elements
                    stringElements.forEach(el => {
                        el.style.display = 'none';
                    });
                }
            }
            
            // Skip if no strings found
            if (!options.strings || options.strings.length === 0) return;
            
            // Get additional options from data attributes
            options.typeSpeed = parseInt(element.getAttribute('data-type-speed'), 10) || 80;
            options.backSpeed = parseInt(element.getAttribute('data-back-speed'), 10) || 50;
            options.startDelay = parseInt(element.getAttribute('data-start-delay'), 10) || 300;
            options.backDelay = parseInt(element.getAttribute('data-back-delay'), 10) || 1500;
            options.loop = element.getAttribute('data-loop') !== 'false';
            options.smartBackspace = element.getAttribute('data-smart-backspace') !== 'false';
            options.shuffle = element.getAttribute('data-shuffle') === 'true';
            
            // Initialize Typed instance
            new Typed(element, options);
        });
    }
    
    return {
        init: function() {
            if (isInitialized) return;
            
            // Skip animations if animations feature is disabled
            if (!CONFIG.features.animations) {
                isInitialized = true;
                return;
            }
            
            // Initialize all animation modules
            initAOS();
            initCounters();
            initTestimonialSlider();
            initParallax();
            initParticles();
            initLazyLoading();
            initScrollAnimations();
            initTypedText();
            
            // Re-initialize when content changes
            document.addEventListener('contentChanged', () => {
                // Refresh animations when new content is added
                if (typeof AOS !== 'undefined') {
                    AOS.refresh();
                }
                
                // Reinitialize counters for new elements
                initCounters();
                
                // Reinitialize lazy loading for new images
                initLazyLoading();
            });
            
            // Reinitialize when language changes
            document.addEventListener('languageChanged', () => {
                // Refresh testimonial slider for new language content
                initTestimonialSlider();
                
                // Refresh typed text for new language content
                initTypedText();
            });
            
            isInitialized = true;
            console.log('Animations module initialized');
        },
        
        // Public methods
        refresh: function() {
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
            
            // Refresh other animation types
            initCounters();
            initTestimonialSlider();
        }
    };
})();

/**
 * =========================================================
 * UTILITIES MODULE
 * =========================================================
 */
const Utils = (function() {
    let isInitialized = false;
    
    /**
     * Update copyright year automatically
     */
    function updateCopyrightYear() {
        const yearElements = document.querySelectorAll('.current-year');
        const currentYear = new Date().getFullYear().toString();
        
        yearElements.forEach(el => {
            el.textContent = currentYear;
        });
    }
    
    /**
     * Load Calendly widget with lazy loading and optimization
     */
    function loadCalendly() {
        const calendlyWidgets = document.querySelectorAll('.calendly-inline-widget[data-url]:not([data-processed="true"])');
        
        if (!calendlyWidgets.length) return;
        
        // Create observer to load Calendly only when widget is in viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const widget = entry.target;
                    
                    // Mark as processed to avoid duplicate initialization
                    widget.setAttribute('data-processed', 'true');
                    
                    // Check if Calendly script already loaded
                    if (typeof Calendly === 'undefined') {
                        // Load Calendly script
                        const script = document.createElement('script');
                        script.src = 'https://assets.calendly.com/assets/external/widget.js';
                        script.async = true;
                        script.onload = () => initializeCalendlyWidget(widget);
                        document.head.appendChild(script);
                    } else {
                        // Initialize widget if script already loaded
                        initializeCalendlyWidget(widget);
                    }
                    
                    // Stop observing this widget
                    observer.unobserve(widget);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '200px'
        });
        
        // Observe each widget
        calendlyWidgets.forEach(widget => {
            observer.observe(widget);
        });
    }
    
    /**
     * Initialize a specific Calendly widget
     */
    function initializeCalendlyWidget(widget) {
        const loadingElement = widget.querySelector('.calendly-loading');
        
        if (loadingElement) {
            loadingElement.style.display = 'block';
        }
        
        // Wait for Calendly script to initialize
        const checkCalendly = setInterval(() => {
            if (typeof Calendly !== 'undefined') {
                clearInterval(checkCalendly);
                
                // Initialize Calendly widget
                Calendly.initInlineWidget({
                    url: widget.getAttribute('data-url'),
                    parentElement: widget,
                    prefill: {},
                    utm: {}
                });
                
                // Hide loading message when Calendly is initialized
                const observer = new MutationObserver((mutations, obs) => {
                    if (widget.querySelector('.calendly-spinner') || widget.querySelector('.calendly-inline-widget iframe')) {
                        if (loadingElement) loadingElement.style.display = 'none';
                        obs.disconnect();
                    }
                });
                
                observer.observe(widget, { childList: true, subtree: true });
            }
        }, 200);
    }
    
    /**
     * Initialize social sharing buttons
     */
    function initSocialSharing() {
        document.querySelectorAll('.share-button, [data-share]').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Get share data
                const platform = this.getAttribute('data-platform');
                const url = encodeURIComponent(this.getAttribute('data-url') || window.location.href);
                const title = encodeURIComponent(this.getAttribute('data-title') || document.title);
                const description = encodeURIComponent(this.getAttribute('data-description') || 
                                                    document.querySelector('meta[name="description"]')?.content || '');
                
                // Generate share URL
                let shareUrl = '';
                
                switch (platform) {
                    case 'twitter':
                        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                        break;
                    case 'facebook':
                        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                        break;
                    case 'linkedin':
                        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                        break;
                    case 'email':
                        shareUrl = `mailto:?subject=${title}&body=${description}%0A${url}`;
                        break;
                    case 'whatsapp':
                        shareUrl = `https://api.whatsapp.com/send?text=${title}%20${url}`;
                        break;
                    case 'copy':
                        // Copy URL to clipboard
                        navigator.clipboard.writeText(decodeURIComponent(url))
                            .then(() => {
                                // Show success message
                                const originalText = this.textContent;
                                this.textContent = I18n.get('copiedToClipboard');
                                
                                setTimeout(() => {
                                    this.textContent = originalText;
                                }, 2000);
                            })
                            .catch(err => {
                                console.error('Failed to copy URL: ', err);
                            });
                        return;
                }
                
                // Open share dialog
                if (shareUrl) {
                    window.open(shareUrl, '_blank', 'width=600,height=400,resizable=yes,scrollbars=yes');
                }
                
                // Track share in analytics
                if (window.dataLayer) {
                    window.dataLayer.push({
                        event: 'socialShare',
                        platform: platform,
                        url: decodeURIComponent(url)
                    });
                }
            });
        });
    }
    
    /**
     * Set up print functionality
     */
    function initPrintButton() {
        document.querySelectorAll('.print-button, [data-print]').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Get target to print
                const target = this.getAttribute('data-print-target');
                
                if (target) {
                    // Print specific element
                    const element = document.querySelector(target);
                    
                    if (element) {
                        // Create a print-friendly version
                        const originalDisplay = document.body.style.display;
                        const originalOverflow = document.documentElement.style.overflow;
                        
                        // Hide everything except the target element
                        document.body.style.display = 'none';
                        document.documentElement.style.overflow = 'hidden';
                        
                        // Create print container
                        const printContainer = document.createElement('div');
                        printContainer.id = 'print-container';
                        printContainer.innerHTML = element.innerHTML;
                        
                        // Add print styles
                        const printStyles = document.createElement('style');
                        printStyles.textContent = `
                            @media print {
                                body { display: block !important; }
                                #print-container { display: block !important; }
                                @page { margin: 2cm; }
                            }
                        `;
                        
                        // Add to document
                        document.body.appendChild(printContainer);
                        document.head.appendChild(printStyles);
                        
                        // Print and restore original display
                        setTimeout(() => {
                            window.print();
                            
                            // Clean up
                            document.body.removeChild(printContainer);
                            document.head.removeChild(printStyles);
                            document.body.style.display = originalDisplay;
                            document.documentElement.style.overflow = originalOverflow;
                        }, 100);
                    }
                } else {
                    // Print the whole page
                    window.print();
                }
                
                // Track print in analytics
                if (window.dataLayer) {
                    window.dataLayer.push({
                        event: 'print',
                        printTarget: target || 'wholePage'
                    });
                }
            });
        });
    }
    
    /**
     * Initialize copy-to-clipboard functionality
     */
    function initCopyButtons() {
        document.querySelectorAll('.copy-button, [data-copy]').forEach(button => {
            // Skip if already initialized
            if (button.hasAttribute('data-copy-initialized')) return;
            
            button.addEventListener('click', function() {
                // Get text to copy
                const textToCopy = this.getAttribute('data-copy');
                const targetSelector = this.getAttribute('data-copy-target');
                
                let text = '';
                
                if (textToCopy) {
                    // Use explicitly provided text
                    text = textToCopy;
                } else if (targetSelector) {
                    // Get text from target element
                    const target = document.querySelector(targetSelector);
                    if (target) {
                        text = target.value || target.textContent;
                    }
                }
                
                if (!text) return;
                
                // Try to use clipboard API
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(text)
                        .then(() => showCopySuccess(button))
                        .catch(err => {
                            console.error('Could not copy text: ', err);
                            fallbackCopy(text, button);
                        });
                } else {
                    // Fallback for browsers without clipboard API
                    fallbackCopy(text, button);
                }
                
                // Track copy in analytics
                if (window.dataLayer) {
                    window.dataLayer.push({
                        event: 'copyToClipboard',
                        copyType: targetSelector ? 'element' : 'text'
                    });
                }
            });
            
            // Mark as initialized
            button.setAttribute('data-copy-initialized', 'true');
        });
    }
    
    /**
     * Fallback method to copy text
     */
    function fallbackCopy(text, button) {
        // Create a temporary textarea element
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed'; // Prevent scrolling to the element
        textarea.style.opacity = '0';
        
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            // Execute copy command
            const successful = document.execCommand('copy');
            
            if (successful) {
                showCopySuccess(button);
            } else {
                console.error('Fallback copy failed');
            }
        } catch (err) {
            console.error('Fallback copy error:', err);
        }
        
        document.body.removeChild(textarea);
    }
    
    /**
     * Show copy success feedback
     */
    function showCopySuccess(button) {
        // Get success message
        const successMessage = button.getAttribute('data-copy-success') || I18n.get('copiedToClipboard');
        const originalContent = button.innerHTML;
        const originalWidth = button.offsetWidth;
        
        // Ensure button doesn't change width
        button.style.width = `${originalWidth}px`;
        button.style.minWidth = `${originalWidth}px`;
        
        // Add success class
        button.classList.add('copy-success');
        
        // Show success icon and text
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="inline-block mr-1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            ${successMessage}
        `;
        
        // Reset after animation
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.classList.remove('copy-success');
            button.style.width = '';
            button.style.minWidth = '';
        }, 2000);
    }
    
    /**
     * Initialize read time calculation for blog posts
     */
    function initReadTime() {
        document.querySelectorAll('.read-time, [data-read-time]').forEach(element => {
            // Get content selector
            const contentSelector = element.getAttribute('data-content') || 'article, .post-content, .blog-content';
            const content = document.querySelector(contentSelector);
            
            if (!content) return;
            
            // Count words in content
            const text = content.textContent || content.innerText;
            const wordCount = text.trim().split(/\s+/).length;
            
            // Calculate read time (average reading speed: 200-250 words per minute)
            const readingSpeed = parseInt(element.getAttribute('data-reading-speed'), 10) || 225;
            const readTimeMinutes = Math.max(1, Math.round(wordCount / readingSpeed));
            
            // Format read time
            const readTimeText = readTimeMinutes === 1 
                ? I18n.get('readTimeMinute', { minutes: readTimeMinutes })
                : I18n.get('readTimeMinutes', { minutes: readTimeMinutes });
            
            // Update element
            element.textContent = readTimeText;
            element.setAttribute('aria-label', readTimeText);
        });
    }
    
    /**
     * Initialize table of contents for long articles
     */
    function initTableOfContents() {
        const tocContainer = document.querySelector('.table-of-contents, .toc');
        if (!tocContainer) return;
        
        // Get content selector
        const contentSelector = tocContainer.getAttribute('data-content') || 'article, .post-content, .blog-content';
        const content = document.querySelector(contentSelector);
        
        if (!content) return;
        
        // Find all headings in content
        const headings = content.querySelectorAll('h2, h3, h4');
        
        // Skip if no headings found
        if (headings.length === 0) {
            tocContainer.style.display = 'none';
            return;
        }
        
        // Create table of contents
        const tocList = document.createElement('ul');
        tocList.className = 'toc-list';
        
        // Track heading levels for nested lists
        let previousLevel = 2;
        let currentList = tocList;
        let lists = [tocList]; // Stack to track nested lists
        
        headings.forEach(heading => {
            // Get heading level (2 for h2, 3 for h3, etc.)
            const level = parseInt(heading.tagName.substring(1), 10);
            
            // Ensure heading has an ID for linking
            if (!heading.id) {
                heading.id = heading.textContent.trim().toLowerCase()
                    .replace(/[^\w\s-]/g, '') // Remove special characters
                    .replace(/\s+/g, '-'); // Replace spaces with hyphens
            }
            
            // Create list item
            const listItem = document.createElement('li');
            listItem.className = `toc-item toc-level-${level}`;
            
            // Create link
            const link = document.createElement('a');
            link.href = `#${heading.id}`;
            link.textContent = heading.textContent;
            link.className = 'toc-link';
            
            // Handle nested lists
            if (level > previousLevel) {
                // Create new nested list
                const nestedList = document.createElement('ul');
                nestedList.className = `toc-sublist toc-level-${level}`;
                
                // Add to previous list item
                const lastItem = currentList.lastElementChild;
                if (lastItem) {
                    lastItem.appendChild(nestedList);
                    currentList = nestedList;
                    lists.push(nestedList);
                }
            } else if (level < previousLevel) {
                // Go back up the list hierarchy
                const stepsBack = previousLevel - level;
                for (let i = 0; i < stepsBack; i++) {
                    lists.pop();
                }
                currentList = lists[lists.length - 1];
            }
            
            // Add link to list item
            listItem.appendChild(link);
            
            // Add list item to current list
            currentList.appendChild(listItem);
            
            // Update previous level
            previousLevel = level;
        });
        
        // Add table of contents to container
        tocContainer.innerHTML = '';
        
        // Add title if needed
        if (!tocContainer.hasAttribute('data-no-title')) {
            const tocTitle = document.createElement('h3');
            tocTitle.className = 'toc-title';
            tocTitle.textContent = I18n.get('tableOfContents');
            tocContainer.appendChild(tocTitle);
        }
        
        tocContainer.appendChild(tocList);
        
        // Add active class to current section
        function updateActiveTocItem() {
            // Get all headings positions
            const headingPositions = Array.from(headings).map(heading => {
                return {
                    id: heading.id,
                    top: heading.getBoundingClientRect().top
                };
            });
            
            // Get current position
            const headerHeight = Header.getHeaderHeight ? Header.getHeaderHeight() : 80;
            const scrollPosition = window.scrollY + headerHeight + 50;
            
            // Find current heading
            let currentId = '';
            
            headingPositions.forEach(heading => {
                if (heading.top + window.scrollY - headerHeight < scrollPosition) {
                    currentId = heading.id;
                }
            });
            
            // Update active class
            document.querySelectorAll('.toc-link').forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
            });
        }
        
        // Update active item on scroll
        window.addEventListener('scroll', throttle(updateActiveTocItem, 100));
        
        // Initial update
        updateActiveTocItem();
    }
    
    return {
        init: function() {
            if (isInitialized) return;
            
            // Initialize all utility functions
            updateCopyrightYear();
            
            // Load Calendly only when widget is in viewport
            loadCalendly();
            
            // Initialize social sharing buttons
            initSocialSharing();
            
            // Initialize print button
            initPrintButton();
            
            // Initialize copy buttons
            initCopyButtons();
            
            // Initialize read time calculation
            initReadTime();
            
            // Initialize table of contents
            initTableOfContents();
            
            // Add scroll to anchor click handler
            document.querySelectorAll('a[href^="#"]:not(.tab-btn):not(.nav-link)').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    
                    // Skip empty anchors or javascript:void(0)
                    if (href === '#' || href === 'javascript:void(0)') return;
                    
                    const target = document.querySelector(href);
                    
                    if (target) {
                        e.preventDefault();
                        
                        // Scroll to target with smooth behavior
                        const headerHeight = Header.getHeaderHeight ? Header.getHeaderHeight() : 80;
                        const targetPos = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
                        
                        window.scrollTo({
                            top: targetPos,
                            behavior: MediaUtil.prefersReducedMotion() ? 'auto' : 'smooth'
                        });
                        
                        // Update URL hash
                        history.pushState(null, '', href);
                    }
                });
            });
            
            // Listen for language changes to update utility text
            document.addEventListener('languageChanged', () => {
                // Update read time
                initReadTime();
                
                // Update table of contents title
                const tocTitle = document.querySelector('.toc-title');
                if (tocTitle) {
                    tocTitle.textContent = I18n.get('tableOfContents');
                }
            });
            
            isInitialized = true;
            console.log('Utils module initialized');
        }
    };
})();

/**
 * =========================================================
 * SEO MODULE
 * =========================================================
 */
const SEO = (function() {
    /**
     * Initialize SEO enhancements
     */
    function init() {
        if (!CONFIG.generateStructuredData) return;
        
        // Generate and add structured data
        generateOrganizationSchema();
        generateWebsiteSchema();
        generateBreadcrumbSchema();
        
        // Add canonical URL if not present
        ensureCanonicalUrl();
        
        // Add alternate language links
        addLanguageAlternates();
    }
    
    /**
     * Generate Organization Schema
     */
    function generateOrganizationSchema() {
        // Skip if already exists
        if (document.querySelector('script[type="application/ld+json"][data-schema="Organization"]')) return;
        
        const schemaData = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "IAA Solutions",
            "url": window.location.origin,
            "logo": `${window.location.origin}/assets/images/logo.png`,
            "sameAs": [
                "https://www.facebook.com/iaasolutions",
                "https://www.linkedin.com/company/iaasolutions",
                "https://twitter.com/iaasolutions"
            ],
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": document.querySelector('[itemprop="telephone"]')?.content || "",
                "contactType": "customer service",
                "availableLanguage": CONFIG.supportedLanguages.map(lang => lang.code)
            }
        };
        
        addSchema(schemaData, "Organization");
    }
    
    /**
     * Generate Website Schema
     */
    function generateWebsiteSchema() {
        // Skip if already exists
        if (document.querySelector('script[type="application/ld+json"][data-schema="WebSite"]')) return;
        
        const schemaData = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "IAA Solutions",
            "url": window.location.origin,
            "potentialAction": {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": `${window.location.origin}/search?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
            }
        };
        
        addSchema(schemaData, "WebSite");
    }
    
    /**
     * Generate Breadcrumb Schema
     */
    function generateBreadcrumbSchema() {
        // Skip if already exists or no breadcrumb setting
        if (document.querySelector('script[type="application/ld+json"][data-schema="BreadcrumbList"]') || 
            !CONFIG.breadcrumbsEnabled) return;
            
        // Build breadcrumb items based on page structure
        const breadcrumbItems = [];
        
        // Add home as first item
        breadcrumbItems.push({
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": window.location.origin
        });
        
        // Get current page title
        const pageTitle = document.querySelector('h1')?.textContent || document.title;
        
        // Add page sections as breadcrumbs
        const sections = document.querySelectorAll('section[id]');
        let position = 2;
        
        // If this is a subpage
        if (window.location.pathname !== "/" && window.location.pathname !== "/index.html") {
            breadcrumbItems.push({
                "@type": "ListItem",
                "position": position++,
                "name": pageTitle,
                "item": window.location.href.split('#')[0]
            });
        }
        
        // Don't add section breadcrumbs if we already have page title
        if (position === 2) {
            sections.forEach(section => {
                const sectionTitle = section.querySelector('h2, h3, .section-header')?.textContent;
                
                if (sectionTitle) {
                    breadcrumbItems.push({
                        "@type": "ListItem",
                        "position": position++,
                        "name": sectionTitle,
                        "item": `${window.location.href.split('#')[0]}#${section.id}`
                    });
                }
            });
        }
        
        // Skip if only home item
        if (breadcrumbItems.length <= 1) return;
        
        const schemaData = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbItems
        };
        
        addSchema(schemaData, "BreadcrumbList");
    }
    
    /**
     * Add schema to the page
     */
    function addSchema(schemaData, schemaType) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-schema', schemaType);
        script.textContent = JSON.stringify(schemaData);
        document.head.appendChild(script);
    }
    
    /**
     * Ensure canonical URL is present
     */
    function ensureCanonicalUrl() {
        if (!document.querySelector('link[rel="canonical"]')) {
            const link = document.createElement('link');
            link.rel = 'canonical';
            
            // Clean URL without parameters and hash
            const url = window.location.origin + 
                      window.location.pathname.replace(/\/index.html$/, '/');
                      
            link.href = url;
            document.head.appendChild(link);
        }
    }
    
    /**
     * Add alternate language links
     */
    function addLanguageAlternates() {
        // Only add if multilingual is enabled
        if (!CONFIG.features.multilingual) return;
        
        // Remove existing alternate links
        document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
        
        // Add alternate links for each language
        CONFIG.supportedLanguages.forEach(lang => {
            const link = document.createElement('link');
            link.rel = 'alternate';
            link.hreflang = lang.code;
            
            // Get language URL
            const currentPath = window.location.pathname;
            const currentLang = document.documentElement.lang || CONFIG.defaultLanguage;
            
            let langPath;
            
            if (currentPath.match(/^\/[a-z]{2}\//)) {
                // Replace language code in path
                langPath = currentPath.replace(/^\/[a-z]{2}\//, `/${lang.code}/`);
            } else {
                // Add language code to path
                langPath = `/${lang.code}${currentPath}`;
            }
            
            link.href = window.location.origin + langPath;
            document.head.appendChild(link);
        });
    }
    
    return { init };
})();

/**
 * =========================================================
 * INITIALIZATION
 * =========================================================
 */
function initWebsite() {
    // Initialize modules in the correct order for dependencies
    Accessibility.init();
    Theme.init();
    Header.init();
    Tabs.init();
    Forms.init();
    CookieConsent.init();
    ProposalView.init();
    Animations.init();
    Utils.init();
    SEO.init();
    
    // Initialize I18n translations if available
    if (I18n && I18n.translatePage) {
        I18n.translatePage();
    }
    
    // Set up performance tracking for analytics
    if (window.performance && window.performance.mark) {
        window.performance.mark('init_complete');
        window.performance.measure('initialization_time', 'script_start', 'init_complete');
        
        const initTime = window.performance.getEntriesByName('initialization_time')[0].duration;
        console.log(`Website initialization completed in ${initTime.toFixed(2)}ms`);
        
        // Track in analytics
        if (window.dataLayer) {
            window.dataLayer.push({
                event: 'performance',
                performanceData: {
                    initTime: initTime.toFixed(2)
                }
            });
        }
    }
    
    // Set up resize handler to dispatch contentChanged event
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            document.dispatchEvent(new CustomEvent('contentChanged'));
        }, 250);
    });
    
    console.log('IAA Solutions website initialized successfully');
}

// Initialize when DOM is ready
DOMReady(initWebsite);