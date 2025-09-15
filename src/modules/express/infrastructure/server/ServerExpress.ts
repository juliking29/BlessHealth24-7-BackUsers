import express, { Application } from 'express';
import ExpressProvider from '../provider/ExpressProvider';
import RouterExpressInterface from '../../domain/RouterExpressInterface';
import ErrorRouterExpressInterface from '../error/router/ErrorExpressRouter';
import * as https from 'https';
import * as fs from 'fs';
import RelationalDataBase from '../../../relational-database/infrastructure/mysql/RelationalDataBase';
import cors from 'cors';

/**
 * Server class responsible for configuring and starting the Express application.
 * It handles routes, middleware configuration, database initialization, and server startup.
 */
export default class Server {
    private readonly app: Application;

    /**
     * Initializes the server with the provided routes and error handler.
     * 
     * @param {RouterExpressInterface[]} routesExpress - Array of route handlers to be registered.
     * @param {ErrorRouterExpressInterface} error - Error handler for managing application errors.
     */
    constructor(
        private readonly routesExpress: RouterExpressInterface[],
        private readonly error: ErrorRouterExpressInterface
    ) {
        this.app = express();
        this.configure();
        this.routes();
    }

    /**
     * Configures the application middleware.
     * Sets up JSON parsing and URL-encoded data parsing for incoming requests.
     */
    public configure() {
  // CORS para producción (y localhost en dev)
  const allowedOrigins = [
    'https://blesshealth247-backgestionusuarios.westus3.cloudapp.azure.com',
    'http://localhost:3000', // opcional: si tienes front en local
    'http://localhost:5173'  // opcional: Vite u otro puerto local
  ];

  this.app.use(cors({
    origin: (origin, callback) => {
      // Permite herramientas sin origin (curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: Origin no permitido -> ${origin}`));
    },
    credentials: true,
    methods: ['GET','POST','DELETE','PATCH','HEAD','PUT','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','X-Requested-With','Accept','Origin']
  }));

  this.app.use(express.json());
  this.app.use(express.urlencoded({ extended: true }));
  this.app.use('/images', express.static('/public/images'));

  // Endpoint de healthcheck (opcional pero recomendado)
  this.app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
}

    /**
     * Registers all routes and the error handler in the application.
     * Iterates through the provided routes and attaches them to the Express app.
     */
    public routes() {
        const API_BASE = '/api'

        this.routesExpress.forEach((route) => {
            console.log('[ROUTE MOUNT]', API_BASE + route.path)
            this.app.use(API_BASE + route.path, route.router)
        })

        console.log('[ERROR ROUTER MOUNT]', API_BASE + this.error.path)
        this.app.use(API_BASE + this.error.path, this.error.router)
    }

    /**
     * Initializes the relational database connection.
     * Logs the status of the database connection and exits the process if an error occurs.
     */
    public async initDB() {
        try {
        console.log("Initializing the database...");
        RelationalDataBase.getInstance(); 
        console.log("Database is ready.");
        } catch (error) {
        console.error("Error connecting to the database:", error);
        process.exit(1); // Exit the process if the database connection fails
        }
    }

    /**
     * Starts the server on the specified host, port, and protocol.
     * Supports both HTTP and HTTPS protocols based on the configuration.
     */
    public start() {
  const HOST = ExpressProvider.getHost();
  const PORT = ExpressProvider.getPort();
  const PROTOCOL = ExpressProvider.getProtocol();

  this.app.set('trust proxy', 1);

  const keyPath = ExpressProvider.getCertKey();
  const certPath = ExpressProvider.getCertPem();

  const canTryHttps =
    PROTOCOL === 'https' &&
    typeof keyPath === 'string' &&
    keyPath.length > 0 &&
    typeof certPath === 'string' &&
    certPath.length > 0 &&
    fs.existsSync(keyPath) &&
    fs.existsSync(certPath);

  if (canTryHttps) {
    try {
      const options = { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) };
      https.createServer(options, this.app).listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on https://${HOST}:${PORT}`);
      });
      return;
    } catch (e) {
      console.error('[SERVER] Failed to start HTTPS, falling back to HTTP:', e);
    }
  } else if (PROTOCOL === 'https') {
    console.warn('[SERVER] PROTOCOL=https pero faltan certificados válidos. Usando HTTP como respaldo.');
  }

  // Fallback HTTP
  this.app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
  });
}
}