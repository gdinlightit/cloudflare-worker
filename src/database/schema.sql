-- schema.sql
-- HealthWarehouse Integration Database Schema

-- Table to map IntakeQ patients to HealthWarehouse entities
CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  intakeq_patient_id TEXT UNIQUE NOT NULL,
  hw_patient_id INTEGER NOT NULL,
  hw_shipping_address_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_patient_intakeq ON patients(intakeq_patient_id);