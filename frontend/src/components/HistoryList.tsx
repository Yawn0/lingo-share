import { useEffect, useState } from "react";
import { getHistoryData, type UserTranslationObjectResponse } from "../services/api";

type HistoryListProps = { userId: number };

export default function HistoryList(props: HistoryListProps){
    
    const [history, setHistory] = useState<UserTranslationObjectResponse | null>({ translations: []});
    
    useEffect(() => {
        async function fetchHistory(){
            const historyData = await getHistoryData(props.userId)
            setHistory(historyData)
        }
        fetchHistory();
        
    },[props.userId])

    return(
        <ul>
            {history && history.translations.map(([originalText, translatedText], index) => (
                <li key={`${index}-${originalText}`}>
                    {originalText} {' -> '} {translatedText}
                </li>
            ))}
        </ul>
    )
}