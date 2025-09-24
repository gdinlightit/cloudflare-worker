export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    INTERNAL_SERVER_ERROR: 500,
} as const satisfies Record<string, number>;
type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

export const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

export const jsonResponse = (body: object | null, status: HttpStatus = HTTP_STATUS.OK): Response => {
    if (body === null) {
        return new Response(null, {
            status,
            headers: CORS_HEADERS,
        });
    }

    return new Response(JSON.stringify(body), {
        status,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
};

export const addHeaders = (extraHeaders: Record<string, string>, response: Response): Response => {
    const headers = new Headers(response.headers);
    Object.entries(extraHeaders).forEach(([key, value]) => {
        headers.set(key, value);
    });
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });
};
