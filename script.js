/**
 * IAA Solutions Website JavaScript
 * High-performance, accessible script for Enterprise AI & Automation website
 */
'use strict';

/**
 * =========================================================
 * CORE UTILITIES
 * =========================================================
 */

/**
 * Execute function when DOM is fully loaded
 */
function onDOMReady(fn) {
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

/**
 * Debounce function to limit rate of execution
 */
function debounce(func, wait, immediate = false) {
    let timeout;
    return function() {
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
 * Get cookie by name
 */
function getCookie(name) {
    try {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
    } catch (e) {
        console.error('Error reading cookie:', e);
    }
    return null;
}

/**
 * Set cookie with secure attributes
 */
function setCookie(name, value, days) {
    try {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        const secureAttribute = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax" + secureAttribute;
    } catch (e) {
        console.error('Error setting cookie:', e);
    }
}

/**
 * Check if user prefers reduced motion
 */
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * =========================================================
 * CONFIGURATION
 * =========================================================
 */

const CONFIG = {
    // UI Configuration
    headerScrollThreshold: 50,
    scrollSpyOffset: 100,
    backToTopThreshold: 300,
    smoothScrollDuration: 800,
    
    // Scroll Offset - UPDATED: Increased section offset to ensure better positioning
    sectionScrollOffset: 100, // Increased from 50 to 100 to avoid showing previous sections
    
    // Animation Settings
    aosDuration: 800,
    counterDuration: 2.5,
    testimonialAutoplayDelay: 5000,
    
    // Cookie Settings
    cookieExpiryDays: 365,
    
    // API Endpoints (Replace with actual endpoints in production)
    contactFormEndpoint: '/api/contact',
    newsletterEndpoint: '/api/subscribe',
    
    // Language Settings
    supportedLanguages: [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'it', name: 'Italiano', flag: '🇮🇹' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'pt', name: 'Português', flag: '🇵🇹' }
    ]
};

/**
 * Text strings for localization
 */
const STRINGS = {
    en: {
        darkMode: "Dark Mode",
        lightMode: "Light Mode",
        formRequired: "This field is required",
        formEmail: "Please enter a valid email address",
        formConsent: "You must agree to the terms",
        formSuccess: "Thank you! Your message has been sent.",
        formError: "Sorry, there was a problem sending your message.",
        newsletterSuccess: "Thank you for subscribing!",
        newsletterError: "Subscription failed. Please try again."
    }
    // Add other languages as needed
};

// Detect current language from the HTML lang attribute
const currentLang = document.documentElement.lang || 'en';
const strings = STRINGS[currentLang] || STRINGS.en;

/**
 * =========================================================
 * ACCESSIBILITY MODULE
 * =========================================================
 */
const Accessibility = (function() {
    let currentTrap = null;
    
    function getFocusableElements(container) {
        return Array.from(container.querySelectorAll(
            'a[href]:not([disabled]), button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )).filter(el => el.offsetParent !== null);
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
        }
    }
    
    return {
        activate: function(container, trigger, onEscape) {
            if (currentTrap) this.deactivate();
            
            currentTrap = { container, trigger, onEscape };
            document.addEventListener('keydown', handleKeydown);
            
            const focusables = getFocusableElements(container);
            if (focusables.length > 0) {
                setTimeout(() => focusables[0].focus(), 50);
            }
        },
        
        deactivate: function() {
            if (!currentTrap) return;
            
            document.removeEventListener('keydown', handleKeydown);
            if (currentTrap.trigger) currentTrap.trigger.focus();
            currentTrap = null;
        }
    };
})();

/**
 * =========================================================
 * THEME MODULE (Dark/Light Mode)
 * =========================================================
 */
const Theme = (function() {
    function getPreferredTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    function applyTheme(theme) {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        
        // Update toggle buttons
        const desktopToggle = document.getElementById('dark-mode-toggle');
        const mobileToggle = document.getElementById('mobile-dark-mode-toggle');
        const floatToggle = document.getElementById('dark-mode-toggle-float');
        
        if (desktopToggle) desktopToggle.setAttribute('aria-pressed', theme === 'dark');
        if (mobileToggle) {
            mobileToggle.setAttribute('aria-pressed', theme === 'dark');
            const textElement = mobileToggle.querySelector('.dark-mode-text');
            if (textElement) {
                textElement.textContent = theme === 'dark' ? strings.lightMode : strings.darkMode;
            }
        }
        if (floatToggle) floatToggle.setAttribute('aria-pressed', theme === 'dark');
        
        localStorage.setItem('theme', theme);
    }
    
    function toggleTheme() {
        const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    }
    
    function setupListeners() {
        // Desktop toggle
        const desktopToggle = document.getElementById('dark-mode-toggle');
        if (desktopToggle) {
            desktopToggle.addEventListener('click', toggleTheme);
        }
        
        // Mobile toggle
        const mobileToggle = document.getElementById('mobile-dark-mode-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', toggleTheme);
        }
        
        // Floating toggle
        const floatToggle = document.getElementById('dark-mode-toggle-float');
        if (floatToggle) {
            floatToggle.addEventListener('click', toggleTheme);
        }
        
        // System preference change
        try {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = e => {
                if (!localStorage.getItem('theme')) {
                    applyTheme(e.matches ? 'dark' : 'light');
                }
            };
            
            // Try the modern event listener approach first
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
            applyTheme(getPreferredTheme());
            setupListeners();
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
    
    function handleScroll() {
        const header = document.getElementById('header');
        if (!header) return;
        
        const isScrolled = window.scrollY > CONFIG.headerScrollThreshold;
        header.classList.toggle('scrolled', isScrolled);
    }
    
    function toggleMobileMenu(forceClose = false) {
        const mobileMenu = document.getElementById('mobile-menu');
        const menuBtn = document.getElementById('mobile-menu-btn');
        
        if (!mobileMenu || !menuBtn) return;
        
        const shouldOpen = !forceClose && !isMobileMenuOpen;
        
        mobileMenu.style.transform = shouldOpen ? 'translateX(0)' : 'translateX(-100%)';
        menuBtn.setAttribute('aria-expanded', shouldOpen);
        
        const iconOpen = menuBtn.querySelector('.icon-open');
        const iconClose = menuBtn.querySelector('.icon-close');
        
        if (iconOpen && iconClose) {
            iconOpen.classList.toggle('hidden', shouldOpen);
            iconClose.classList.toggle('hidden', !shouldOpen);
        }
        
        document.body.style.overflow = shouldOpen ? 'hidden' : '';
        isMobileMenuOpen = shouldOpen;
        
        if (shouldOpen) {
            Accessibility.activate(mobileMenu, menuBtn, () => toggleMobileMenu(true));
        } else {
            Accessibility.deactivate();
        }
    }
    
    function setupLanguageDropdowns() {
    // First, make sure language dropdowns toggle properly
    document.querySelectorAll('#lang-toggle, #mobile-lang-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const targetId = this.getAttribute('aria-controls');
            const target = document.getElementById(targetId);
            
            if (!target) return;
            
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            
            if (isExpanded) {
                target.classList.add('hidden');
            } else {
                target.classList.remove('hidden');
            }
        });
    });
    
    // Then handle language selection with scroll position preservation
    document.querySelectorAll('#lang-menu a, #mobile-lang-menu a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default navigation
            
            const langCode = this.getAttribute('hreflang') || this.getAttribute('lang');
            if (!langCode) {
                console.error('Language link missing hreflang or lang attribute');
                return;
            }
            
            const currentUrl = window.location.pathname;
            const currentScroll = window.scrollY;
            
            // Construct the new URL with the selected language
            let newUrl = currentUrl.replace(/\/[a-z]{2}\//, `/${langCode}/`);
            if (!newUrl.includes(`/${langCode}/`)) {
                // If no language code in URL, add it
                newUrl = `/${langCode}${currentUrl}`;
            }
            
            // Maintain hash if present
            if (window.location.hash) {
                newUrl += window.location.hash;
            }
            
            // Use History API to change URL without reloading
            window.history.pushState({ scrollY: currentScroll }, '', newUrl);
            
            // Update the lang attribute on the HTML element
            document.documentElement.lang = langCode;
            
            // Update displayed language in the UI
            const langTexts = document.querySelectorAll('.lang-text');
            langTexts.forEach(el => {
                el.textContent = langCode.toUpperCase();
            });
            
            // Close the language menu
            const toggles = document.querySelectorAll('[aria-expanded="true"]');
            toggles.forEach(toggle => {
                toggle.setAttribute('aria-expanded', 'false');
                const menuId = toggle.getAttribute('aria-controls');
                const menu = document.getElementById(menuId);
                if (menu) menu.classList.add('hidden');
            });
            
            // Dispatch a language change event
            const event = new CustomEvent('languageChanged', { detail: { language: langCode } });
            document.dispatchEvent(event);
            
            console.log(`Language switched to: ${langCode}, maintaining scroll position: ${currentScroll}px`);
        });
    });
}
    
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
        
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        
            // Update URL hash
            window.history.pushState(null, '', `#${targetId}`);
        });
    });
}
    
    function initBackToTop() {
        const backToTopBtn = document.getElementById('back-to-top');
        if (!backToTopBtn) return;
    
        // Show/hide button based on scroll position
        function updateBackToTopVisibility() {
            backToTopBtn.classList.toggle('opacity-0', window.scrollY <= CONFIG.backToTopThreshold);
            backToTopBtn.classList.toggle('invisible', window.scrollY <= CONFIG.backToTopThreshold);
        }
    
        window.addEventListener('scroll', debounce(updateBackToTopVisibility, 100));
        updateBackToTopVisibility(); // Initial state
    
        // Scroll to top when clicked
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    function initScrollSpy() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
    
        if (!sections.length || !navLinks.length) return;
    
        function updateActiveLink() {
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
        
            // Update active class on nav links
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (!href) return;
            
                const linkTarget = href.substring(1);
                link.classList.toggle('active', linkTarget === currentSection);
            
                if (linkTarget === currentSection) {
                    link.setAttribute('aria-current', 'page');
                } else {
                    link.removeAttribute('aria-current');
                }
            });
        }
    
        window.addEventListener('scroll', debounce(updateActiveLink, 100));
        window.addEventListener('load', updateActiveLink);
        updateActiveLink(); // Initial state
    }
    
    return {
        init: function() {
            handleScroll(); // Initial check
            window.addEventListener('scroll', debounce(handleScroll, 10));
        
            // Mobile menu toggle
            const menuBtn = document.getElementById('mobile-menu-btn');
            if (menuBtn) {
                menuBtn.addEventListener('click', () => toggleMobileMenu());
            }
        
            setupLanguageDropdowns();
            setupNavLinks();
            initBackToTop();
            initScrollSpy();

            // Add this to the Header.init function - ADD IT HERE
        window.addEventListener('popstate', function(event) {
            if (event.state && typeof event.state.scrollY === 'number') {
                window.scrollTo(0, event.state.scrollY);
            }
        });
        },
        
        closeMobileMenu: function() {
            toggleMobileMenu(true);
        },
        
        isMobileMenuOpen: function() {
            return isMobileMenuOpen;
        }
    };
})();

