import { z } from 'zod';

const hwTimestampSchema = z.iso.datetime({
    message: 'Invalid HealthWarehouse timestamp format (expected: YYYY-MM-DDTHH:mm:ssZ)',
});

const timestampsSchema = z.object({
    created_at: hwTimestampSchema,
    updated_at: hwTimestampSchema,
});

export const SHIPPING_METHODS = ['free', 'standard', 'signature', 'usps_priority', 'ups_ground', 'ups_2day', 'ups_nextday'] as const;
const shippingMethodSchema = z.enum(SHIPPING_METHODS);

export const GENDER = ['male', 'female'] as const;
export const genderSchema = z.enum(GENDER);

export const dobSchema = z.iso.date({ message: 'Invalid date format (expected: YYYY-MM-DD)' });

export const usStateSchema = z
    .string()
    .length(2, 'State must be 2-character code')
    .regex(/^[A-Z]{2}$/, 'State must be uppercase');

export const phoneSchema = z.string().regex(/^\d{3}-\d{3}-\d{4}$/, { error: 'Phone must be in XXX-XXX-XXXX format' });

export const postalCodeSchema = z.string().regex(/^\d{5}(-\d{4})?$/, { error: 'Postal code must be in 12345 or 12345-6789 format' });

const addressSchema = z.object({
    address_id: z.number().int().positive(),
    prefix: z.string().optional(),
    first_name: z.string().min(1, 'First name is required'),
    middle_name: z.string().optional(),
    last_name: z.string().min(1, 'Last name is required'),
    suffix: z.string().optional(),
    company: z.string().optional(),
    address1: z.string().min(1, 'Address line 1 is required'),
    address2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: usStateSchema,
    country: z.literal('US'),
    postal_code: postalCodeSchema,
    phone: phoneSchema,
    phone_evening: phoneSchema.optional(),
    fax: phoneSchema.optional(),
    label: z.string().optional(),
    ...timestampsSchema.partial().shape,
});

const lineItemSchema = z.object({
    product_id: z.number().int().positive('Product ID must be a positive integer'),
    qty: z.number().int().positive('Quantity must be a positive integer'),
});

const customerSchema = z.object({
    id: z.number().int().positive(),
    prefix: z.string().optional(),
    first_name: z.string().min(1, 'First name is required'),
    middle_name: z.string().optional(),
    last_name: z.string().min(1, 'Last name is required'),
    suffix: z.string().optional(),
    email: z.email().optional(),
    gender: genderSchema.optional(),
    dob: dobSchema.optional(),
    billing_addresses: z.array(addressSchema).min(1, 'At least one billing address required'),
    shipping_addresses: z.array(addressSchema).min(1, 'At least one shipping address required'),
    metadata: z
        .object({
            partner_customer_id: z.string(),
        })
        .optional(),
    ...timestampsSchema.partial().shape,
});

const patientSchema = z.object({
    id: z.number().int().positive(),
    customer_id: z.number().int().positive(),
    prefix: z.string().optional(),
    first_name: z.string().min(1, 'First name is required'),
    middle_name: z.string().optional(),
    last_name: z.string().min(1, 'Last name is required'),
    suffix: z.string().optional(),
    maiden_name: z.string().optional(),
    gender: genderSchema,
    pregnant: z.boolean(),
    dob: dobSchema,
    safety_cap: z.boolean().optional(),
    drug_allergy: z.string().min(1, 'Drug allergy information is required'),
    other_medications: z.string().min(1, 'Other medications information is required'),
    medical_conditions: z.string().min(1, 'Medical conditions information is required'),
    metadata: z
        .object({
            partner_patient_id: z.string(),
        })
        .optional(),
    ...timestampsSchema.partial().shape,
});

const orderSchema = z.object({
    id: z.number().int().positive(),
    customer_id: z.number().int().positive().optional(),
    patient_id: z.number().int().positive().optional(),
    billing_address_id: z.number().int().positive().optional(),
    shipping_address_id: z.number().int().positive().optional(),
    order_comment: z.string().optional(),
    shipping_method: shippingMethodSchema,
    line_items: z.array(lineItemSchema).min(1, 'At least one line item required'),
    status: z.enum(['processing', 'transfer_success', 'transfer_failure', 'dispensed', 'complete', 'canceled']).optional(),
    metadata: z
        .object({
            partner_order_id: z.string(),
        })
        .optional(),
    ...timestampsSchema.partial().shape,
});

const createAddressPayloadSchema = addressSchema.omit({
    address_id: true,
    created_at: true,
    updated_at: true,
});

const createCustomerPayloadSchema = z.object({
    ...customerSchema.omit({
        id: true,
        created_at: true,
        updated_at: true,
    }).shape,
    billing_addresses: z.array(createAddressPayloadSchema).min(1),
    shipping_addresses: z.array(createAddressPayloadSchema).min(1),
});

const createPatientPayloadSchema = patientSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
});

const createOrderPayloadSchema = orderSchema.omit({
    id: true,
    status: true,
    created_at: true,
    updated_at: true,
});

const successResponseSchema = z.object({
    success: z.literal(true),
    status: z.number().int().min(200).max(299),
    message: z.literal('success'),
});

const errorResponseSchema = z.object({
    status: z.number().int().min(400).max(599),
    message: z.string(),
});

export type Address = z.infer<typeof addressSchema>;
export type CreateAddressPayload = z.infer<typeof createAddressPayloadSchema>;
export type LineItem = z.infer<typeof lineItemSchema>;
export type Customer = z.infer<typeof customerSchema>;
export type CreateCustomerPayload = z.infer<typeof createCustomerPayloadSchema>;
export type Patient = z.infer<typeof patientSchema>;
export type CreatePatientPayload = z.infer<typeof createPatientPayloadSchema>;
export type Order = z.infer<typeof orderSchema>;
export type CreateOrderPayload = z.infer<typeof createOrderPayloadSchema>;
export type ShippingMethod = z.infer<typeof shippingMethodSchema>;
export type Gender = z.infer<typeof genderSchema>;
export type SuccessResponse = z.infer<typeof successResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
