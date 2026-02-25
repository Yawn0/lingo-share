import { useState} from "react";
import { registerUser, type UserRegistrationResponse } from "../services/api";

type UserRegistrationFormProps = {
    setLoggedInUserId: (userId: number | null) => void;
};

export default function UserRegistrationForm(props: UserRegistrationFormProps) {

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<Error | null>(null);
    const [response, setResponse] = useState<UserRegistrationResponse | null>(null);

    async function handleFormSubmit(e: React.SubmitEvent<HTMLFormElement>){
        e.preventDefault();
        
        try{
            setError(null);
            const response: UserRegistrationResponse = await registerUser(email, password);
            setResponse(response);
            props.setLoggedInUserId(response.user?.id ?? null);
        }
        catch (error) {
            setResponse(null);
            setError(error instanceof Error ? error : new Error(String(error)));
        }
    };


    return (
        <form onSubmit={handleFormSubmit}>
            <h2>Registration form</h2>
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