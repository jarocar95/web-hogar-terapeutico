/**
 * Logger utility for error tracking and performance monitoring
 */
export class Logger {
  private static instance: Logger;
  private isProduction: boolean;

  private constructor() {
    // Estaba fijado a false con el comentario "default to development", así
    // que en producción SIEMPRE tomaba la rama de consola: cada visitante
    // recibía un volcado con el título de la página, la URL, su user-agent y
    // tres métricas de rendimiento. Once mensajes por carga.
    //
    // La detección va por hostname porque el sitio es estático y no hay
    // proceso de build que inyecte un NODE_ENV al cliente. localhost y los
    // deploy previews de Netlify siguen mostrando la consola, que es donde
    // esa información sirve de algo.
    const host = window.location.hostname;
    this.isProduction =
      host === 'hogarterapeutico.com' || host === 'www.hogarterapeutico.com';
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

        // LCP y FID se median aqui con getEntriesByType, y de ahi salia el
        // aviso "Deprecated API for given entry type" en cada carga: esos dos
        // tipos solo se exponen a traves de PerformanceObserver, no del
        // registro de entradas.
        //
        // Ademas era la tercera vez que se median las mismas dos metricas en
        // el proyecto. La buena vive en performance-optimizer.monitorWebVitals(),
        // que usa la API de observador y congela el LCP en la primera
        // interaccion. Las de aqui informaban de valores que ya no eran el LCP.
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