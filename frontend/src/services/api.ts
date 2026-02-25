const BASE_URL = 'http://localhost:3000/api';
const ENDPOINT = {
    registerUser: '/register',
    translateText: '/translate',
    login: '/login',
    getHistoryData: '/history',
}

export type UserRegistrationResponse = {
    message?: string,
    user?: {
        id: number,
        email: string,
        created_at: string
    },
    error?: string
}

export type TranslationRequest = {
    userId: number, 
    text: string, 
    sourceLangId: number, 
    targetLangId: number
}

export type TranslationResponse = {
    id?: number,
    translatedText?: string,
    sourceLangId?: number, 
    targetLangId?: number,
    error?: string
}

export type UserTranslationObjectResponse = {
    translations: [string,string][];
}

// async function apiCall<TRequest, TResponse>
//     (endpoint:string, request: TRequest, method: string): Promise<TResponse>{
//     const res = await fetch(`${BASE_URL}${endpoint}`, {
//         method,
//         headers: {'Content-Type': 'application/json'},
//         body: JSON.stringify(request)
//     })

//     const response: TResponse = await res.json();
    
//     return response;
// }

export async function registerUser(email: string, password: string){
    const res = await fetch(`${BASE_URL}${ENDPOINT.registerUser}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const response: UserRegistrationResponse = await res.json();

    if(!res.ok){
        throw new Error(response.error ?? `Error calling ${ENDPOINT.registerUser}`)
    }
    
    return response;
}

export async function translateText(request: TranslationRequest){
    const res = await fetch(`${BASE_URL}${ENDPOINT.translateText}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(request)
    })

    const response : TranslationResponse = await res.json();
    console.log(response)

    if(!res.ok){
        throw Error(response.error ?? `Error calling ${ENDPOINT.translateText}`)
    }

    return response;
}

export async function login(email: string, password: string){

    const request = { email, password }

    const res = await fetch(`${BASE_URL}${ENDPOINT.login}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(request)
    })

    const response = await res.json();
    console.log(response)

    if(!res.ok){
        throw Error(response.error ?? `Error calling ${ENDPOINT.login}`)
    }

    return response.id;
}

export async function getHistoryData(userId: number){
    const res = await fetch(`${BASE_URL}${ENDPOINT.getHistoryData}?userId=${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'}
    })
    
    if(!res.ok){
        return null;
    }

    const response: UserTranslationObjectResponse = await res.json();
    console.log(response)

    return response;
}