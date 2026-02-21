import { query } from "../db";
import { QueryFunction } from "./Utility/util";

const mockExternalTranslationAPI = async (text: string): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(text.split('').reverse().join(''))
        }, 1000)
    })
}

function translateText(
    userId: number, 
    text: string, 
    sourceLangId: number, 
    targetlangId: number, 
    dbQuery: QueryFunction = query){

    // 1. Validate inputs (Don't translate empty strings)

    // 2. Call the external translation API (use the mock above, or native fetch)

    // 3. Save the result to the db 'translations' table

    // 4. Return an object containing the original text, the translation, and the DB id.
}