/**
 * Mobile menu functionality
 * Handles the hamburger menu for mobile navigation
 */
export function initMobileMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const closeIcon = document.getElementById('close-icon');

    if (!menuBtn || !mobileMenu || !hamburgerIcon || !closeIcon) {
        return;
    }

    let focusableElements = [];
    let firstFocusableElement;
    let lastFocusableElement;

    const setFocusableElements = () => {
        focusableElements = Array.from(mobileMenu.querySelectorAll('a[href], button:not([disabled]), textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'));
        firstFocusableElement = focusableElements[0];
        lastFocusableElement = focusableElements[focusableElements.length - 1];
    }

    const handleKeyDown = (e) => {
        let isTabPressed = e.key === 'Tab' || e.keyCode === 9;

        if (!isTabPressed) {
            return;
        }

        if (e.shiftKey) { // shift + tab
            if (document.activeElement === firstFocusableElement) {
                lastFocusableElement.focus();
                e.preventDefault();
            }
        } else { // tab
            if (document.activeElement === lastFocusableElement) {
                firstFocusableElement.focus();
                e.preventDefault();
            }
        }
    }

    const toggleMenu = () => {
        const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
        mobileMenu.classList.toggle('hidden');
        hamburgerIcon.classList.toggle('hidden');
        closeIcon.classList.toggle('hidden');
        menuBtn.setAttribute('aria-expanded', String(!isExpanded));

        if (mobileMenu.classList.contains('hidden')) {
            document.removeEventListener('keydown', handleKeyDown);
            menuBtn.focus();
        }
    };

    menuBtn.addEventListener('click', toggleMenu);

    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            if (!mobileMenu.classList.contains('hidden')) {
                toggleMenu();
            }
        });
    });
}