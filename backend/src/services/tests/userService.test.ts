import { registerUser } from "../userService";
import { ERROR_MESSAGE } from "../Utility/util";

const mockDbResponse = (rows: any[]) => Promise.resolve({ rowCount: rows.length, rows})
.catch(error => console.error('Mock DB Error:', error));

const email = "test@example.com";
const password = "securePassword123";

describe('userService: RegisterUser', () => {
    it('should register a new user', async () => {
        // mock the db function
        // expecting 2 calls : 
        // 1. select (check existing) => return empty array 
        // 2. insert (save user info) => return the new user info
        const mockDbQuery = jest.fn().mockImplementation(
            async (text: string, params: any[]) => {
                if(text.includes('select id from users')) return mockDbResponse([]); // no user found
                if(text.includes('insert into users')) return mockDbResponse([{id: 1, email: email, created_at: new Date()}]);

                throw Error('Unexpected query');
            }
        );

        const result = await registerUser(email, password, mockDbQuery);
        
        expect(result.email).toBe(email);
        expect(result.id).toBe(1);
        expect(mockDbQuery).toHaveBeenCalledTimes(2);
        expect(mockDbQuery).toHaveBeenNthCalledWith(
            1,
            'select id from users where email = $1',
            [email]
        );
    });

    it('should throw if user already exists', async () => {
        const mockDbQuery = jest.fn().mockResolvedValue(mockDbResponse([{ id: 1 }]));
        await expect(registerUser(email, password, mockDbQuery)).rejects.toThrow(ERROR_MESSAGE.user_exists);
    });

    it('should throw on failed validation', async () => {

        const fakeDb = async () => null;

        await expect(registerUser(email, '12345', fakeDb)).rejects.toThrow(ERROR_MESSAGE.pass_length);
        await expect(registerUser(email, '', fakeDb)).rejects.toThrow(ERROR_MESSAGE.mail_or_pass_missing);
        await expect(registerUser('', password, fakeDb)).rejects.toThrow(ERROR_MESSAGE.mail_or_pass_missing);
        await expect(registerUser('asd@example..come', password, fakeDb)).rejects.toThrow(ERROR_MESSAGE.invalid_mail);
        await expect(registerUser('invalid-email', password, fakeDb)).rejects.toThrow(ERROR_MESSAGE.invalid_mail);
        await expect(registerUser('@example.com', password, fakeDb)).rejects.toThrow(ERROR_MESSAGE.invalid_mail);
        await expect(registerUser('asd@example', password, fakeDb)).rejects.toThrow(ERROR_MESSAGE.invalid_mail);
        await expect(registerUser('asd@', password, fakeDb)).rejects.toThrow(ERROR_MESSAGE.invalid_mail);
    });
});
