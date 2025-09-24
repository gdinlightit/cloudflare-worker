interface Timestamps {
    created_at: string;
    updated_at: string;
}

export interface Patient extends Timestamps {
    id: number;
    intakeq_patient_id: string;
    hw_patient_id: number;
    hw_shipping_address_id: number;
}

export class DatabaseService {
    constructor(private db: D1Database) {}

    async getPatientByIntakeQId(intakeqPatientId: Patient['intakeq_patient_id']) {
        return await this.db.prepare('SELECT * FROM patients WHERE intakeq_patient_id = ?').bind(intakeqPatientId).first<Patient>();
    }

    async createPatient(
        intakeqPatientId: Patient['intakeq_patient_id'],
        hwPatientId: Patient['hw_patient_id'],
        hwShippingAddressId: Patient['hw_shipping_address_id'],
    ) {
        const result = await this.db
            .prepare(
                `INSERT INTO patients 
         (intakeq_patient_id, hw_patient_id, hw_shipping_address_id, updated_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)
         RETURNING *`,
            )
            .bind(intakeqPatientId, hwPatientId, hwShippingAddressId)
            .first<Patient>();

        if (!result) {
            throw new Error('Failed to create patient');
        }

        return result;
    }

    async updatePatientShippingAddress(
        intakeqPatientId: Patient['intakeq_patient_id'],
        hwShippingAddressId: Patient['hw_shipping_address_id'],
    ) {
        const result = await this.db
            .prepare(
                `UPDATE patients 
         SET hw_shipping_address_id = ?, updated_at = CURRENT_TIMESTAMP
         WHERE hw_patient_id = ?
         RETURNING *`,
            )
            .bind(hwShippingAddressId, intakeqPatientId)
            .first<Patient>();

        if (!result) {
            throw new Error('Failed to update patient shipping address');
        }

        return result;
    }
}
