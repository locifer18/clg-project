// types/api.ts
/**
 * API request and response types
 * Used in API routes, services, and API clients
 */

import { UserWithoutPassword, Order, Product } from './db';
import { Role, OrderStatus } from './enums';

// ============= AUTH REQUESTS =============

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    phone?: string;
}

export interface LoginRequest {
    email: string;
    code: string; // OTP
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface SendOtpRequest {
    email: string;
    type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'LOGIN_VERIFICATION';
}

export interface VerifyOtpRequest {
    email: string;
    code: string;
    type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'LOGIN_VERIFICATION';
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ResetPasswordRequest {
    email: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
}

// ============= AUTH RESPONSES =============

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    user: AuthUser;
    accessToken?: string;
    refreshToken?: string;
}

export interface TokenPayload {
    userId: string;
    email: string;
    role: Role;
    sessionId?: string;
    tokenVersion?: number;
}

// ============= PRODUCT REQUESTS =============

export interface FetchProductsParams {
    page?: number;
    limit?: number;
    sort?: 'newest' | 'price-asc' | 'price-desc' | 'rating';
    category?: string;
    search?: string;
    featured?: boolean;
    minPrice?: number;
    maxPrice?: number;
}

export interface CreateProductRequest {
    name: string;
    description: string;
    price: number;
    categoryId: string;
    image?: string;
    additionalImages?: string[];
    availability: string;
    quantity: number;
    brand?: string;
    shipping: boolean;
    productDetails?: JSON;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

// ============= ORDER REQUESTS =============

export interface CreateOrderRequest {
    addressId: string;
    items: {
        productId: string;
        quantity: number;
    }[];
}

export interface UpdateOrderStatusRequest {
    status: OrderStatus;
    trackingNumber?: string;
    trackingUrl?: string;
}

export interface CancelOrderRequest {
    orderId: string;
    reason?: string;
}

// ============= CART REQUESTS =============

export interface AddToCartRequest {
    productId: string;
    quantity: number;
}

export interface UpdateCartItemRequest {
    quantity: number;
}

export interface RemoveFromCartRequest {
    cartItemId: string;
}

// ============= REVIEW REQUESTS =============

export interface CreateReviewRequest {
    productId: string;
    rating: number;
    comment?: string;
}

export interface UpdateReviewRequest {
    rating?: number;
    comment?: string;
}

// ============= ADDRESS REQUESTS =============

export interface CreateAddressRequest {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    type: 'SHIPPING' | 'BILLING';
    isDefault?: boolean;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {}

// ============= STANDARD RESPONSES =============

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    code?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
        hasMore: boolean;
    };
}

export interface ErrorResponse {
    success: false;
    message: string;
    code?: string;
    error?: any;
}

export interface SuccessResponse<T = any> {
    success: true;
    message?: string;
    data?: T;
}

// ============= SPECIFIC RESPONSES =============

export interface ProductListResponse extends PaginatedResponse<Product> {}

export interface OrderResponse extends ApiResponse<Order> {}

export interface UserResponse extends ApiResponse<UserWithoutPassword> {}

export interface SessionResponse extends ApiResponse<{
    id: string;
    device: string;
    ipAddress: string;
    createdAt: Date;
    expiresAt: Date;
}[]> {}

export interface LoginHistoryResponse extends PaginatedResponse<{
    id: string;
    success: boolean;
    timestamp: Date;
    device: string;
    ipAddress: string;
    reason?: string;
    alerts?: Array<{
        type: string;
        severity: string;
        message: string;
    }>;
}> {}