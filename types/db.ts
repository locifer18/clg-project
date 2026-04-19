// types/db.ts
/**
 * Database entity types
 * Corresponds to Prisma schema models
 */

import { Role, OrderStatus, ProductAvailability, OtpType, AddressType } from './enums';

// ============= USER =============

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    image?: string;
    phone?: string;
    answer?: string;
    role: Role;
    emailVerified?: Date;
    tokenVersion: number;
    loginAttempts: number;
    isLocked: boolean;
    lockedUntil?: Date;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export type UserWithoutPassword = Omit<User, 'password'>;

export interface UserProfile extends UserWithoutPassword {
    orderCount?: number;
    totalSpent?: number;
}

// ============= AUTH & SESSION =============

export interface Session {
    id: string;
    userId: string;
    refreshToken?: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface LoginLog {
    id: string;
    userId: string;
    email: string;
    success: boolean;
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
    country?: string;
    createdAt: Date;
}

export interface OtpToken {
    id: string;
    email: string;
    code: string; // Hashed
    type: OtpType;
    expiresAt: Date;
    attempts: number;
    lastSentAt: Date;
    createdAt: Date;
}

// ============= ADDRESS =============

export interface Address {
    id: string;
    userId: string;
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    isDefault: boolean;
    type: AddressType;
    createdAt: Date;
    updatedAt: Date;
}

// ============= CATEGORY =============

export interface Category {
    id: string;
    name: string;
    slug: string;
    image?: string;
    description: string;
    createdAt: Date;
}

export interface CategoryWithCount extends Category {
    productCount?: number;
}

// ============= PRODUCT =============

export interface Product {
    id: string;
    name: string;
    slug: string;
    image?: string;
    additionalImages: string[];
    description: string;
    price: number;
    availability: ProductAvailability;
    quantity: number;
    brand?: string;
    shipping: boolean;
    categoryId: string;
    productDetails?: JSON; 
    createdAt: Date;
    updatedAt: Date;
}

export interface ProductWithCalculated extends Product {
    rating: number;
    reviewCount: number;
}

export interface ProductFaq {
    id: string;
    productId: string;
    question: string;
    answer: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

// ============= REVIEW =============

export interface Review {
    id: string;
    rating: number;
    comment?: string;
    userId: string;
    productId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ReviewWithUser extends Review {
    user: {
        id: string;
        name: string;
    };
}

// ============= CART =============

export interface Cart {
    id: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CartItem {
    id: string;
    cartId: string;
    productId: string;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CartWithItems extends Cart {
    items: CartItem[];
}

export interface CartSummary {
    totalItems: number;
    totalPrice: number;
    items: CartItem[];
}

// ============= ORDER =============

export interface Order {
    id: string;
    orderNumber: string;
    buyerId: string;
    addressId: string;
    status: OrderStatus;
    subTotal: number;
    shippingCost: number;
    taxAmount: number;
    totalAmount: number;
    trackingNumber?: string;
    trackingUrl?: string;
    orderedAt: Date;
    confirmedAt?: Date;
    processedAt?: Date;
    shippedAt?: Date;
    deliveredAt?: Date;
    cancelledAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
    createdAt: Date;
}

export interface OrderWithItems extends Order {
    items: OrderItem[];
}

// ============= PAYMENT =============

export interface Payment {
    id: string;
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    paymentMethod?: string;
    bankName?: string;
    cardLast4?: string;
    cardNetwork?: string;
    vpa?: string;
    walletName?: string;
    failureReason?: string;
    failureCode?: string;
    paidAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

import { PaymentStatus } from './enums';