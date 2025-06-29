import express, { type Request, Response, NextFunction } from "express";
import { registerOSINTRoutes } from "./osint-routes";
import { log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Basic auth middleware only for sensitive OSINT API endpoints
app.use('/api/lookup', (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  
  if (!auth || !auth.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Footprint-X"');
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const credentials = Buffer.from(auth.slice(6), 'base64').toString();
  const [username, password] = credentials.split(':');
  
  if (username !== 'admin' || password !== 'admin123') {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  next();
});

app.use('/api/stream/*', (req: Request, res: Response, next: NextFunction) => {
  // Allow SSE streams without auth for better UX
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerOSINTRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 3000;
  server.listen(port, "127.0.0.1", () => {
    log(`Footprint-X OSINT Terminal serving on port ${port}`);
    log(`Access the hacker terminal at: http://localhost:${port}`);
    log(`Login credentials: admin / admin123`);
  });

  //const port = 3000;
  // server.listen({
  //   port,
  //   host: "127.0.0.1",
  //   reusePort: true,
  // }, () => {
  //   log(`Footprint-X OSINT Terminal serving on port ${port}`);
  //   log(`Access the hacker terminal at: http://localhost:${port}`);
  //   log(`Login credentials: admin / admin123`);
  // });
})();
