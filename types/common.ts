// types/common.ts
/**
 * Common/shared types
 * Used across multiple features
 */

// ============= PAGINATION =============

export interface PaginationParams {
    page: number;
    limit: number;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
}

// ============= FILTERS & SEARCH =============

export interface ProductFilters {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    availability?: string;
    brand?: string;
    rating?: number; // Min rating
    inStock?: boolean;
}

export interface OrderFilters {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    minAmount?: number;
    maxAmount?: number;
}

export interface UserFilters {
    role?: string;
    isLocked?: boolean;
    createdAfter?: Date;
    createdBefore?: Date;
}

// ============= SORTING =============

export interface SortOption {
    field: string;
    direction: 'asc' | 'desc';
}

export type SortBy = 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'rating' | 'popular';

// ============= RESPONSE METADATA =============

export interface ResponseMeta {
    timestamp: Date;
    version: string;
    path: string;
    duration: number; // ms
}

// ============= ERROR HANDLING =============

export interface ApiError {
    message: string;
    code?: string;
    status?: number;
    details?: any;
}

export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}

// ============= GENERIC TYPES =============

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};

// ============= UTILITY TYPES =============

export interface Page<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    isLast: boolean;
    isFirst: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
}

export type Select<T> = {
    [K in keyof T]?: boolean;
}

export type Flatten<T> = T extends Array<infer U> ? U : T;

export type Exclude<T, U> = T extends U ? never : T;

// ============= ASYNC TYPES =============

export interface AsyncState<T> {
    data?: T;
    error?: Error;
    loading: boolean;
    status: 'idle' | 'pending' | 'success' | 'error';
}

export interface AsyncAction<T> {
    type: 'PENDING' | 'SUCCESS' | 'ERROR' | 'RESET';
    payload?: T | Error;
}

// ============= NOTIFICATION TYPES =============

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

// ============= ANALYTICS =============

export interface Analytics {
    event: string;
    properties: Record<string, any>;
    timestamp: Date;
    userId?: string;
    sessionId?: string;
}

// ============= CACHE =============

export interface CacheEntry<T> {
    data: T;
    timestamp: Date;
    expiresAt: Date;
    ttl: number; // seconds
}

// ============= BATCH OPERATION =============

export interface BatchOperation<T> {
    action: 'create' | 'update' | 'delete';
    data: T;
}

export interface BatchResult<T> {
    success: T[];
    failed: Array<{
        item: T;
        error: string;
    }>;
    total: number;
}

// ============= FILE UPLOAD =============

export interface FileUpload {
    file: File;
    name: string;
    size: number;
    type: string;
    lastModified: number;
}

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

// ============= RANGE =============

export interface Range {
    min: number;
    max: number;
}

export interface DateRange {
    from: Date;
    to: Date;
}