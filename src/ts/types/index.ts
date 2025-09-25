/**
 * Type definitions for Hogar Terapéutico
 */

export interface Schedule {
  fecha: string;
  horas: string[];
}

export interface PerformanceEntry {
  entryType: string;
  startTime: number;
  processingStart?: number;
}

export interface LitePickerInstance {
  on(event: string, callback: Function): void;
}

// Litepicker types (loaded from CDN)
declare global {
  interface Window {
    Litepicker?: any;
  }
}

declare global {
  interface Window {
    gtag?: (command: string, action: string, params?: any) => void;
  }
}

export interface HTMLButtonElementWithToggle extends HTMLButtonElement {
  toggleAttribute: (name: string, force?: boolean) => boolean;
}