/**
 * =========================================================
 * CONTENT TABS MODULE
 * =========================================================
 */
const Tabs = (function() {
    function initServiceTabs() {
        const tabsNav = document.querySelector('.services-tabs .tabs-nav');
        if (!tabsNav) return;
        
        const tabs = tabsNav.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');
        const indicator = tabsNav.querySelector('.tab-indicator');
        
        // Function to update indicator position
        function updateIndicator(tab) {
            if (!indicator) return;
            
            // Get position and width of active tab
            const tabRect = tab.getBoundingClientRect();
            const navRect = tabsNav.getBoundingClientRect();
            
            // Set indicator position
            indicator.style.left = `${tabRect.left - navRect.left}px`;
            indicator.style.width = `${tabRect.width}px`;
        }
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetId = tab.getAttribute('data-target');
                const targetPane = document.querySelector(targetId);
                
                // Update active state
                tabs.forEach(t => {
                    t.classList.toggle('active', t === tab);
                    t.setAttribute('aria-selected', t === tab);
                    t.setAttribute('tabindex', t === tab ? '0' : '-1');
                });
                
                // Update tab panes
                tabPanes.forEach(pane => {
                    pane.classList.toggle('active', pane === targetPane);
                    pane.style.opacity = pane === targetPane ? '1' : '0';
                    pane.hidden = pane !== targetPane;
                });
                
                // Update indicator
                updateIndicator(tab);
            });
        });
        
        // Initialize indicator for active tab
        const activeTab = tabsNav.querySelector('.tab-btn.active') || tabs[0];
        if (activeTab) {
            updateIndicator(activeTab);
            
            // Set initial active tab
            const targetId = activeTab.getAttribute('data-target');
            const targetPane = document.querySelector(targetId);
            
            if (targetPane) {
                tabPanes.forEach(pane => {
                    pane.classList.toggle('active', pane === targetPane);
                    pane.style.opacity = pane === targetPane ? '1' : '0';
                    pane.hidden = pane !== targetPane;
                });
            }
        }
        
        // Handle window resize for indicator
        window.addEventListener('resize', debounce(() => {
            const currentActive = tabsNav.querySelector('.tab-btn.active') || tabs[0];
            if (currentActive) updateIndicator(currentActive);
        }, 100));
    }
    
    function initPortfolioFilter() {
        const filterContainer = document.querySelector('.portfolio-filter');
        if (!filterContainer) return;
        
        const filterButtons = filterContainer.querySelectorAll('.filter-btn');
        const portfolioItems = document.querySelectorAll('.portfolio-item');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filterValue = button.getAttribute('data-filter');
                
                // Update active button
                filterButtons.forEach(btn => {
                    btn.classList.toggle('active', btn === button);
                    btn.setAttribute('aria-pressed', btn === button);
                });
                
                // Filter items
                portfolioItems.forEach(item => {
                    const shouldShow = filterValue === '*' || item.classList.contains(filterValue.substring(1));
                    item.style.display = shouldShow ? '' : 'none';
                });
            });
        });
    }
    
    function initPricingToggle() {
        const toggleCheckbox = document.getElementById('pricing-toggle-checkbox');
        if (!toggleCheckbox) return;
        
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
                el.style.transition = 'opacity 0.3s ease';
                el.style.display = 'flex';
                el.style.flexDirection = 'column';
                el.style.alignItems = 'center';
                el.style.justifyContent = 'center';
            });
            
            // Toggle visibility with opacity
            monthlyEl.style.opacity = isAnnual ? '0' : '1';
            monthlyEl.style.zIndex = isAnnual ? '0' : '1';
            
            annualEl.style.opacity = isAnnual ? '1' : '0';
            annualEl.style.zIndex = isAnnual ? '1' : '0';
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
                el.style.transition = 'opacity 0.3s ease';
                el.style.textAlign = 'center';
            });
            
            monthlyDesc.style.opacity = isAnnual ? '0' : '1';
            monthlyDesc.style.zIndex = isAnnual ? '0' : '1';
            
            annualDesc.style.opacity = isAnnual ? '1' : '0';
            annualDesc.style.zIndex = isAnnual ? '1' : '0';
        }
    });
    
    // Update toggle labels
    document.querySelectorAll('.toggle-label').forEach(label => {
        const period = label.getAttribute('data-period');
        label.classList.toggle('active', 
            (period === 'monthly' && !isAnnual) || 
            (period === 'annual' && isAnnual)
        );
    });
    
    // Show/hide save badge
    const saveBadge = document.querySelector('.save-badge');
    if (saveBadge) {
        saveBadge.style.opacity = isAnnual ? '1' : '0';
        saveBadge.style.transition = 'opacity 0.3s ease';
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
        });
        
        // Initial state
        updatePricingDisplay();
    }
    
    return {
        init: function() {
            initServiceTabs();
            initPortfolioFilter();
            initPricingToggle();
        }
    };
})();

