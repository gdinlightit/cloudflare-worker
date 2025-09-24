/**
 * HealthWarehouse Integration Worker
 *
 * This worker handles pharmacy orders integration with HealthWarehouse API
 */
import { createOrderController } from './routes/create-order';
import { addHeaders, CORS_HEADERS, HTTP_STATUS, jsonResponse } from './utils/response';

export const ROUTES = {
    ORDER: '/create-order',
    HEALTH: '/health',
} as const;

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);

        // CORS preflight
        if (request.method === 'OPTIONS') {
            return jsonResponse(null, HTTP_STATUS.NO_CONTENT);
        }

        try {
            switch (url.pathname) {
                case ROUTES.ORDER:
                    if (request.method !== 'POST') {
                        return jsonResponse({ error: 'Method not allowed' }, HTTP_STATUS.METHOD_NOT_ALLOWED);
                    }

                    return addHeaders(CORS_HEADERS, await createOrderController(request, env));

                case ROUTES.HEALTH:
                    return jsonResponse({
                        status: 'healthy',
                        timestamp: new Date().toISOString(),
                    });

                default:
                    return jsonResponse({ error: 'Not Found' }, HTTP_STATUS.NOT_FOUND);
            }
        } catch (error) {
            console.error('Worker error:', error);
            return jsonResponse(
                {
                    error: 'Internal Server Error',
                    message: error instanceof Error ? error.message : 'Unknown error',
                },
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    },
} satisfies ExportedHandler<Env>;
