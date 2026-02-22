import { query } from "../db";
import { QueryFunction } from "./Utility/util";

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
    targetlangId: number
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

    const result = await dbQuery(
        queryText, 
        [request.userId, request.sourceLangId, request.targetlangId, request.text, translatedText]
    );

    return { translatedText: translatedText, id: result.rows[0].id };
}