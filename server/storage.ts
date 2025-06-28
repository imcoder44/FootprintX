import { projects, files, executionSessions, type Project, type File, type ExecutionSession, type InsertProject, type InsertFile, type InsertExecutionSession } from "@shared/schema";

export interface IStorage {
  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  getProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // File operations
  getFile(id: number): Promise<File | undefined>;
  getProjectFiles(projectId: number): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: number, updates: Partial<InsertFile>): Promise<File | undefined>;
  deleteFile(id: number): Promise<boolean>;
  updateFileContent(id: number, content: string): Promise<File | undefined>;

  // Execution session operations
  getExecutionSession(id: number): Promise<ExecutionSession | undefined>;
  getProjectExecutions(projectId: number): Promise<ExecutionSession[]>;
  createExecutionSession(session: InsertExecutionSession): Promise<ExecutionSession>;
  updateExecutionSession(id: number, updates: Partial<ExecutionSession>): Promise<ExecutionSession | undefined>;
}

export class MemStorage implements IStorage {
  private projects: Map<number, Project>;
  private files: Map<number, File>;
  private executionSessions: Map<number, ExecutionSession>;
  private currentProjectId: number;
  private currentFileId: number;
  private currentExecutionId: number;

  constructor() {
    this.projects = new Map();
    this.files = new Map();
    this.executionSessions = new Map();
    this.currentProjectId = 1;
    this.currentFileId = 1;
    this.currentExecutionId = 1;
    this.initializeDefaultProject();
  }

  private async initializeDefaultProject() {
    // Create default project
    const project = await this.createProject({
      name: "HackerIDE Workspace",
      language: "javascript",
      description: "Polyglot development environment"
    });

    // Create template files for each language
    const templates = [
      {
        name: "index.js",
        path: "index.js",
        language: "javascript",
        content: `// Welcome to HackerIDE - JavaScript Environment
console.log("Hello from HackerIDE!");

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({
    message: 'Hello from HackerIDE!',
    timestamp: new Date().toISOString(),
    environment: 'development'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
        isDirectory: false
      },
      {
        name: "main.py",
        path: "main.py", 
        language: "python",
        content: `# Welcome to HackerIDE - Python Environment
print("Hello from HackerIDE!")

from flask import Flask, jsonify
from datetime import datetime

app = Flask(__name__)

@app.route('/')
def hello():
    return jsonify({
        'message': 'Hello from HackerIDE!',
        'timestamp': datetime.now().isoformat(),
        'environment': 'development'
    })

if __name__ == '__main__':
    print("Starting Python server...")
    app.run(host='0.0.0.0', port=3000, debug=True)`,
        isDirectory: false
      },
      {
        name: "Main.java",
        path: "Main.java",
        language: "java", 
        content: `// Welcome to HackerIDE - Java Environment
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from HackerIDE!");
        
        // Simple HTTP server simulation
        System.out.println("Starting Java application...");
        System.out.println("Server would be running on port 3000");
        System.out.println("Environment: development");
        
        // Application logic here
        for (int i = 1; i <= 5; i++) {
            System.out.println("Processing request " + i);
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        
        System.out.println("Application completed successfully!");
    }
}`,
        isDirectory: false
      }
    ];

    for (const template of templates) {
      await this.createFile({
        ...template,
        projectId: project.id
      });
    }
  }

  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const now = new Date();
    const project: Project = {
      ...insertProject,
      id,
      description: insertProject.description || null,
      createdAt: now,
      updatedAt: now,
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updatedProject: Project = {
      ...project,
      ...updates,
      updatedAt: new Date(),
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    const deleted = this.projects.delete(id);
    if (deleted) {
      // Delete associated files
      Array.from(this.files.entries()).forEach(([fileId, file]) => {
        if (file.projectId === id) {
          this.files.delete(fileId);
        }
      });
      // Delete associated execution sessions
      Array.from(this.executionSessions.entries()).forEach(([sessionId, session]) => {
        if (session.projectId === id) {
          this.executionSessions.delete(sessionId);
        }
      });
    }
    return deleted;
  }

  // File operations
  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }

  async getProjectFiles(projectId: number): Promise<File[]> {
    return Array.from(this.files.values()).filter(file => file.projectId === projectId);
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const id = this.currentFileId++;
    const now = new Date();
    const file: File = {
      ...insertFile,
      id,
      content: insertFile.content || "",
      language: insertFile.language || null,
      isDirectory: insertFile.isDirectory || false,
      createdAt: now,
      updatedAt: now,
    };
    this.files.set(id, file);
    return file;
  }

  async updateFile(id: number, updates: Partial<InsertFile>): Promise<File | undefined> {
    const file = this.files.get(id);
    if (!file) return undefined;

    const updatedFile: File = {
      ...file,
      ...updates,
      updatedAt: new Date(),
    };
    this.files.set(id, updatedFile);
    return updatedFile;
  }

  async deleteFile(id: number): Promise<boolean> {
    return this.files.delete(id);
  }

  async updateFileContent(id: number, content: string): Promise<File | undefined> {
    return this.updateFile(id, { content });
  }

  // Execution session operations
  async getExecutionSession(id: number): Promise<ExecutionSession | undefined> {
    return this.executionSessions.get(id);
  }

  async getProjectExecutions(projectId: number): Promise<ExecutionSession[]> {
    return Array.from(this.executionSessions.values()).filter(session => session.projectId === projectId);
  }

  async createExecutionSession(insertSession: InsertExecutionSession): Promise<ExecutionSession> {
    const id = this.currentExecutionId++;
    const now = new Date();
    const session: ExecutionSession = {
      ...insertSession,
      id,
      status: insertSession.status || "running",
      output: insertSession.output || null,
      exitCode: insertSession.exitCode || null,
      startedAt: now,
      completedAt: null,
    };
    this.executionSessions.set(id, session);
    return session;
  }

  async updateExecutionSession(id: number, updates: Partial<ExecutionSession>): Promise<ExecutionSession | undefined> {
    const session = this.executionSessions.get(id);
    if (!session) return undefined;

    const updatedSession: ExecutionSession = {
      ...session,
      ...updates,
    };
    this.executionSessions.set(id, updatedSession);
    return updatedSession;
  }
}

export const storage = new MemStorage();
