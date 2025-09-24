import {
    Address,
    CreateAddressPayload,
    CreateCustomerPayload,
    CreateOrderPayload,
    CreatePatientPayload,
    Customer,
    ErrorResponse,
    Order,
    Patient,
} from './schemas';

export class HealthWarehouseClient {
    private baseUrl: string;
    private apiKey: string;

    constructor(apiKey: string, apiBaseUrl: string) {
        this.apiKey = apiKey;
        this.baseUrl = apiBaseUrl;
    }

    private async request<T>(method: string, endpoint: string, body?: any) {
        const url = `${this.baseUrl}${endpoint}`;

        const payload = {
            method,
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
        };

        const response = await fetch(url, payload);

        const data = await response.json<ErrorResponse | T>();

        if (!response.ok) {
            console.log('[ERROR]', { payload, response, data });
            throw new Error(`HealthWarehouse API Error: ${(data as any).error || (data as ErrorResponse).message || response.statusText}`);
        }

        return data as T;
    }

    async createCustomer(customer: CreateCustomerPayload) {
        const response = await this.request<{ customer: Customer }>('POST', '/customers', { customer });
        return response.customer;
    }

    async getCustomer(customerId: Customer['id']) {
        const response = await this.request<{ customer: Customer }>('GET', `/customers/${customerId}`);
        return response.customer;
    }

    async updateCustomerAddress(
        customerId: Customer['id'],
        addressId: Address['address_id'],
        type: 'billing_address' | 'shipping_address',
        address: Partial<CreateAddressPayload>,
    ) {
        const response = await this.request<{
            success: true;
            status: 200;
            message: 'success';
            address: Address;
        }>('POST', `/customers/${customerId}/${type}/${addressId}`, { address });

        return response.address;
    }

    async createPatientWithAddress(patient: CreatePatientPayload, shippingAddress?: CreateAddressPayload) {
        return await this.request<{ patient: Patient; shipping_address: Address }>('POST', '/patients', {
            patient,
            shipping_address: shippingAddress,
        });
    }

    async getPatient(patientId: Patient['id']) {
        const patient = await this.request<{ patient: Patient }>('GET', `/patients/${patientId}`);
        return patient.patient;
    }

    async updatePatient(patientId: Patient['id'], patient: Partial<CreatePatientPayload>) {
        const response = await this.request<{ patient: Patient }>('POST', `/patients/${patientId}`, { patient });
        return response.patient;
    }

    async createOrder(order: CreateOrderPayload) {
        const response = await this.request<{ success: true; status: 200; message: 'success'; order: Order }>('POST', '/orders', { order });
        return response.order;
    }

    async getOrder(orderId: Order['id']) {
        const response = await this.request<{ order: Order; billing_address: Address; shipping_address: Address }>(
            'GET',
            `/orders/${orderId}`,
        );
        return response;
    }
}
