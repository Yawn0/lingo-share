const BASE_URL = 'http://localhost:3000/api';
const ENDPOINT = {
    registerUser: '/register'
}

export type RegisterResponse = {
    status?: string,
    message?: string,
    user?: Record<string, unknown>,
    error?: string
}

export async function registerUser(email: string, password: string){
    const res = await fetch(`${BASE_URL}${ENDPOINT.registerUser}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const response: RegisterResponse = await res.json();

    if( !res.ok){
        throw new Error(response.error ?? 'Error calling endpoint: ' + ENDPOINT.registerUser)
    }
    
    return response;
}