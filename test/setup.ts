import { env } from 'cloudflare:test';
import { afterEach, beforeEach } from 'vitest';

beforeEach(async () => {
    const db = env.DB;

    const STATEMENTS = [
        'CREATE TABLE IF NOT EXISTS patients (id INTEGER PRIMARY KEY AUTOINCREMENT, intakeq_patient_id TEXT UNIQUE NOT NULL, hw_patient_id INTEGER NOT NULL, hw_shipping_address_id INTEGER NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
        'CREATE INDEX IF NOT EXISTS idx_patient_intakeq ON patients(intakeq_patient_id)',
    ];

    try {
        for (const stmt of STATEMENTS) {
            await db.prepare(stmt).run();
        }
    } catch (error) {
        // console.error('Error setting up the database:', error);
    }
});

afterEach(async () => {
    const db = env.DB;

    const STATEMENTS = ['DROP INDEX IF EXISTS idx_patient_intakeq', 'DROP TABLE IF EXISTS patients'];

    try {
        for (const stmt of STATEMENTS) {
            await db.prepare(stmt).run();
        }
    } catch (error) {
        // console.error('Error cleaning up the database:', error);
    }
});
