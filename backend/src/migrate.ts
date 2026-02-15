import fs from 'fs';
import path from 'path';
import { query, pool } from './db';

const runMigration = async () => {
    try{
        const sqlPath = path.join(__dirname, 'migration', 'init.sql');
        const sql = fs.readFileSync(sqlPath, 'utf-8');

        console.log('Running migration...');

        await query(sql);

        console.log('Migration successful');

        await pool.end();
    }
    catch(error){
        console.error('Migration failed: ', error);
        process.exit(1);
    }
}

runMigration();