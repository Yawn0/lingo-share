import http, {IncomingMessage, ServerResponse } from 'http';
import { checkDBConnection } from './db';
import { registerUser } from './services/userService';
import { ERROR_MESSAGE } from './services/Utility/util';

const PORT = 3000;
const STATUS = {
    OK: 'OK',
}
const ERROR = {
    internal_server_error: 'Internal Server Error'
}

const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*'); //allow react to connect

    const { method, url } = req;

    console.log(`[${method}] ${url}`);

    try{
        if(url === 'api/translate' && method === 'POST'){
            const body = await parseBody(req);

            const responseData = {
                message: 'Data received!',
                received: body
            };

            res.writeHead(200);
            res.end(JSON.stringify(responseData));
        }
        else if (url === '/api/register' && method === 'POST'){
            try {
                const body = await parseBody(req);
                const newUser = await registerUser(body.email, body.password);
    
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    status: STATUS.OK,
                    message: "User created", 
                    user: newUser 
                }))
            } catch (error: any) {
                if (error.message === ERROR_MESSAGE.user_exists) {
                    res.writeHead(409); // Conflict
                    res.end(JSON.stringify({ error: error.message }));
                } else if (error.message === ERROR_MESSAGE.mail_or_pass_missing) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: error.message }));
                } else {
                    console.error(error);
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: ERROR.internal_server_error }));
                }               
            }
        }
        else if(url === '/health' && method === 'GET'){
            res.writeHead(200);
            res.end(JSON.stringify({status: STATUS.OK}));
        }
        else if(url === '/dbhealth' && method === 'GET'){
            if(await checkDBConnection()){
                res.writeHead(200);
                res.end(JSON.stringify({status: STATUS.OK}));
            } 
            else{
                throw Error('Database error');
            }
        }
        else{
            res.writeHead(404);
            res.end(JSON.stringify({error: 'Route not found'}));
        }
    }
    catch(error){
        console.error(error);
        res.writeHead(500);
        res.end(JSON.stringify({error: ERROR.internal_server_error}));
    }
});

server.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);

    await checkDBConnection();
});

async function parseBody(req: IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {

        let body = '';
        const MAXSIZE = 1024 * 1024 * 1;
        const exceedsMaxSize = (str: string) => Buffer.byteLength(str, 'utf-8') > MAXSIZE;

        req.setEncoding('utf-8');

        req.on('data', (chunk) => {
            
            if(exceedsMaxSize(body + chunk)){
                req.destroy();
                reject(new Error('PayloadToolarge'));
                return;
            }
            
            body += chunk;
        });

        req.once('end', () => {

            if(!body){
                resolve({});
                return;
            }

            try{
                const bodyParsed = JSON.parse(body)
                resolve(bodyParsed);
            }
            catch(error){
                console.error(error);
                reject(new Error('Error parsing body'));
            }
        });

        req.on('error', (error) => {
            console.error(error);
            reject(error)
        })
    })
} 