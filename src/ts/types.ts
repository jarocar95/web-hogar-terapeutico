export interface Schedule {
    fecha: string;
    horas: string[];
}

export interface PerformanceEntry {
    entryType: string;
    startTime: number;
    processingStart?: number;
}