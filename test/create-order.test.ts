import { SELF } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { ROUTES } from '../src';

const LOCAL_API_URL = 'http://localhost:8787';

const generateUniqueId = (seed: string) => `test-${seed}_${Date.now()}`;

const pharmacyOrderFetch = async (body: any) => {
    return SELF.fetch(`${LOCAL_API_URL}${ROUTES.ORDER}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
};

describe('Pharmacy Order API', () => {
    it('should create pharmacy order successfully', async () => {
        const requestBody = {
            patient: {
                intakeq_id: generateUniqueId('guido_test_order'),
                first_name: 'Guido',
                last_name: 'Test Patient',
                gender: 'male',
                pregnant: false,
                dob: '1980-01-15',
                phone: '555-555-5555',
                address1: '123 Main St',
                city: 'New York',
                state: 'NY',
                postal_code: '10001',
                drug_allergy: 'penicillin',
                other_medications: 'none',
                medical_conditions: 'hypertension',
            },
            prescriber: {
                first_name: 'Guido',
                last_name: 'Test Prescriber',
                address: '456 Medical Plaza',
                city: 'New York',
                state: 'NY',
                postal_code: '10002',
                phone: '555-123-4567',
                fax: '555-123-4568',
            },
            line_items: [
                {
                    product_id: 100,
                    medication_details: 'Take one tablet daily',
                },
            ],
        };

        const response = await pharmacyOrderFetch(requestBody);

        expect(response.status).toBe(201);

        const result = await response.json<any>();
        expect(result.success).toBe(true);
        expect(result.message).toBe('Order created successfully');
        expect(result.data).toBeDefined();

        console.log('Order Created:', JSON.stringify(result, null, 2));
    });

    it.skip('should return 400 for missing required fields', async () => {
        const requestBody = {
            patient: {
                intakeq_id: 'test-intakeq-id',
                first_name: 'Guido',
            },
            prescriber: {
                first_name: 'Guido',
                last_name: 'Test Provider',
            },
            line_items: [],
        };

        const response = await pharmacyOrderFetch(requestBody);

        expect(response.status).toBe(400);

        const result = await response.json<any>();
        expect(result.error).toBeDefined();
    });
});
