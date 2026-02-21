import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ERROR_MESSAGE, registerUser } from "../userService";

const mockDbResponse = async (rows: any[]) => Promise.resolve({ rowCount: rows.length, rows})
.catch(error => console.error('Mock DB Error:', error));

const email = "test@example.com";
const password = "securePassword123";

describe('userService: RegisterUser', () => {
    it('should register a new user', async () => {

        // mock the db function
        // expecting 2 calls : 
        // 1. select (check existing) => return empty array 
        // 2. insert (save user info) => return the new user info

        let callCount = 0;

        const fakeDb = (text: string, params?: any[]) => {
            callCount++;

            if(text.includes('select id from users')) return mockDbResponse([]); // no user found
            if(text.includes('insert into users')) return mockDbResponse([{id: 1, email: email, created_at: new Date()}]);

            throw Error('Unexpected query');
        };

        const result = await registerUser(email, password, fakeDb);
        
        assert.equal(result.email, email);
        assert.equal(result.id, 1);
        assert.equal(callCount, 2, 'Db should be called exactly twice');
    });

    it('should throw if user already exists', async () => {
        // mock the db function
        // expecting 1 call : 
        // 1. select (check existing) => return the existing user info
        const fakeDb = (text: string, params?: any[]) => {
            if(text.includes('select id from users')){
                return mockDbResponse([{id: 1, email: email, created_at: new Date()}]); // user found
            }

            throw Error('Unexpected query');
        };

        await assert.rejects(async () => registerUser(email, password, fakeDb), { message: ERROR_MESSAGE.user_exists });
    });

    it('should throw on failed validation', async () => {

        const fakeDb = async () => null;

        await assert.rejects(async () => registerUser(email, '12345', fakeDb), { message: ERROR_MESSAGE.pass_length });
        await assert.rejects(async () => registerUser(email, '', fakeDb), { message: ERROR_MESSAGE.mail_or_pass_missing });
        await assert.rejects(async () => registerUser('', password, fakeDb), { message: ERROR_MESSAGE.mail_or_pass_missing });
        await assert.rejects(async () => registerUser('asd@example..come', password, fakeDb), { message: ERROR_MESSAGE.invalid_mail });
        await assert.rejects(async () => registerUser('invalid-email', password, fakeDb), { message: ERROR_MESSAGE.invalid_mail });
        await assert.rejects(async () => registerUser('@example.com', password, fakeDb), { message: ERROR_MESSAGE.invalid_mail });
        await assert.rejects(async () => registerUser('asd@example', password, fakeDb), { message: ERROR_MESSAGE.invalid_mail });
        await assert.rejects(async () => registerUser('asd@', password, fakeDb), { message: ERROR_MESSAGE.invalid_mail });
    });
});