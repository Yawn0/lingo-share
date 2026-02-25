import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { query } from "../db";
import { QueryFunction, isEmail, ERROR_MESSAGE } from "./Utility/util";

const PASSWORD_MIN_LENGTH = 6;
const HASH_ENCODING = 'hex';

const deriveBufferFromHashedString = (hashString: string) => Buffer.from(hashString, HASH_ENCODING);
const scryptAsync = promisify(scrypt);

type SaltPasswordHashCombo = {
    salt: string,
    hashBuffer: Buffer
    encodedHash: string,
}

async function hashPassword(passwordPlain: string, salt: string | null = null): Promise<SaltPasswordHashCombo>{
    salt = salt ?? randomBytes(16).toString();
    const hashBuffer = await scryptAsync(passwordPlain, salt, 64) as Buffer;
    const encodedHash = hashBuffer.toString(HASH_ENCODING);
    return { salt, hashBuffer, encodedHash }
}

export async function registerUser(
    email: string, 
    passwordPlain: string, 
    dbQuery: QueryFunction = query
) {
    if(!email || !passwordPlain) throw Error(ERROR_MESSAGE.mail_or_pass_missing);
    if(!isEmail(email)) throw Error(ERROR_MESSAGE.invalid_mail);
    if(passwordPlain.length < PASSWORD_MIN_LENGTH) throw Error(ERROR_MESSAGE.pass_length);

    const existing = await dbQuery('select id from users where email = $1', [email]);
    if(existing.rowCount && existing.rowCount > 0) throw Error(ERROR_MESSAGE.user_exists);

    const saltPassHashCombo = await hashPassword(passwordPlain);
    const saltPasswordHashString = `${saltPassHashCombo.salt}:${saltPassHashCombo.encodedHash}`;

    const result = await dbQuery(
        'insert into users (email, password_hash) values ($1, $2) returning id, email, created_at',
        [email, saltPasswordHashString]
    )

    return result.rows[0];
}

export async function authenticateUser(
    email: string, 
    passwordPlain: string, 
    dbQuery: QueryFunction = query
){
    const userResult = await dbQuery('select id, password_hash from users where email = $1', [email]);

    if(!userResult.rowCount || userResult.rowCount <= 0){
        throw new Error(ERROR_MESSAGE.mail_or_pass_invalid);
    }

    const userId = userResult.rows[0].id
    const [salt, password_hash] = userResult.rows[0].password_hash.split(':');
    const saltPassHashCombo = await hashPassword(passwordPlain, salt);
    const hashBuffer = deriveBufferFromHashedString(password_hash);
    const isValid = timingSafeEqual(hashBuffer, saltPassHashCombo.hashBuffer);

    if(!isValid){
        throw new Error(ERROR_MESSAGE.mail_or_pass_invalid);
    }

    return { id: userId, email };
}