/**
 * Logger utility for error tracking and performance monitoring
 */
export class Logger {
  private static instance: Logger;
  private isProduction: boolean;

  private constructor() {
    this.isProduction = false; // Default to development for browser environment
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Log error with context information
   */
  error(error: Error | string, context?: Record<string, any>): void {
    const errorData = {
      timestamp: new Date().toISOString(),
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      context: context || {},
      url: window.location.href,
      userAgent: navigator.userAgent,
      referrer: document.referrer
    };

    if (this.isProduction) {
      // In production, send to error tracking service
      this.sendToErrorTracking(errorData);
    } else {
      // In development, log to console
      console.error('Logger Error:', errorData);
    }
  }

  /**
   * Log performance metrics
   */
  performance(metric: string, value: number, unit: string = 'ms'): void {
    const performanceData = {
      timestamp: new Date().toISOString(),
      metric,
      value,
      unit,
      url: window.location.href
    };

    if (this.isProduction) {
      this.sendToPerformanceTracking(performanceData);
    } else {
      console.log('Performance:', performanceData);
    }
  }

  /**
   * Log user interactions
   */
  event(action: string, category: string, label?: string, value?: number): void {
    const eventData = {
      timestamp: new Date().toISOString(),
      action,
      category,
      label,
      value,
      url: window.location.href
    };

    if (this.isProduction) {
      this.sendToEventTracking(eventData);
    } else {
      console.log('Event:', eventData);
    }
  }

  /**
   * Simulate sending error data to tracking service
   */
  private sendToErrorTracking(errorData: any): void {
    // This would normally send to a service like Sentry, LogRocket, etc.
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'error', {
        event_category: 'javascript',
        event_label: errorData.message,
        non_interaction: true
      });
    }
  }

  /**
   * Simulate sending performance data to tracking service
   */
  private sendToPerformanceTracking(performanceData: any): void {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'performance_metric', {
        event_category: 'performance',
        event_label: performanceData.metric,
        value: Math.round(performanceData.value),
        non_interaction: true
      });
    }
  }

  /**
   * Simulate sending event data to tracking service
   */
  private sendToEventTracking(eventData: any): void {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventData.action, {
        event_category: eventData.category,
        event_label: eventData.label,
        value: eventData.value,
        non_interaction: false
      });
    }
  }
}

/**
 * Global error handler
 */
export function setupGlobalErrorHandling(): void {
  const logger = Logger.getInstance();

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    logger.error(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      type: 'uncaught_error'
    });
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error(event.reason, {
      type: 'unhandled_promise_rejection',
      promise: event.promise
    });
  });

  // Handle resource loading errors
  window.addEventListener('error', (event) => {
    if (event.target && ('src' in event.target || 'href' in event.target)) {
      const target = event.target as HTMLImageElement | HTMLScriptElement | HTMLLinkElement;
      const resourceUrl = 'src' in target ? target.src : target.href;

      logger.error(`Resource loading failed: ${resourceUrl}`, {
        type: 'resource_error',
        resourceType: target.tagName.toLowerCase(),
        resourceUrl
      });
    }
  }, true);
}

/**
 * Performance monitoring
 */
export function setupPerformanceMonitoring(): void {
  const logger = Logger.getInstance();

  // Monitor page load performance
  if ('performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          logger.performance('page_load_time', navigation.loadEventEnd - navigation.fetchStart);
          logger.performance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
          logger.performance('first_paint', navigation.responseEnd - navigation.fetchStart);
        }

        // Monitor largest contentful paint
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        if (lcpEntries.length > 0) {
          const lcp = lcpEntries[lcpEntries.length - 1];
          logger.performance('lcp', lcp.startTime);
        }

        // Monitor first input delay
        const fidEntries = performance.getEntriesByType('first-input');
        if (fidEntries.length > 0) {
          const fid = fidEntries[0] as PerformanceEventTiming;
          logger.performance('fid', fid.processingStart - fid.startTime);
        }
      }, 0);
    });
  }

  // Monitor long tasks (tasks that take more than 50ms)
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) {
            logger.performance('long_task', entry.duration, 'ms');
          }
        });
      });
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      logger.error('Failed to setup long task observer', { error: e });
    }
  }
}