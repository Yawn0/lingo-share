import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import { query } from "../db";
import { QueryFunction, isEmail, ERROR_MESSAGE } from "./Utility/util";

const scryptAsync = promisify(scrypt);

export const registerUser = async (
    email: string, 
    passwordPlain: string, 
    dbQuery: QueryFunction = query
) => {
    //1 - validate
    if(!email || !passwordPlain) throw Error(ERROR_MESSAGE.mail_or_pass_missing);
    if(!isEmail(email)) throw Error(ERROR_MESSAGE.invalid_mail);
    if(passwordPlain.length < 6) throw Error(ERROR_MESSAGE.pass_length);

    //2 - check if exists
    const existing = await dbQuery('select id from users where email = $1', [email]);
    if(existing.rowCount && existing.rowCount > 0) throw Error(ERROR_MESSAGE.user_exists);

    //3 - hash password
    const salt = randomBytes(16).toString();
    const derivedKey = await scryptAsync(passwordPlain, salt, 64) as Buffer;
    const passwordhash = `${salt}:${derivedKey.toString('hex')}`;

    //4 - insert new user info
    const result = await dbQuery(
        'insert into users (email, password_hash) values ($1, $2) returning id, email, created_at',
        [email, passwordhash]
    )

    return result.rows[0];
}
