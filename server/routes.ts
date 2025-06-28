import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertProjectSchema, insertFileSchema, insertExecutionSessionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time terminal streaming
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // WebSocket connection management
  const terminalConnections = new Map<number, Set<WebSocket>>();

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const projectId = parseInt(url.searchParams.get('projectId') || '0');

    if (projectId > 0) {
      if (!terminalConnections.has(projectId)) {
        terminalConnections.set(projectId, new Set());
      }
      terminalConnections.get(projectId)!.add(ws);

      ws.on('close', () => {
        const connections = terminalConnections.get(projectId);
        if (connections) {
          connections.delete(ws);
          if (connections.size === 0) {
            terminalConnections.delete(projectId);
          }
        }
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'output',
        data: '\x1b[32mHackerIDE Terminal v2.1.0 - Connected\x1b[0m\r\n'
      }));
    }
  });

  // Helper function to broadcast to terminal connections
  function broadcastToTerminal(projectId: number, message: any) {
    const connections = terminalConnections.get(projectId);
    if (connections) {
      const messageStr = JSON.stringify(message);
      connections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(messageStr);
        }
      });
    }
  }

  // Project routes
  app.get('/api/projects', async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch projects' });
    }
  });

  app.get('/api/projects/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch project' });
    }
  });

  app.post('/api/projects', async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid project data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create project' });
    }
  });

  app.delete('/api/projects/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProject(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete project' });
    }
  });

  // File routes
  app.get('/api/projects/:projectId/files', async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const files = await storage.getProjectFiles(projectId);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch files' });
    }
  });

  app.get('/api/files/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const file = await storage.getFile(id);
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }
      res.json(file);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch file' });
    }
  });

  app.post('/api/projects/:projectId/files', async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const fileData = insertFileSchema.parse({ ...req.body, projectId });
      const file = await storage.createFile(fileData);
      res.status(201).json(file);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid file data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create file' });
    }
  });

  app.put('/api/files/:id/content', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { content } = req.body;
      if (typeof content !== 'string') {
        return res.status(400).json({ message: 'Content must be a string' });
      }
      const file = await storage.updateFileContent(id, content);
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }
      res.json(file);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update file content' });
    }
  });

  app.delete('/api/files/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteFile(id);
      if (!deleted) {
        return res.status(404).json({ message: 'File not found' });
      }
      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete file' });
    }
  });

  // Execution routes
  app.post('/api/projects/:projectId/run', async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { command = 'run' } = req.body;

      // Create execution session
      const session = await storage.createExecutionSession({
        projectId,
        command,
        status: 'running',
        output: '',
        exitCode: null,
      });

      // Start mock execution simulation
      simulateExecution(projectId, session.id, command, broadcastToTerminal);

      res.json({ sessionId: session.id, status: 'started' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to start execution' });
    }
  });

  app.get('/api/execution-sessions/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.getExecutionSession(id);
      if (!session) {
        return res.status(404).json({ message: 'Execution session not found' });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch execution session' });
    }
  });

  // Language configuration endpoint
  app.get('/api/languages', (req, res) => {
    const languages = [
      {
        id: 'javascript',
        name: 'JavaScript',
        fileExtensions: ['.js', '.mjs'],
        monacoLanguage: 'javascript',
        defaultFile: 'index.js',
        runCommand: 'node index.js',
      },
      {
        id: 'python',
        name: 'Python',
        fileExtensions: ['.py'],
        monacoLanguage: 'python',
        defaultFile: 'main.py',
        runCommand: 'python main.py',
      },
      {
        id: 'java',
        name: 'Java',
        fileExtensions: ['.java'],
        monacoLanguage: 'java',
        defaultFile: 'Main.java',
        buildCommand: 'javac Main.java',
        runCommand: 'java Main',
      },
      {
        id: 'react',
        name: 'React',
        fileExtensions: ['.jsx', '.tsx'],
        monacoLanguage: 'typescript',
        defaultFile: 'App.jsx',
        buildCommand: 'npm install',
        runCommand: 'npm start',
      },
      {
        id: 'cpp',
        name: 'C/C++',
        fileExtensions: ['.cpp', '.c', '.h'],
        monacoLanguage: 'cpp',
        defaultFile: 'main.cpp',
        buildCommand: 'g++ -o main main.cpp',
        runCommand: './main',
      },
      {
        id: 'mysql',
        name: 'MySQL',
        fileExtensions: ['.sql'],
        monacoLanguage: 'sql',
        defaultFile: 'schema.sql',
        runCommand: 'mysql < schema.sql',
      },
      {
        id: 'html',
        name: 'HTML/CSS',
        fileExtensions: ['.html', '.css'],
        monacoLanguage: 'html',
        defaultFile: 'index.html',
        runCommand: 'serve -s .',
      },
    ];
    res.json(languages);
  });

  return httpServer;
}

// Mock execution simulation
async function simulateExecution(
  projectId: number,
  sessionId: number,
  command: string,
  broadcast: (projectId: number, message: any) => void
) {
  const steps = [
    { delay: 500, message: `\x1b[36m> ${command}\x1b[0m\r\n` },
    { delay: 1000, message: '\x1b[33mInitializing execution environment...\x1b[0m\r\n' },
    { delay: 800, message: '\x1b[32m✓ Environment ready\x1b[0m\r\n' },
    { delay: 600, message: '\x1b[33mChecking dependencies...\x1b[0m\r\n' },
    { delay: 900, message: '\x1b[32m✓ Dependencies resolved\x1b[0m\r\n' },
    { delay: 700, message: '\x1b[33mCompiling/transpiling source code...\x1b[0m\r\n' },
    { delay: 1200, message: '\x1b[32m✓ Compilation successful\x1b[0m\r\n' },
    { delay: 500, message: '\x1b[33mStarting application...\x1b[0m\r\n' },
    { delay: 800, message: '\x1b[97mServer running on port 3000\x1b[0m\r\n' },
    { delay: 300, message: '\x1b[36mReady to accept connections\x1b[0m\r\n' },
    { delay: 1000, message: '\x1b[32mExecution completed successfully\x1b[0m\r\n' },
  ];

  let output = '';

  for (const step of steps) {
    await new Promise(resolve => setTimeout(resolve, step.delay));
    output += step.message;
    
    broadcast(projectId, {
      type: 'output',
      data: step.message,
    });
  }

  // Update execution session
  await storage.updateExecutionSession(sessionId, {
    status: 'completed',
    output,
    exitCode: 0,
    completedAt: new Date(),
  });

  broadcast(projectId, {
    type: 'session_complete',
    sessionId,
    exitCode: 0,
  });
}
