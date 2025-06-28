# HackerIDE - Polyglot Browser-Based IDE

## Overview

HackerIDE is a browser-based, polyglot IDE designed with a retro "hacker's terminal" aesthetic. The application provides a full-screen development environment featuring an embedded Monaco editor, xterm.js-powered terminal, and support for multiple programming languages including Java, Python, JavaScript, React, C/C++, MySQL, and HTML/CSS.

## System Architecture

The application follows a modern full-stack architecture with clear separation between client and server components:

### Frontend Architecture
- **Framework**: React with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom terminal theme
- **Code Editor**: Monaco Editor with custom "hackerTerminal" theme
- **Terminal**: xterm.js for terminal emulation
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Build Tool**: Vite for frontend bundling, esbuild for backend
- **Development**: Hot module replacement with Vite middleware

### Database Strategy
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Database**: PostgreSQL (via Neon serverless)
- **Schema**: Projects, files, and execution sessions tables
- **Migrations**: Drizzle Kit for schema management

## Key Components

### Frontend Components
1. **IDE Layout**: Split-pane design (70% editor, 30% terminal)
2. **EditorPane**: Monaco editor with custom hacker theme and language support
3. **TerminalPane**: xterm.js terminal with WebSocket connectivity
4. **TopBar**: Project controls and status indicators
5. **FileExplorer**: File tree navigation and management
6. **LanguageTabs**: Multi-language support switching

### Backend Services
1. **Project Management**: CRUD operations for projects and files
2. **WebSocket Server**: Real-time terminal communication
3. **Storage Layer**: In-memory storage implementation (prepared for database migration)
4. **File System**: Project file management and content handling

### Database Schema
- **Projects Table**: Project metadata (id, name, language, description, timestamps)
- **Files Table**: File contents and metadata (id, project_id, name, path, content, language, timestamps)
- **Execution Sessions**: Command execution tracking (id, project_id, command, status, output, timestamps)

## Data Flow

1. **Project Loading**: Client fetches project data and files via REST API
2. **File Editing**: Real-time content updates with debounced auto-save
3. **Code Execution**: WebSocket-based streaming of build/run output
4. **Terminal Interaction**: Bidirectional WebSocket communication for terminal sessions

## External Dependencies

### Frontend Dependencies
- **Monaco Editor**: Loaded dynamically via CDN for code editing
- **xterm.js**: Terminal emulation library
- **Radix UI**: Accessible UI primitives
- **TanStack Query**: Server state management
- **Tailwind CSS**: Utility-first styling

### Backend Dependencies
- **Express.js**: Web server framework
- **WebSocket**: Real-time communication
- **Drizzle ORM**: Database operations
- **Zod**: Schema validation

### Development Tools
- **Vite**: Frontend build tool and dev server
- **TypeScript**: Type safety across the stack
- **ESBuild**: Backend bundling

## Deployment Strategy

### Development Environment
- Vite dev server with HMR for frontend
- Express server with TypeScript compilation
- WebSocket server integration
- Replit-specific plugins for development

### Production Build
- Frontend: Vite builds optimized React bundle
- Backend: ESBuild creates Node.js executable
- Database: Drizzle migrations for schema deployment

### Environment Configuration
- PostgreSQL connection via DATABASE_URL
- Development/production mode switching
- Asset serving strategy (static files vs. Vite middleware)

## Changelog

Changelog:
- June 28, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.