/**
 * =========================================================
 * FORMS MODULE
 * =========================================================
 */
const Forms = (function() {
    function validateField(field) {
        const value = field.value.trim();
        const errorElement = document.getElementById(`${field.id}-error`);
        
        let isValid = true;
        let errorMessage = '';
        
        // Reset validation state
        field.classList.remove('is-invalid');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.add('hidden');
        }
        
        // Validate based on field type and requirements
        if (field.hasAttribute('required')) {
            if (field.type === 'checkbox' && !field.checked) {
                isValid = false;
                errorMessage = strings.formConsent;
            } else if (value === '' && field.type !== 'checkbox') {
                isValid = false;
                errorMessage = strings.formRequired;
            }
        }
        
        if (field.type === 'email' && value !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            isValid = false;
            errorMessage = strings.formEmail;
        }
        
        // Update UI if invalid
        if (!isValid) {
            field.classList.add('is-invalid');
            if (errorElement) {
                errorElement.textContent = errorMessage;
                errorElement.classList.remove('hidden');
            }
        }
        
        return isValid;
    }
    
    function validateForm(form) {
        const fields = form.querySelectorAll('input, select, textarea');
        let isValid = true;
        
        fields.forEach(field => {
            if ((field.hasAttribute('required') || field.type === 'email') && !validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    function initContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;
        
        // Add validation attributes
        form.setAttribute('novalidate', 'true');
        
        // Validate fields on blur
        form.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('blur', () => validateField(field));
        });
        
        // Handle form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Validate form
            if (!validateForm(form)) {
                // Focus first invalid field
                const firstInvalid = form.querySelector('.is-invalid');
                if (firstInvalid) firstInvalid.focus();
                return;
            }
            
            // Get form data
            const formData = new FormData(form);
            const formDataObj = Object.fromEntries(formData.entries());
            
            // Get UI elements
            const submitBtn = form.querySelector('button[type="submit"]');
            const btnText = submitBtn?.querySelector('.btn-text');
            const btnIconDefault = submitBtn?.querySelector('.btn-icon-default');
            const btnIconLoading = submitBtn?.querySelector('.btn-icon-loading');
            const responseEl = document.getElementById('form-response');
            
            // Update UI for sending state
            if (submitBtn) submitBtn.disabled = true;
            if (btnText) btnText.textContent = strings.formSending;
            if (btnIconDefault) btnIconDefault.classList.add('hidden');
            if (btnIconLoading) btnIconLoading.classList.remove('hidden');
            
            try {
                // In a real implementation, this would send data to a server
                // Simulate API call with a timeout
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Success response
                if (responseEl) {
                    responseEl.textContent = strings.formSuccess;
                    responseEl.classList.remove('hidden', 'bg-red-100', 'text-red-700');
                    responseEl.classList.add('bg-green-100', 'text-green-700');
                }
                
                // Reset form
                form.reset();
                
            } catch (error) {
                console.error('Form submission error:', error);
                
                // Error response
                if (responseEl) {
                    responseEl.textContent = strings.formError;
                    responseEl.classList.remove('hidden', 'bg-green-100', 'text-green-700');
                    responseEl.classList.add('bg-red-100', 'text-red-700');
                }
            } finally {
                // Reset UI state
                if (submitBtn) submitBtn.disabled = false;
                if (btnText) btnText.textContent = 'Send Message';
                if (btnIconDefault) btnIconDefault.classList.remove('hidden');
                if (btnIconLoading) btnIconLoading.classList.add('hidden');
            }
        });
    }
    
    function initNewsletterForm() {
        const form = document.getElementById('newsletter-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailInput = form.querySelector('input[type="email"]');
            const responseEl = document.getElementById('newsletter-response');
            
            // Validate email
            if (!emailInput || !emailInput.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
                if (responseEl) {
                    responseEl.textContent = strings.formEmail;
                    responseEl.style.color = 'var(--error-text)';
                }
                if (emailInput) {
                    emailInput.classList.add('is-invalid');
                    emailInput.focus();
                }
                return;
            }
            
            // Get button and update state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
            
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            }
            
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Success
                if (responseEl) {
                    responseEl.textContent = strings.newsletterSuccess;
                    responseEl.style.color = 'var(--success-text)';
                }
                
                // Clear input
                if (emailInput) emailInput.value = '';
                
            } catch (error) {
                console.error('Newsletter submission error:', error);
                
                // Error
                if (responseEl) {
                    responseEl.textContent = strings.newsletterError;
                    responseEl.style.color = 'var(--error-text)';
                }
            } finally {
                // Reset button
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }
            }
        });
    }
    
    function initPaymentButtons() {
        document.querySelectorAll('.payment-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const plan = button.getAttribute('data-plan') || 'Unknown';
                const paymentType = button.classList.contains('stripe') ? 'Stripe' : 
                                  button.classList.contains('mercadopago') ? 'MercadoPago' : 
                                  button.classList.contains('crypto') ? 'Cryptocurrency' : 'Unknown';
                
                // Simple alert for demo purposes
                alert(`Initiating ${paymentType} payment for: ${plan}\n\nThis is a placeholder. In production, integrate your payment gateway here.`);
            });
        });
    }
    
    return {
        init: function() {
            initContactForm();
            initNewsletterForm();
            initPaymentButtons();
        }
    };
})();

