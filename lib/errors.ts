// lib/errors.ts
import { ApiResponse } from '@/types';
import { NextResponse } from 'next/server';

/**
 * Custom error types for better error handling
 */

export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public code?: string
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(400, message, 'VALIDATION_ERROR');
        this.name = 'ValidationError';
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super(401, message, 'AUTHENTICATION_ERROR');
        this.name = 'AuthenticationError';
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Forbidden') {
        super(403, message, 'AUTHORIZATION_ERROR');
        this.name = 'AuthorizationError';
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Not found') {
        super(404, message, 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}

export class ConflictError extends AppError {
    constructor(message: string = 'Conflict') {
        super(409, message, 'CONFLICT');
        this.name = 'ConflictError';
    }
}

export class RateLimitError extends AppError {
    constructor(message: string = 'Too many requests') {
        super(429, message, 'RATE_LIMIT_EXCEEDED');
        this.name = 'RateLimitError';
    }
}

export class InternalServerError extends AppError {
    constructor(message: string = 'Internal server error') {
        super(500, message, 'INTERNAL_SERVER_ERROR');
        this.name = 'InternalServerError';
    }
}

/**
 * Create success response
 */
export function successResponse<T = any>(
    message: string,
    data?: T,
    statusCode: number = 200
): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
        {
            success: true,
            message,
            data,
        },
        { status: statusCode }
    );
}

/**
 * Create error response
 */
export function errorResponse(
    message: string,
    statusCode: number = 400,
    code?: string,
    error?: any
): NextResponse<ApiResponse> {
    if (process.env.NODE_ENV === 'development') {
        console.error(`[${statusCode}] ${code || 'ERROR'}: ${message}`, error);
    }

    return NextResponse.json(
        {
            success: false,
            message,
            code,
        },
        { status: statusCode }
    );
}

/**
 * Handle caught errors and return appropriate response
 */
export function handleError(error: unknown): NextResponse<ApiResponse> {
    // Custom AppError
    if (error instanceof AppError) {
        return errorResponse(error.message, error.statusCode, error.code);
    }

    // Zod validation errors
    if (error instanceof Error && error.name === 'ZodError') {
        const zodError = error as any;
        const messages = zodError.issues?.map((issue: any) => issue.message).join(', ');
        return errorResponse(messages || 'Validation error', 400, 'VALIDATION_ERROR');
    }

    // Generic errors
    if (error instanceof Error) {
        console.error('Unhandled error:', error);
        return errorResponse(
            process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : error.message,
            500,
            'INTERNAL_SERVER_ERROR'
        );
    }

    // Unknown errors
    console.error('Unknown error:', error);
    return errorResponse('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
}

/**
 * Async error wrapper for route handlers
 * Use to catch errors in async functions
 */
export function asyncHandler(fn: Function) {
    return async (...args: any[]) => {
        try {
            return await fn(...args);
        } catch (error) {
            return handleError(error);
        }
    };
}

/**
 * Type-safe error logger
 */
export function logError(error: unknown, context?: string): void {
    const timestamp = new Date().toISOString();

    if (error instanceof Error) {
        console.error(`[${timestamp}] ${context ? `[${context}] ` : ''}${error.name}: ${error.message}`);
        console.error(error.stack);
    } else {
        console.error(`[${timestamp}] ${context ? `[${context}] ` : ''}Unknown error:`, error);
    }
}


const errorFunctions = {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    RateLimitError,
    InternalServerError,
    successResponse,
    errorResponse,
    handleError,
    asyncHandler,
    logError,
};

export default errorFunctions