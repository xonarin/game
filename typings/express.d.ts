import 'express-serve-static-core';
// eslint-disable-next-line import/order
import { Server as HttpServer } from 'http';

declare module 'express-serve-static-core' {
    // @ts-ignore
    import { Express } from 'express';

    interface Application {
        // RSK uses an internal function "handle" in start.ts.
        handle(req: Request, res: Response): Express;

        // Application server instance
        server: HttpServer;
    }
}

declare global {
    namespace Express {
        // For use of passport
        interface User {
            id: string;
        }
        interface AuthInfo {
            isRegistered: boolean;
        }
    }
}