/**
 * =========================================================
 * COOKIE CONSENT MODULE
 * =========================================================
 */
const CookieConsent = (function() {
    function init() {
        const consentBanner = document.getElementById('cookie-consent-banner');
        const acceptBtn = document.getElementById('cookie-accept');
        const declineBtn = document.getElementById('cookie-decline');
        
        if (!consentBanner || !acceptBtn || !declineBtn) return;
        
        // Check if consent has been given
        const hasConsent = getCookie('cookie_consent');
        
        if (!hasConsent) {
            // Show banner with animation
            consentBanner.classList.remove('hidden');
            setTimeout(() => {
                consentBanner.style.transform = 'translateY(0)';
            }, 100);
        }
        
        // Accept cookies
        acceptBtn.addEventListener('click', () => {
            setCookie('cookie_consent', 'accepted', CONFIG.cookieExpiryDays);
            consentBanner.style.transform = 'translateY(100%)';
            setTimeout(() => {
                consentBanner.classList.add('hidden');
            }, 500);
        });
        
        // Decline cookies
        declineBtn.addEventListener('click', () => {
            setCookie('cookie_consent', 'declined', CONFIG.cookieExpiryDays);
            consentBanner.style.transform = 'translateY(100%)';
            setTimeout(() => {
                consentBanner.classList.add('hidden');
            }, 500);
        });
    }
    
    return { init };
})();

