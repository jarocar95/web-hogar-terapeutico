/**
 * Mobile menu functionality
 * Handles the hamburger menu for mobile navigation
 */

export function initMobileMenu(): void {
    const menuBtn = document.getElementById('menu-btn-fixed') as HTMLButtonElement | null;
    const mobileMenu = document.getElementById('mobile-menu-fixed') as HTMLElement | null;
    const hamburgerIcon = document.getElementById('hamburger-icon-fixed') as HTMLElement | null;
    const closeIcon = document.getElementById('close-icon-fixed') as HTMLElement | null;


    if (!menuBtn || !mobileMenu || !hamburgerIcon || !closeIcon) {
        return;
    }

    let focusableElements: HTMLElement[] = [];
    let firstFocusableElement: HTMLElement | null = null;
    let lastFocusableElement: HTMLElement | null = null;

    const setFocusableElements = (): void => {
        focusableElements = Array.from(mobileMenu.querySelectorAll(
            'a[href], button:not([disabled]), textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        ));
        firstFocusableElement = focusableElements[0] || null;
        lastFocusableElement = focusableElements[focusableElements.length - 1] || null;
    };

    const handleKeyDown = (e: KeyboardEvent): void => {
        if (e.key === 'Escape') {
            toggleMenu();
            return;
        }

        const isTabPressed = e.key === 'Tab' || e.keyCode === 9;

        if (!isTabPressed) {
            return;
        }

        if (e.shiftKey) { // shift + tab
            if (document.activeElement === firstFocusableElement) {
                lastFocusableElement?.focus();
                e.preventDefault();
            }
        } else { // tab
            if (document.activeElement === lastFocusableElement) {
                firstFocusableElement?.focus();
                e.preventDefault();
            }
        }
    };

    const toggleMenu = (): void => {
        const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
        mobileMenu.classList.toggle('hidden');
        hamburgerIcon.classList.toggle('hidden');
        closeIcon.classList.toggle('hidden');
        menuBtn.setAttribute('aria-expanded', String(!isExpanded));

        if (mobileMenu.classList.contains('hidden')) {
            document.removeEventListener('keydown', handleKeyDown);
            // Se devuelve el scroll al cerrar.
            document.body.style.overflow = '';
            menuBtn.focus();
        } else {
            setFocusableElements();
            document.addEventListener('keydown', handleKeyDown);
            // Con el menú abierto la página seguía desplazándose por detrás:
            // el contenido se movía bajo un panel que lo tapaba a medias, y al
            // cerrar aparecías en un sitio distinto del que dejaste.
            document.body.style.overflow = 'hidden';
        }
    };

    menuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    });

    document.querySelectorAll('.mobile-link').forEach((link) => {
        link.addEventListener('click', () => {
            if (!mobileMenu.classList.contains('hidden')) {
                toggleMenu();
            }
        });
    });
}