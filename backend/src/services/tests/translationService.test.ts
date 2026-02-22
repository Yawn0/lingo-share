import { translateText, TranslationRequest } from "../translationService";

const request: TranslationRequest = {
    userId: 1, 
    text: 'Text', 
    sourceLangId: 1, 
    targetlangId: 1
}

const mockDbQuery = jest.fn().mockImplementation(
    async (text: string, params: any[]) => {
        return { id: 1 };   
    }
)

describe('translationService: translateText', () => {
    it('should translate text correctly', async () => {
        const result = await translateText(request, mockDbQuery);
        expect(result).toEqual({ id: 1 });
        expect(mockDbQuery).toHaveBeenCalledTimes(1);
        expect(mockDbQuery).toHaveBeenCalledWith(
            expect.stringContaining('insert into translations'),
            expect.arrayContaining([
                request.userId,
                request.sourceLangId,
                request.targetlangId,
                request.text,
                expect.stringContaining(request.text)
            ])
        )
    })
    it('should return null if text is empty', async () => {
        const result = await translateText({ ...request, text: '' }, mockDbQuery);
        expect(result).toBeNull();
        expect(mockDbQuery).toHaveBeenCalledTimes(0);
    })
    it('should return null if db query throws error', async () => {
        mockDbQuery.mockImplementationOnce(
            async (text: string, params: any[]) => {
                throw new Error('DB Error');
            }
        )
        const result = await translateText(request, mockDbQuery);
        expect(result).toBeNull();
        expect(mockDbQuery).toHaveBeenCalledTimes(1);
    })
})