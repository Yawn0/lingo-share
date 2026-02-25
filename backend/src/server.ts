import http, {IncomingMessage, ServerResponse } from 'http';
import { checkDBConnection } from './db';
import { authenticateUser, registerUser } from './services/userService';
import { ERROR_MESSAGE } from './services/Utility/util';
import { translateText, TranslationResponse, TranslationRequest, getTranslationsByUserId } from './services/translationService'

const PORT = 3000;
const STATUS = {
    OK: 'OK',
}
const ERROR = {
    internal_server_error: 'Internal Server Error',
    payload_too_large: 'Payload Too Large'
}

const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*'); //allow react to connect
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    const { method, url } = req;

    if (method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    console.log(`[${method}] ${url}`);

    try{
        if(url === '/api/translate' && method === 'POST'){
            await translateEndpoint(req, res);
        }
        else if (url === '/api/register' && method === 'POST'){
            await registerEndpoint(req, res);
        }
        else if (url === '/api/login' && method === 'POST'){
            await loginEndPoint(req, res);
        }
        else if (url && url.startsWith('/api/history') && method === 'GET'){
            await historyEndpoint(req, res, url);            
        }
        else if(url === '/health' && method === 'GET'){
            res.writeHead(200);
            res.end(JSON.stringify({ status: STATUS.OK }));
        }
        else if(url === '/dbhealth' && method === 'GET'){
            if(await checkDBConnection()){
                res.writeHead(200);
                res.end(JSON.stringify({ status: STATUS.OK }));
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

        if (error instanceof Error && error.message === ERROR.payload_too_large) {
            res.writeHead(413);
            res.end(JSON.stringify({error: error.message}));
            return;
        }

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
                reject(new Error(ERROR.payload_too_large));
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

async function historyEndpoint(req: IncomingMessage, res: ServerResponse<http.IncomingMessage>, url: string){
    
    try{
        const parsedUrl = new URL(url, `http://${req.headers.host}`);
        const userId = parsedUrl.searchParams.get('userId');

        const responseData = await getTranslationsByUserId(Number(userId))

        console.log(responseData)

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(responseData))
    }catch(error){
        console.error(error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: ERROR.internal_server_error }));
    }
}

async function loginEndPoint(req: IncomingMessage, res: ServerResponse<http.IncomingMessage>){
    try {
        const body = await parseBody(req);
        const user = await authenticateUser(body.email, body.password);

        const responseData = { 
            id: user.id,
            email: user.email
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(responseData))
    } catch (error: any) {
        if (error.message === ERROR_MESSAGE.mail_or_pass_invalid){
            res.writeHead(401);
            res.end(JSON.stringify({ error: error.message }));
        } else {
            console.error(error);
            res.writeHead(500);
            res.end(JSON.stringify({ error: ERROR.internal_server_error }));
        }               
    }
}

async function registerEndpoint(req: IncomingMessage, res: ServerResponse<http.IncomingMessage>){
    try {
        const body = await parseBody(req);
        const newUser = await registerUser(body.email, body.password);

        const responseData = { 
            message: "User created", 
            user: newUser 
        };

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(responseData))
    } catch (error: any) {
        if (error.message === ERROR_MESSAGE.user_exists) {
            res.writeHead(409); // Conflict
            res.end(JSON.stringify({ error: error.message }));
        } else if (
            error.message === ERROR_MESSAGE.mail_or_pass_missing ||
            error.message === ERROR_MESSAGE.invalid_mail ||
            error.message === ERROR_MESSAGE.pass_length
        ) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: error.message }));
        } else {
            console.error(error);
            res.writeHead(500);
            res.end(JSON.stringify({ error: ERROR.internal_server_error }));
        }               
    }
}

async function translateEndpoint(req: IncomingMessage, res: ServerResponse<http.IncomingMessage>){
    const body = await parseBody(req);

    console.log(body)

    if(!body.userId 
        || !body.sourceLangId
        || !body.targetLangId
    ){
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid input' }));
        return;
    }

    const request = {
        userId: body.userId,
        text: body.text,
        sourceLangId: body.sourceLangId,
        targetLangId: body.targetLangId
    } as TranslationRequest;

    const response: TranslationResponse | null = await translateText(request);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
}