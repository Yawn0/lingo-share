import { useState } from "react";
import { registerUser, type RegisterResponse } from "../services/api";

export default function RegisterForm() {

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<Error | null>(null);
    const [response, setResponse] = useState<RegisterResponse | null>(null);

    async function handleFormSubmit(e: React.SubmitEvent<HTMLFormElement>){
        e.preventDefault();
        
        try{
            setError(null);
            setResponse(await registerUser(email, password));
        }
        catch (error) {
            setResponse(null);
            console.error(error);
            setError(error instanceof Error ? error : new Error(String(error)));
        }
    };

    return (
        <form onSubmit={handleFormSubmit}>
            {response && <p style={{color: 'green'}}>{response.message}</p>}
            <input
            type='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />
            <input
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            />
            <button type="submit">Register</button>
            {error && <p style={{color: 'red'}}>{error.message}</p>}
        </form>
    );
}