/**
 * =========================================================
 * PROPOSAL VIEW MODULE
 * =========================================================
 */
const ProposalView = (function() {
    function init() {
        const proposalView = document.getElementById('proposal-view');
        const viewLinks = document.querySelectorAll('#view-proposal-link, #view-proposal-link-mobile');
        
        if (!proposalView) {
            // Hide proposal links if the view doesn't exist
            viewLinks.forEach(link => link.style.display = 'none');
            return;
        }
        
        function updateView() {
            const shouldShow = window.location.hash === '#proposal-view';
            const mainSections = document.querySelectorAll('main > section:not(#proposal-view)');
            const footer = document.querySelector('footer');
            
            if (shouldShow) {
                // Make proposal view visible
                proposalView.classList.remove('hidden');
                proposalView.hidden = false;
                proposalView.style.display = 'block';
                
                // Hide main sections
                mainSections.forEach(section => section.style.display = 'none');
                if (footer) footer.style.display = 'none';
                
                // Scroll to top of proposal
                const heroProposal = document.getElementById('hero-proposal');
                if (heroProposal) {
                    setTimeout(() => {
                        heroProposal.scrollIntoView({ behavior: 'auto' });
                    }, 100);
                }
                
                // Update active state on nav links
                viewLinks.forEach(link => {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                });
            } else {
                // Hide proposal view
                proposalView.classList.add('hidden');
                proposalView.hidden = true;
                
                // Show main sections
                mainSections.forEach(section => section.style.display = '');
                if (footer) footer.style.display = '';
                
                // Update active state on nav links
                viewLinks.forEach(link => {
                    link.classList.remove('active');
                    link.removeAttribute('aria-current');
                });
            }
        }
        
        // Initial check
        updateView();
        
        // Listen for hash changes
        window.addEventListener('hashchange', updateView);
        
        // Handle links to the proposal view
        viewLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Don't prevent default to allow the href="#proposal-view" to work
                if (Header.isMobileMenuOpen()) {
                    Header.closeMobileMenu();
                }
                
                // If already on proposal view, prevent default and just scroll to top
                if (window.location.hash === '#proposal-view' && 
                    !proposalView.classList.contains('hidden') && 
                    !proposalView.hidden) {
                    e.preventDefault();
                    const heroProposal = document.getElementById('hero-proposal');
                    if (heroProposal) {
                        heroProposal.scrollIntoView({ behavior: 'smooth' });
                    }
                }
                
                // Force hash change event if the hash hasn't changed (user clicked the same link twice)
                if (window.location.hash === '#proposal-view') {
                    setTimeout(updateView, 0);
                }
            });
        });
        
        // Handle section links when proposal view is active
        document.querySelectorAll('a[href^="#"]:not([href="#"]):not([href="#proposal-view"])').forEach(link => {
            link.addEventListener('click', function(e) {
                // If proposal view is active
                if (!proposalView.classList.contains('hidden') && !proposalView.hidden) {
                    // Get the target section ID
                    const targetId = this.getAttribute('href').substring(1);
                    const targetSection = document.getElementById(targetId);
                    
                    if (!targetSection) return;
                    
                    // Prevent default to handle navigation manually
                    e.preventDefault();
                    
                    // Update hash without scrolling (browsers automatically scroll on hash change)
                    history.pushState(null, '', `#${targetId}`);
                    
                    // Hide proposal view
                    proposalView.classList.add('hidden');
                    proposalView.hidden = true;
                    
                    // Show main sections and footer
                    const mainSections = document.querySelectorAll('main > section:not(#proposal-view)');
                    const footer = document.querySelector('footer');
                    
                    mainSections.forEach(section => section.style.display = '');
                    if (footer) footer.style.display = '';
                    
                    // Update nav links
                    viewLinks.forEach(vLink => {
                        vLink.classList.remove('active');
                        vLink.removeAttribute('aria-current');
                    });
                    
                    // Calculate header height for offset
                    const headerHeight = document.getElementById('header')?.offsetHeight || 0;
                    
                    // Scroll to the target section with proper offset
                    setTimeout(() => {
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
}, 50);
                }
            });
        });
    }
    
    return { init };
})();

