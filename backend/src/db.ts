import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'lingoshare',
  password: process.env.DB_PASSWORD || 'password123',
  port: 5432,
  max: 10, // Max number of clients in the pool
  idleTimeoutMillis: 30000 // Close clients after 30 seconds of inactivity
});

export const query = async (query: string, params?: any[]) => {
    const start = Date.now();

    try{
        const res: QueryResult<any> = await pool.query(query, params);
        const duration = Date.now() - start;

        console.log('executed query', { query, duration, rows: res.rowCount });

        return res;
    }
    catch(error){
        console.error('Database Errror: ', error);
        throw error;
    }
}

export const checkDBConnection = async () => {
    try{
        const res = await pool.query('SELECT NOW()');
        console.log('Database connected: ', res.rows[0]);
    }
    catch(error){
        console.error('Database connection failed', error);
        process.exit(1);// Kill server if DB is down
    }
}
