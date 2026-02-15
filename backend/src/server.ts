import http, {IncomingMessage, ServerResponse } from 'http';
import { checkDBConnection } from './db';
import { registerUser } from './services/userService';

const PORT = 3000;
const status = {
    OK: 'OK',
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
                    status: status.OK,
                    message: "User created", 
                    user: newUser 
                }))
            } catch (error: any) {
                if (error.message === 'User already exists') {
                    res.writeHead(409); // Conflict
                    res.end(JSON.stringify({ error: error.message }));
                } else if (error.message === 'Missing email or password') {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: error.message }));
                } else {
                    console.error(error);
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                }               
            }
        }
        else if(url === '/health' && method === 'GET'){
            res.writeHead(200);
            res.end(JSON.stringify({status: status.OK}));
        }
        else{
            res.writeHead(404);
            res.end(JSON.stringify({error: 'Route not found'}));
        }
    }
    catch(error){
        console.error(error);
        res.writeHead(500);
        res.end(JSON.stringify({error: 'Internal Server Error'}));
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