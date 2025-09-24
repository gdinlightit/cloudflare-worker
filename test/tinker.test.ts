import { env } from 'cloudflare:test';
import { beforeEach, describe, it } from 'vitest';
import { DatabaseService } from '../src/database/db';
import { HealthWarehouseClient } from '../src/services/healthwarehouse';
import { OrderService } from '../src/services/order-service';
import { PatientService } from '../src/services/patient-service';
import { generateUniqueId } from './utils';

describe('Tinker - Manual Testing', () => {
    let patientService: PatientService;
    let orderService: OrderService;
    let hwClient: HealthWarehouseClient;
    let dbService: DatabaseService;

    beforeEach(() => {
        hwClient = new HealthWarehouseClient(env.HEALTHWAREHOUSE_API_KEY, env.HEALTHWAREHOUSE_API_BASE_URL);
        dbService = new DatabaseService(env.DB);
        patientService = new PatientService(hwClient, dbService);
        orderService = new OrderService(hwClient, patientService);
    });

    it('patients count', async () => {
        const countResult = await env.DB.prepare('SELECT COUNT(*) as count FROM patients').first<{ count: number }>();
        console.log('Patient Count:', countResult?.count || 0);
    });

    it('create and get DBPatient', async () => {
        const intakeqId = '1';
        await dbService.createPatient(intakeqId, 12345, 1111);
        const result = await dbService.getPatientByIntakeQId(intakeqId);
        console.log('DBPatient:', JSON.stringify(result, null, 2));
    });

    it.skip('getHWPatient', async () => {
        const result = await hwClient.getPatient(13736);
        console.log('HWPatient:', JSON.stringify(result, null, 2));
    });

    it.skip('getHWCustomer', async () => {
        const result = await hwClient.getCustomer(41053);
        console.log('HWCustomer:', JSON.stringify(result, null, 2));
    });

    it.skip('getHWOrder', async () => {
        const result = await hwClient.getOrder(43165);
        console.log('HWOrder:', JSON.stringify(result, null, 2));
    });

    it.skip('create patient with address', async () => {
        const result = await hwClient.createPatientWithAddress(
            {
                customer_id: 41053,
                first_name: 'Guido',
                last_name: 'Test Patient',
                gender: 'male',
                pregnant: false,
                dob: '1980-01-15',
                drug_allergy: 'penicillin',
                other_medications: 'none',
                medical_conditions: 'hypertension',
                metadata: { partner_patient_id: generateUniqueId('guido_test_create_patient') },
            },
            {
                first_name: 'Guido',
                last_name: 'Test Patient',
                address1: '123 Main St',
                city: 'New York',
                state: 'NY',
                postal_code: '10001',
                country: 'US',
                phone: '555-555-5555',
            },
        );
        console.log('HWOrder:', JSON.stringify(result, null, 2));
    });
});
