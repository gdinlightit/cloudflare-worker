import { z } from 'zod';
import { dobSchema, genderSchema, phoneSchema, postalCodeSchema, SHIPPING_METHODS, usStateSchema } from '../services/schemas';

const patientSchema = z.object({
    intakeq_id: z.string().min(1, 'IntakeQ ID is required'),
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    pregnant: z.boolean().optional(),
    gender: genderSchema,
    dob: dobSchema,
    phone: phoneSchema,
    address1: z.string().min(1, 'Address line 1 is required'),
    city: z.string().min(1, 'City is required'),
    state: usStateSchema,
    postal_code: postalCodeSchema,
    drug_allergy: z.string().min(1, 'Drug allergy information is required'),
    other_medications: z.string().min(1, 'Other medications information is required'),
    medical_conditions: z.string().min(1, 'Medical conditions information is required'),
});

const prescriberSchema = z.object({
    first_name: z.string().min(1, 'Prescriber first name is required'),
    last_name: z.string().min(1, 'Prescriber last name is required'),
});

const lineItemSchema = z.object({
    product_id: z.number().int().positive('Product ID must be a positive integer'),
    medication_details: z.string().min(1, 'Medication details are required'),
});

const shippingMethodSchema = z.enum(SHIPPING_METHODS).optional();

export const createOrderRequestSchema = z.object({
    patient: patientSchema,
    prescriber: prescriberSchema,
    line_items: z.array(lineItemSchema).min(1, 'At least one line item is required'),
    order_comment: z.string().optional(),
    shipping_method: shippingMethodSchema,
});

export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;