/**
 * =========================================================
 * ANIMATIONS MODULE
 * =========================================================
 */
const Animations = (function() {
    function initAOS() {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: CONFIG.aosDuration,
                easing: 'ease-in-out',
                once: true,
                offset: 50,
                disable: function() {
                    return window.innerWidth < 768 || prefersReducedMotion();
                }
            });
        }
    }
    
    function initCounters() {
        if (typeof CountUp === 'undefined') return;
        
        const counters = document.querySelectorAll('.stat-number[data-count]');
        if (!counters.length) return;
        
        // Set up intersection observer for counters
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const endVal = parseFloat(target.dataset.count);
                    
                    if (!isNaN(endVal)) {
                        const countUp = new CountUp.CountUp(target, endVal, {
                            duration: CONFIG.counterDuration,
                            useEasing: true,
                            useGrouping: true
                        });
                        
                        if (!countUp.error) {
                            countUp.start();
                        } else {
                            console.error('CountUp error:', countUp.error);
                            // Fallback
                            target.textContent = endVal.toLocaleString();
                        }
                    }
                    
                    // Unobserve after animating
                    observer.unobserve(target);
                }
            });
        }, { threshold: 0.5 });
        
        // Observe counters
        counters.forEach(counter => observer.observe(counter));
    }
    
    function initTestimonialSlider() {
        if (typeof Swiper === 'undefined') return;
        
        const slider = document.querySelector('.testimonial-slider');
        if (!slider) return;
        
        new Swiper(slider, {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            grabCursor: true,
            autoplay: {
                delay: CONFIG.testimonialAutoplayDelay,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            },
            pagination: {
                el: '.slider-pagination',
                clickable: true
            },
            navigation: {
                nextEl: '.slider-next',
                prevEl: '.slider-prev'
            },
            a11y: {
                enabled: true,
                prevSlideMessage: 'Previous testimonial',
                nextSlideMessage: 'Next testimonial',
                paginationBulletMessage: 'Go to testimonial {{index}}'
            },
            breakpoints: {
                768: {
                    slidesPerView: 1.2,
                    centeredSlides: true
                }
            }
        });
    }
    
    function initParticles() {
        if (typeof particlesJS === 'undefined') return;
        
        const particlesContainer = document.getElementById('particles-js');
        if (!particlesContainer) return;
        
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: "#ffffff"
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
                    color: "#ffffff",
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
    }
    
    function initLazyLoading() {
        // For images with loading="lazy" attribute
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            img.addEventListener('error', function() {
                const fallback = this.getAttribute('data-fallback');
                if (fallback) {
                    this.src = fallback;
                }
            });
        });
    }
    
    return {
        init: function() {
            initAOS();
            initCounters();
            initTestimonialSlider();
            initParticles();
            initLazyLoading();
        }
    };
})();

