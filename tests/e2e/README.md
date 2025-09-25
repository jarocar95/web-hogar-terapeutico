# End-to-End Testing Setup

This directory contains comprehensive end-to-end tests for the Hogar Terapéutico website using Playwright.

## Overview

The end-to-end testing suite covers all critical user flows and interactions:

- **Contact Form Submission** - Tests form validation, submission, loading states, and error handling
- **Mobile Menu Functionality** - Tests hamburger menu, accessibility, keyboard navigation
- **Navigation Between Pages** - Tests internal links, browser navigation, smooth scrolling
- **Cookie Banner Acceptance** - Tests GDPR compliance, localStorage, Google Analytics integration
- **Scroll Effects** - Tests header shrink, mobile CTA bar, performance
- **Animations** - Tests intersection observer, fade-in animations, performance
- **Accessibility Features** - Tests ARIA labels, keyboard navigation, screen reader support

## Testing Framework

We use **Playwright** for end-to-end testing because it offers:

- Cross-browser testing (Chromium, Firefox, WebKit)
- Mobile emulation
- Auto-wait and retry mechanisms
- Excellent debugging tools
- CI/CD integration
- Accessibility testing capabilities

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

3. Run the development server:
```bash
npm run start
```

## Running Tests

### All Tests
```bash
npm run test:e2e
```

### Specific Test Files
```bash
npm run test:e2e -- tests/e2e/contact-form.spec.ts
```

### With UI Mode
```bash
npm run test:e2e:ui
```

### Headed Mode (Visible Browser)
```bash
npm run test:e2e:headed
```

### Debug Mode
```bash
npm run test:e2e:debug
```

### Mobile Tests Only
```bash
npm run test:e2e:mobile
```

### View Test Reports
```bash
npm run test:e2e:report
```

### Run All Tests (Unit + E2E)
```bash
npm run test:all
```

## Test Structure

```
tests/e2e/
├── contact-form.spec.ts      # Contact form functionality
├── mobile-menu.spec.ts        # Mobile menu and navigation
├── cookie-banner.spec.ts     # GDPR cookie compliance
├── navigation.spec.ts         # Page navigation and links
├── scroll-effects.spec.ts     # Scroll-based interactions
├── animations.spec.ts         # CSS animations and effects
├── accessibility.spec.ts      # Accessibility compliance
├── auth.setup.ts             # Authentication setup
└── README.md                 # This file
```

## Configuration

The Playwright configuration is in `playwright.config.ts`:

- **Base URL**: `http://localhost:8080`
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Timeouts**: Configured for reliability
- **Reporting**: HTML reports with screenshots and videos on failure

## CI/CD Integration

The tests are automatically run in CI/CD via GitHub Actions:

### Workflows

1. **End-to-End Tests** (`e2e-tests.yml`):
   - Tests across multiple Node.js versions
   - Tests across all browsers
   - Runs on push and pull requests

2. **Mobile Tests** (`mobile-tests.yml`):
   - Tests mobile-specific functionality
   - Emulates mobile devices

3. **Accessibility Tests** (`accessibility-tests.yml`):
   - Runs comprehensive accessibility tests
   - Ensures WCAG compliance

4. **Critical Flows** (`critical-flows.yml`):
   - Tests only the most critical user flows
   - Fast feedback for important functionality

### Environment Variables

The tests can be configured with environment variables:

```bash
# Set base URL for different environments
BASE_URL=http://localhost:8080

# Run tests in headed mode for debugging
HEADED=true

# Enable debugging
DEBUG=pw:api
```

## Test Coverage

### Critical User Flows Tested

1. **Contact Form** ✅
   - Form validation
   - Submission handling
   - Loading states
   - Error handling
   - Success messages

2. **Mobile Menu** ✅
   - Menu toggle functionality
   - Accessibility attributes
   - Keyboard navigation
   - Mobile responsiveness

3. **Cookie Banner** ✅
   - GDPR compliance
   - localStorage persistence
   - Google Analytics integration
   - Cross-page behavior

4. **Navigation** ✅
   - Internal links
   - Browser navigation
   - Smooth scrolling
   - Mobile navigation

5. **Scroll Effects** ✅
   - Header shrink
   - Mobile CTA bar
   - Performance optimization
   - Debounced events

6. **Animations** ✅
   - Intersection observer
   - Fade-in effects
   - Performance testing
   - Reduced motion support

7. **Accessibility** ✅
   - ARIA labels and roles
   - Keyboard navigation
   - Screen reader support
   - Color contrast
   - Form accessibility

## Debugging

### Debug Mode
```bash
npm run test:e2e:debug
```

### Playwright Inspector
```bash
# Add this to your test
await page.pause();
```

### Screenshots and Videos
Screenshots and videos are automatically captured on test failures and saved to:
- `test-results/`
- `playwright-report/`

### Console Logs
```typescript
// In your test
await page.on('console', msg => console.log(msg.text()));
await page.on('pageerror', error => console.log(error.message));
```

## Best Practices

1. **Test User Flows, Not Implementation**: Tests focus on what users do, not how the code works
2. **Use Selectors Wisely**: Use semantic selectors like `[aria-label="Close menu"]` instead of CSS classes
3. **Auto-Wait**: Playwright automatically waits for elements to be ready
4. **Retry on Failure**: Tests automatically retry in CI/CD
5. **Accessibility First**: All tests include accessibility checks
6. **Mobile First**: Tests include mobile-specific scenarios

## Adding New Tests

1. Create a new test file in `tests/e2e/`
2. Use the naming convention `feature-name.spec.ts`
3. Follow the existing test structure
4. Include accessibility checks
5. Test both desktop and mobile scenarios
6. Add error handling and edge cases

Example test structure:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should do something important', async ({ page }) => {
    // Test implementation
  });
});
```

## Troubleshooting

### Common Issues

1. **Server not starting**: Make sure port 8080 is available
2. **Tests timing out**: Increase timeouts in `playwright.config.ts`
3. **Element not found**: Use `await page.waitForSelector()` or increase wait time
4. **Flaky tests**: Use `test.retry()` or increase retry count in config

### Getting Help

- Playwright Documentation: https://playwright.dev/
- Playwright GitHub: https://github.com/microsoft/playwright
- Playwright Discord: https://discord.gg/playwright

## Maintenance

- Update Playwright regularly: `npm install @playwright/test@latest`
- Update browsers: `npx playwright install`
- Review and update tests when features change
- Monitor test execution times and optimize slow tests
- Regular accessibility audits