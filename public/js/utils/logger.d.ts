/**
 * Logger utility for error tracking and performance monitoring
 */
export declare class Logger {
    private static instance;
    private isProduction;
    private constructor();
    static getInstance(): Logger;
    /**
     * Log error with context information
     */
    error(error: Error | string, context?: Record<string, any>): void;
    /**
     * Log performance metrics
     */
    performance(metric: string, value: number, unit?: string): void;
    /**
     * Log user interactions
     */
    event(action: string, category: string, label?: string, value?: number): void;
    /**
     * Simulate sending error data to tracking service
     */
    private sendToErrorTracking;
    /**
     * Simulate sending performance data to tracking service
     */
    private sendToPerformanceTracking;
    /**
     * Simulate sending event data to tracking service
     */
    private sendToEventTracking;
}
/**
 * Global error handler
 */
export declare function setupGlobalErrorHandling(): void;
/**
 * Performance monitoring
 */
export declare function setupPerformanceMonitoring(): void;
