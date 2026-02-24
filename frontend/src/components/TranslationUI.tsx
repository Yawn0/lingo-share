import { useState } from "react"
import { translateText, type TranslationRequest, type TranslationResponse } from "../services/api";

type TranslationUIProps = {
    userId: number
}

export default function TranslationUI(props: TranslationUIProps){
    const [text, setText] = useState<string>('');
    const [translatedText, setTranslatedText] = useState<string>('');
    const [sourceLangId, setSourceLangId] = useState<number>(1);
    const [targetLangId, setTargetLangId] = useState<number>(2);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const request: TranslationRequest = {
        userId: props.userId, 
        text: text, 
        sourceLangId: sourceLangId, 
        targetLangId: targetLangId
    }

    async function handleFormSubmit(e: React.SubmitEvent<HTMLFormElement>){
        e.preventDefault();

        try{
            setError(null)

            if(!(request.text.trim())){
                setTranslatedText('')
                return;
            }

            setIsLoading(true)
            const result: TranslationResponse = await translateText(request);

            if(result.translatedText){
                setTranslatedText(result.translatedText)
            }
        }
        catch(error){
            setError(error instanceof Error ? error : new Error(String(error)));
        }
        finally{
            setIsLoading(false)
        }
    }
    
    return(
        <>
            <form onSubmit={handleFormSubmit}>
                {error && <p style = {{color:'red'}}>{error.message}</p>}
                <textarea
                    value={text}
                    aria-label = "Text to translate"
                    placeholder = "Enter text to translate"
                    onChange = {(e) => setText(e.target.value)}
                ></textarea>
                <select title="Select source language"
                    value = {sourceLangId}
                    onChange = {(e) => setSourceLangId(Number(e.target.value))}>
                    <option value={1}>English</option>
                    <option value={2}>Spanish</option>
                    <option value={3}>French</option>
                    <option value={4}>German</option>
                </select>
                <select title="Select target language"
                    value = {targetLangId}
                    onChange = {(e) => setTargetLangId(Number(e.target.value))}>
                    <option value={1}>English</option>
                    <option value={2}>Spanish</option>
                    <option value={3}>French</option>
                    <option value={4}>German</option>
                </select>

                <button type="submit" disabled={isLoading}>Translate</button>
            </form>
            <p style={{color:'green'}}>{translatedText}</p>
        </>
    )
}