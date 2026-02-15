import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import { query } from "../db";


const scryptAsync = promisify(scrypt);

export const registerUser = async (email: string, passwordPlain: string) => {

    if(!email || !passwordPlain) throw Error('Email or password missing');

    const existing = await query('select id from users where email = $1', [email]);

    if(existing.rowCount && existing.rowCount > 0) throw Error('User already exists');

    const salt = randomBytes(16).toString();
    const derivedHash = await scryptAsync(passwordPlain, salt, 64) as Buffer;
    const res = await query(
        'insert into users (email, password_hash) values ($1, $2) returning id, email, created_at',
        [email, derivedHash]
    )

    return res.rows[0];
}