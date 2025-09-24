import { DatabaseService } from '../database/db';
import { HealthWarehouseClient } from '../services/healthwarehouse';
import { OrderService } from '../services/order-service';
import { PatientService } from '../services/patient-service';

export const buildOrderService = (env: Env) => {
    const hwClient = new HealthWarehouseClient(env.HEALTHWAREHOUSE_API_KEY, env.HEALTHWAREHOUSE_API_BASE_URL);
    const dbService = new DatabaseService(env.DB);
    return new OrderService(hwClient, new PatientService(hwClient, dbService));
};