/**
 * =========================================================
 * UTILITIES MODULE
 * =========================================================
 */
const Utils = (function() {
    function updateCopyrightYear() {
        const yearElements = document.querySelectorAll('.current-year');
        const currentYear = new Date().getFullYear().toString();
        
        yearElements.forEach(el => {
            el.textContent = currentYear;
        });
    }
    
    function loadCalendly() {
        const calendlyWidgets = document.querySelectorAll('.calendly-inline-widget[data-url]:not([data-processed="true"])');
        
        calendlyWidgets.forEach(widget => {
            const loadingElement = widget.querySelector('.calendly-loading');
            
            // Mark as processed to avoid duplicate initialization
            widget.setAttribute('data-processed', 'true');
            
            // Wait for Calendly script to load
            if (typeof Calendly !== 'undefined') {
                // Hide loading message when Calendly is initialized
                const observer = new MutationObserver((mutations, obs) => {
                    if (widget.querySelector('.calendly-spinner') || widget.querySelector('.calendly-inline-widget iframe')) {
                        if (loadingElement) loadingElement.style.display = 'none';
                        obs.disconnect();
                    }
                });
                
                observer.observe(widget, { childList: true, subtree: true });
            }
        });
    }
    
    return {
        init: function() {
            updateCopyrightYear();
            
            // Wait for page load to initialize Calendly
            window.addEventListener('load', loadCalendly);
        }
    };
})();

/**
 * =========================================================
 * INITIALIZATION
 * =========================================================
 */
function initWebsite() {
    // Initialize modules in order of dependency
    Theme.init();
    Header.init();
    Tabs.init();
    Forms.init();
    CookieConsent.init();
    ProposalView.init();
    Animations.init();
    Utils.init();
    
    console.log('IAA Solutions website initialized successfully');
}

// Initialize when DOM is ready
onDOMReady(initWebsite);