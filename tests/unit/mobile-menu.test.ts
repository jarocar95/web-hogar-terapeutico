/**
 * Tests for mobile menu functionality
 */
import { initMobileMenu } from '../../src/ts/modules/mobile-menu';

describe('Mobile Menu', () => {
  let menuBtn: HTMLButtonElement;
  let mobileMenu: HTMLElement;
  let hamburgerIcon: HTMLElement;
  let closeIcon: HTMLElement;

  beforeEach(() => {
    // Setup DOM elements
    document.body.innerHTML = `
      <button id="menu-btn" aria-expanded="false">
        <span id="hamburger-icon"></span>
        <span id="close-icon" class="hidden"></span>
      </button>
      <div id="mobile-menu" class="hidden">
        <a href="#" class="mobile-link">Link 1</a>
        <a href="#" class="mobile-link">Link 2</a>
      </div>
    `;

    menuBtn = document.getElementById('menu-btn') as HTMLButtonElement;
    mobileMenu = document.getElementById('mobile-menu') as HTMLElement;
    hamburgerIcon = document.getElementById('hamburger-icon') as HTMLElement;
    closeIcon = document.getElementById('close-icon') as HTMLElement;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize mobile menu when all elements exist', () => {
    const consoleSpy = jest.spyOn(console, 'log');

    initMobileMenu();

    expect(menuBtn).not.toBeNull();
    expect(mobileMenu).not.toBeNull();
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test('should return early if menu button is missing', () => {
    document.body.innerHTML = `
      <div id="mobile-menu" class="hidden"></div>
    `;

    initMobileMenu();

    // Should not throw error
    expect(true).toBe(true);
  });

  test('should toggle menu visibility when button is clicked', () => {
    initMobileMenu();

    // Initial state
    expect(mobileMenu.classList.contains('hidden')).toBe(true);
    expect(hamburgerIcon.classList.contains('hidden')).toBe(false);
    expect(closeIcon.classList.contains('hidden')).toBe(true);

    // Click to open
    menuBtn.click();

    expect(mobileMenu.classList.contains('hidden')).toBe(false);
    expect(hamburgerIcon.classList.contains('hidden')).toBe(true);
    expect(closeIcon.classList.contains('hidden')).toBe(false);

    // Click to close
    menuBtn.click();

    expect(mobileMenu.classList.contains('hidden')).toBe(true);
    expect(hamburgerIcon.classList.contains('hidden')).toBe(false);
    expect(closeIcon.classList.contains('hidden')).toBe(true);
  });

  test('should update aria-expanded attribute correctly', () => {
    initMobileMenu();

    menuBtn.click();
    expect(menuBtn.getAttribute('aria-expanded')).toBe('true');

    menuBtn.click();
    expect(menuBtn.getAttribute('aria-expanded')).toBe('false');
  });

  test('should close menu when mobile link is clicked', () => {
    initMobileMenu();

    // Open menu
    menuBtn.click();
    expect(mobileMenu.classList.contains('hidden')).toBe(false);

    // Click mobile link
    const mobileLink = document.querySelector('.mobile-link') as HTMLElement;
    mobileLink.click();

    expect(mobileMenu.classList.contains('hidden')).toBe(true);
  });
});