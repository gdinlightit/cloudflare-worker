import { CreateOrderRequest } from '../routes/schemas';
import { HealthWarehouseClient } from './healthwarehouse';
import { PatientService } from './patient-service';
import { CreateOrderPayload } from './schemas';

const DEFAULT_SHIPPING_METHOD = 'standard'; // over-night no aparece en la documentacion
export class OrderService {
    constructor(
        private hwClient: HealthWarehouseClient,
        private patientService: PatientService,
    ) {}

    async makeOrder(request: CreateOrderRequest) {
        const patient = await this.patientService.getPatient(request.patient);

        const orderResponse = await this.hwClient.createOrder({
            customer_id: patient.hwCustomerId,
            patient_id: patient.hwPatientId,
            billing_address_id: patient.hwBillingAddressId,
            shipping_address_id: patient.hwShippingAddressId,
            order_comment: request.order_comment,
            shipping_method: request.shipping_method ?? DEFAULT_SHIPPING_METHOD,
            line_items: this.buildLineItems(request.line_items),
        });

        return {
            orderId: orderResponse.id,
            patientId: orderResponse.patient_id,
            customerId: orderResponse.customer_id,
        };
    }

    private buildLineItems(items: CreateOrderRequest['line_items']): CreateOrderPayload['line_items'] {
        return items.map((item) => ({
            product_id: item.product_id,
            qty: 1,
        }));
    }
}
