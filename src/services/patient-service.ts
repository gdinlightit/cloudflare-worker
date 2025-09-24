import { DatabaseService, Patient as DBPatient } from '../database/db';
import { CreateOrderRequest } from '../routes/schemas';
import { HealthWarehouseClient } from './healthwarehouse';

interface Patient {
    hwCustomerId: number;
    hwPatientId: number;
    hwShippingAddressId: number;
    hwBillingAddressId: number;
}

export class PatientService {
    constructor(
        private hwClient: HealthWarehouseClient,
        private db: DatabaseService,
    ) {}

    async getPatient(patient: CreateOrderRequest['patient']) {
        const patientMapping = await this.db.getPatientByIntakeQId(patient.intakeq_id);
        const patientResult = patientMapping ? this.handleExistingPatient(patient, patientMapping) : this.handleNewPatient(patient);
        return patientResult;
    }

    private async handleNewPatient(patient: CreateOrderRequest['patient']): Promise<Patient> {
        const customer = await this.getCustomer();

        const patientResponse = await this.hwClient.createPatientWithAddress(
            {
                customer_id: customer.id,
                first_name: patient.first_name,
                last_name: patient.last_name,
                gender: patient.gender,
                pregnant: patient.pregnant ?? false,
                dob: patient.dob,
                drug_allergy: patient.drug_allergy,
                other_medications: patient.other_medications,
                medical_conditions: patient.medical_conditions,
                metadata: {
                    partner_patient_id: patient.intakeq_id,
                },
            },
            {
                first_name: patient.first_name,
                last_name: patient.last_name,
                address1: patient.address1,
                city: patient.city,
                state: patient.state,
                postal_code: patient.postal_code,
                country: 'US',
                phone: patient.phone,
            },
        );

        this.db.createPatient(patient.intakeq_id, patientResponse.patient.id, patientResponse.shipping_address.address_id);

        return {
            hwCustomerId: customer.id,
            hwPatientId: patientResponse.patient.id,
            hwBillingAddressId: customer.billing_addresses[0].address_id,
            hwShippingAddressId: patientResponse.shipping_address.address_id,
        };
    }

    private async handleExistingPatient(patient: CreateOrderRequest['patient'], patientMapping: DBPatient): Promise<Patient> {
        const customer = await this.getCustomer();
        const hwPatient = await this.hwClient.getPatient(patientMapping.hw_patient_id);

        const patientResponse = await this.hwClient.updatePatient(patientMapping.hw_patient_id, {
            customer_id: hwPatient.customer_id,
            first_name: patient.first_name ?? hwPatient.first_name,
            last_name: patient.last_name ?? hwPatient.last_name,
            gender: patient.gender ?? hwPatient.gender,
            pregnant: patient.pregnant ?? hwPatient.pregnant,
            dob: patient.dob ?? hwPatient.dob,
            drug_allergy: patient.drug_allergy ?? hwPatient.drug_allergy,
            other_medications: patient.other_medications ?? hwPatient.other_medications,
            medical_conditions: patient.medical_conditions ?? hwPatient.medical_conditions,
            metadata: { partner_patient_id: patient.intakeq_id },
        });

        const patientShippingAddress = await this.hwClient.updateCustomerAddress(
            customer.id,
            patientMapping.hw_shipping_address_id,
            'shipping_address',
            {
                first_name: patient.first_name,
                last_name: patient.last_name,
                address1: patient.address1,
                city: patient.city,
                state: patient.state,
                postal_code: patient.postal_code,
                country: 'US',
                phone: patient.phone,
            },
        );
        this.db.updatePatientShippingAddress(patientMapping.intakeq_patient_id, patientShippingAddress.address_id);

        return {
            hwCustomerId: customer.id,
            hwBillingAddressId: customer.billing_addresses[0].address_id,
            hwPatientId: patientResponse.id,
            hwShippingAddressId: patientShippingAddress.address_id,
        };
    }

    private async getCustomer() {
        // The customer will be fixed
        // TODO: env var o cached after first fetch
        return await this.hwClient.getCustomer(41053);
    }
}
