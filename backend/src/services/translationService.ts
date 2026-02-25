import { query } from "../db";
import { ERROR_MESSAGE, QueryFunction } from "./Utility/util";

const mockExternalTranslationAPI = async (text: string): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(text.split('').reverse().join(''))
        }, 1000)
    })
}

export type TranslationResponse = {
    translatedText: string,
    id: number
}

export type TranslationRequest = {
    userId: number, 
    text: string, 
    sourceLangId: number, 
    targetLangId: number
}

export type UserTranslationObject = {
    translations: [string, string][]
}

export async function translateText(
    request: TranslationRequest,
    dbQuery: QueryFunction = query): Promise<TranslationResponse | null>{

    if(!(request.text?.trim())) return null;

    const translatedText: string = await mockExternalTranslationAPI(request.text);
    
    const queryText = `
        insert into translations (
            user_id,
            source_lang_id,
            target_lang_id,
            original_text,
            translated_text
        ) values ($1, $2, $3, $4, $5)
        returning id
    `;

    try{
        const result = await dbQuery(
            queryText, 
            [request.userId, request.sourceLangId, request.targetLangId, request.text, translatedText]
        );

        const id = result?.rows?.[0]?.id;
        if(!id) return null;

        return { translatedText: translatedText, id: id };
    } catch{
        return null;
    }
}

export async function getTranslationsByUserId(
    userId: number,
    dbQuery: QueryFunction = query){

    if(!userId) return null;
    
    const queryText = `
        SELECT original_text, translated_text 
        FROM translations 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT 10
    `;
    
    const response: UserTranslationObject = { translations: [] };

    try{
        const result = await dbQuery(
            queryText, 
            [userId]
        );

        const translations = result?.rows ?? [];

        translations.forEach((element: { original_text: string, translated_text: string }) => {
            response.translations.push([element.original_text, element.translated_text]);
        });

        return response;
    } catch(error){
        console.error(error)
        throw new Error(ERROR_MESSAGE.error_getting_history);
    }
}
