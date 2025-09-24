import { buildOrderService } from '../utils/DI';
import { HTTP_STATUS, jsonResponse } from '../utils/response';
import { createOrderRequestSchema } from './schemas';

export async function createOrderController(request: Request, env: Env): Promise<Response> {
    try {
        const validatedBody = createOrderRequestSchema.safeParse(await request.json());
        if (!validatedBody.success) {
            return jsonResponse(
                {
                    success: false,
                    error: 'Validation error',
                    details: validatedBody.error.format(),
                },
                HTTP_STATUS.BAD_REQUEST,
            );
        }

        const result = await buildOrderService(env).makeOrder(validatedBody.data);

        return jsonResponse(
            {
                success: true,
                message: 'Order created successfully',
                data: result,
            },
            HTTP_STATUS.CREATED,
        );
    } catch (error) {
        console.error('Error creating pharmacy order:', error);
        return jsonResponse(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
        );
    }
}
