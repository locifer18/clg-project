// types/form.ts
/**
 * Form-related types
 * Used in form validation and components
 */

// ============= AUTH FORMS =============

export interface RegisterFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone?: string;
    agreedToTerms: boolean;
}

export interface LoginFormData {
    email: string;
    code: string; // OTP
}

export interface SendOtpFormData {
    email: string;
}

export interface ChangePasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ResetPasswordFormData {
    email: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
}

// ============= PRODUCT FORMS =============

export interface ProductFormData {
    name: string;
    slug?: string;
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


export interface SearchFormData {
    query: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: 'newest' | 'price-asc' | 'price-desc' | 'rating';
}

export interface FilterFormData {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    rating?: number;
    availability?: string;
}

// ============= ORDER FORMS =============

export interface CheckoutFormData {
    addressId: string;
    paymentMethod: 'card' | 'upi' | 'wallet' | 'netbanking';
    saveAddress: boolean;
}

// ============= CART FORMS =============

export interface CartItemFormData {
    productId: string;
    quantity: number;
}

// ============= ADDRESS FORMS =============

export interface AddressFormData {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    type: 'SHIPPING' | 'BILLING';
    isDefault: boolean;
}

// ============= REVIEW FORMS =============

export interface ReviewFormData {
    productId: string;
    rating: number;
    comment?: string;
}

// ============= ADMIN FORMS =============

export interface AdminProductFormData extends ProductFormData {
    sku?: string;
    barcode?: string;
}

export interface AdminUserFormData {
    name: string;
    email: string;
    phone?: string;
    role: 'CUSTOMER' | 'ADMIN';
    isLocked: boolean;
}

export interface AdminOrderFormData {
    status: string;
    trackingNumber?: string;
    trackingUrl?: string;
}

// ============= BULK FORMS =============

export interface BulkImportFormData {
    file: File;
    type: 'products' | 'users' | 'orders';
}

// ============= FORM STATE =============

export interface FormError {
    field: string;
    message: string;
}

export interface FormState<T> {
    values: T;
    errors: FormError[];
    touched: Partial<Record<keyof T, boolean>>;
    isSubmitting: boolean;
    isValid: boolean;
}

// ============= FORM ACTIONS =============

export interface FormAction<T> {
    type: 'SET_FIELD' | 'SET_ERROR' | 'SET_TOUCHED' | 'RESET' | 'SET_SUBMITTING';
    payload: Partial<T> | FormError[] | boolean;
}