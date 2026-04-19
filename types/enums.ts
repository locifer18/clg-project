// types/enums.ts
/**
 * All enum definitions for the application
 * Synced with Prisma schema
 */

export enum Role {
    CUSTOMER = 'CUSTOMER',
    ADMIN = 'ADMIN',
}

export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    REFUNDED = 'REFUNDED',
}

export enum ProductAvailability {
    IN_STOCK = 'IN_STOCK',
    OUT_OF_STOCK = 'OUT_OF_STOCK',
    PREORDER = 'PREORDER',
    BACKORDER = 'BACKORDER',
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
    PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum OtpType {
    EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
    PASSWORD_RESET = 'PASSWORD_RESET',
    LOGIN_VERIFICATION = 'LOGIN_VERIFICATION',
}

export enum AddressType {
    SHIPPING = 'SHIPPING',
    BILLING = 'BILLING',
}