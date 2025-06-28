import { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { z } from "zod";

// OSINT Result interface
interface OSINTResult {
  source: string;
  type: string;
  query: string;
  success: boolean;
  message: string;
  data?: any;
  timestamp: string;
  sessionId: string;
}

// Lookup request schema
const lookupRequestSchema = z.object({
  query: z.string(),
  type: z.string().optional()
});

// OSINT Service Classes
class PhoneInfoService {
  private apiKey: string;
  
  constructor() {
    this.apiKey = process.env.NUMVERIFY_KEY || 'demo_key';
  }

  async lookupPhone(phoneNumber: string, sessionId: string): Promise<OSINTResult> {
    const result: OSINTResult = {
      source: "Numverify",
      type: "phone",
      query: phoneNumber,
      success: false,
      message: "",
      timestamp: new Date().toISOString(),
      sessionId
    };

    if (this.apiKey === 'demo_key') {
      return this.createDemoPhoneResult(phoneNumber, sessionId);
    }

    try {
      const response = await fetch(`http://apilayer.net/api/validate?access_key=${this.apiKey}&number=${phoneNumber}`);
      const data = await response.json();
      
      result.success = true;
      result.data = data;
      result.message = "Phone lookup completed successfully";
      return result;
    } catch (error) {
      result.message = "Failed to lookup phone number";
      return result;
    }
  }

  private createDemoPhoneResult(phoneNumber: string, sessionId: string): OSINTResult {
    return {
      source: "Numverify (Demo)",
      type: "phone",
      query: phoneNumber,
      success: true,
      message: "Demo phone lookup completed",
      data: {
        number: phoneNumber,
        valid: true,
        country_code: "US",
        country_name: "United States of America",
        location: "California",
        carrier: "Demo Carrier",
        line_type: "mobile",
        demo_mode: true
      },
      timestamp: new Date().toISOString(),
      sessionId
    };
  }
}

class EmailInfoService {
  private apiKey: string;
  
  constructor() {
    this.apiKey = process.env.CLEARBIT_KEY || 'demo_key';
  }

  async lookupEmail(email: string, sessionId: string): Promise<OSINTResult> {
    const result: OSINTResult = {
      source: "Clearbit",
      type: "email",
      query: email,
      success: false,
      message: "",
      timestamp: new Date().toISOString(),
      sessionId
    };

    if (this.apiKey === 'demo_key') {
      return this.createDemoEmailResult(email, sessionId);
    }

    try {
      const response = await fetch(`https://person.clearbit.com/v2/combined/find?email=${email}`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });
      const data = await response.json();
      
      result.success = true;
      result.data = data;
      result.message = "Email lookup completed successfully";
      return result;
    } catch (error) {
      result.message = "Failed to lookup email";
      return result;
    }
  }

  private createDemoEmailResult(email: string, sessionId: string): OSINTResult {
    return {
      source: "Clearbit (Demo)",
      type: "email",
      query: email,
      success: true,
      message: "Demo email lookup completed",
      data: {
        person: {
          email: email,
          name: "John Demo User",
          location: "San Francisco, CA",
          title: "Software Engineer",
          linkedin: "https://linkedin.com/in/demo-user",
          twitter: "https://twitter.com/demo_user"
        },
        company: {
          name: "Demo Tech Corp",
          domain: "demotechcorp.com",
          industry: "Technology",
          size: "100-500"
        },
        demo_mode: true
      },
      timestamp: new Date().toISOString(),
      sessionId
    };
  }
}

class GeoIPService {
  private apiKey: string;
  
  constructor() {
    this.apiKey = process.env.IPSTACK_KEY || 'demo_key';
  }

  async lookupIP(ipAddress: string, sessionId: string): Promise<OSINTResult> {
    const result: OSINTResult = {
      source: "IPStack",
      type: "ip",
      query: ipAddress,
      success: false,
      message: "",
      timestamp: new Date().toISOString(),
      sessionId
    };

    if (this.apiKey === 'demo_key') {
      return this.createDemoIPResult(ipAddress, sessionId);
    }

    try {
      const response = await fetch(`http://api.ipstack.com/${ipAddress}?access_key=${this.apiKey}`);
      const data = await response.json();
      
      result.success = true;
      result.data = data;
      result.message = "IP geolocation lookup completed successfully";
      return result;
    } catch (error) {
      result.message = "Failed to lookup IP address";
      return result;
    }
  }

  private createDemoIPResult(ipAddress: string, sessionId: string): OSINTResult {
    return {
      source: "IPStack (Demo)",
      type: "ip",
      query: ipAddress,
      success: true,
      message: "Demo IP lookup completed",
      data: {
        ip: ipAddress,
        country_code: "US",
        country_name: "United States",
        region_code: "CA",
        region_name: "California",
        city: "San Francisco",
        zip: "94102",
        latitude: 37.7749,
        longitude: -122.4194,
        connection_type: "Corporate",
        isp: "Demo Internet Provider",
        demo_mode: true
      },
      timestamp: new Date().toISOString(),
      sessionId
    };
  }
}

class OSINTOrchestratorService {
  private phoneService: PhoneInfoService;
  private emailService: EmailInfoService;
  private geoService: GeoIPService;

  constructor() {
    this.phoneService = new PhoneInfoService();
    this.emailService = new EmailInfoService();
    this.geoService = new GeoIPService();
  }

  async *performLookup(query: string, sessionId: string): AsyncGenerator<OSINTResult> {
    const queryType = this.detectQueryType(query);
    
    // Start message
    yield {
      source: "System",
      type: "status",
      query: query,
      success: true,
      message: `Starting OSINT lookup for: ${query} (detected as: ${queryType})`,
      timestamp: new Date().toISOString(),
      sessionId
    };

    // Perform lookup based on type
    try {
      let result: OSINTResult;
      
      switch (queryType) {
        case "phone":
          result = await this.phoneService.lookupPhone(query, sessionId);
          break;
        case "email":
          result = await this.emailService.lookupEmail(query, sessionId);
          break;
        case "ip":
          result = await this.geoService.lookupIP(query, sessionId);
          break;
        case "name":
          result = await this.emailService.lookupEmail(query + "@gmail.com", sessionId);
          result.source = "Social Search (Demo)";
          result.type = "name";
          result.query = query;
          result.message = `Social media search completed for: ${query}`;
          break;
        default:
          result = {
            source: "System",
            type: "error",
            query: query,
            success: false,
            message: "Unknown query type. Try: phone number, email, IP address, or person name",
            timestamp: new Date().toISOString(),
            sessionId
          };
      }
      
      yield result;
      
    } catch (error) {
      yield {
        source: "System",
        type: "error",
        query: query,
        success: false,
        message: `Error during lookup: ${error}`,
        timestamp: new Date().toISOString(),
        sessionId
      };
    }

    // End message
    yield {
      source: "System",
      type: "status",
      query: "",
      success: true,
      message: "OSINT lookup completed. Type another query or 'help' for commands.",
      timestamp: new Date().toISOString(),
      sessionId
    };
  }

  private detectQueryType(query: string): string {
    query = query.trim().toLowerCase();
    
    if (query.match(/^\+?[1-9]\d{1,14}$/) || query.match(/^\d{10,15}$/)) {
      return "phone";
    }
    
    if (query.includes("@") && query.includes(".")) {
      return "email";
    }
    
    if (query.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
      return "ip";
    }
    
    if (query.match(/^[a-zA-Z\s]+$/)) {
      return "name";
    }
    
    return "unknown";
  }
}

// CSS and JS content as constants
const hackerTerminalCSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { height: 100%; background: #000; color: #00ff00; font-family: 'Courier New', monospace; overflow: hidden; }
#terminal-container { height: 100vh; display: flex; flex-direction: column; background: #000; border: 2px solid #00ff00; box-shadow: 0 0 20px #00ff00; }
#terminal-header { background: #001100; border-bottom: 1px solid #00ff00; padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; height: 40px; }
.terminal-title { color: #00ff00; font-weight: bold; font-size: 14px; text-shadow: 0 0 5px #00ff00; }
.terminal-controls { display: flex; gap: 8px; }
.control { width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; }
.minimize { background: #ffff00; color: #000; }
.maximize { background: #00ff00; color: #000; }
.close { background: #ff0000; color: #fff; }
#terminal { flex: 1; padding: 16px; background: #000; overflow: hidden; }
.xterm { background-color: #000 !important; color: #00ff00 !important; }
.xterm .xterm-viewport { background-color: #000 !important; }
.xterm .xterm-cursor { background-color: #00ff00 !important; color: #000 !important; }
`;

const terminalJS = `
class FootprintXTerminal {
  constructor() {
    this.term = null;
    this.fitAddon = null;
    this.currentLine = '';
    this.isProcessing = false;
    this.authHeaders = { 'Authorization': 'Basic ' + btoa('admin:admin123'), 'Content-Type': 'application/json' };
    this.init();
  }

  init() {
    this.term = new Terminal({
      cursorBlink: true,
      theme: { background: '#000000', foreground: '#00ff00', cursor: '#00ff00' },
      fontSize: 14,
      fontFamily: 'Courier New, monospace'
    });
    
    this.fitAddon = new FitAddon.FitAddon();
    this.term.loadAddon(this.fitAddon);
    this.term.open(document.getElementById('terminal'));
    this.fitAddon.fit();
    
    this.term.onData(data => {
      if (this.isProcessing) return;
      const code = data.charCodeAt(0);
      if (code === 13) this.handleCommand();
      else if (code === 127) this.handleBackspace();
      else if (code >= 32) { this.currentLine += data; this.term.write(data); }
    });
    
    this.showWelcome();
    this.showPrompt();
  }

  showWelcome() {
    const welcome = [
      '', '  FOOTPRINT-X v1.0 | OSINT Terminal', '  Advanced OSINT Reconnaissance Tool',
      '  Phone: +1234567890 | Email: user@example.com | IP: 192.168.1.1',
      '  Type "help" for commands or enter target directly.', ''
    ];
    welcome.forEach(line => this.term.write(line + '\\r\\n'));
  }

  showPrompt() {
    this.term.write('\\r\\nfootprint-x$ ');
  }

  handleCommand() {
    this.term.write('\\r\\n');
    const command = this.currentLine.trim();
    if (command) {
      if (command === 'help') this.showHelp();
      else if (command === 'clear') this.term.clear();
      else this.performLookup(command);
    } else this.showPrompt();
    this.currentLine = '';
  }

  handleBackspace() {
    if (this.currentLine.length > 0) {
      this.currentLine = this.currentLine.slice(0, -1);
      this.term.write('\\b \\b');
    }
  }

  showHelp() {
    const help = ['', 'Available Commands:', 'help - Show this help', 'clear - Clear screen', '<query> - Perform OSINT lookup', ''];
    help.forEach(line => this.term.write(line + '\\r\\n'));
    this.showPrompt();
  }

  performLookup(query) {
    this.isProcessing = true;
    this.term.write('Starting OSINT lookup for: ' + query + '\\r\\n');
    
    fetch('/api/lookup', {
      method: 'POST',
      headers: this.authHeaders,
      body: JSON.stringify({ query: query })
    })
    .then(response => response.json())
    .then(data => this.streamResults(data.sessionId))
    .catch(error => {
      this.term.write('Error: ' + error.message + '\\r\\n');
      this.isProcessing = false;
      this.showPrompt();
    });
  }

  streamResults(sessionId) {
    const eventSource = new EventSource('/api/stream/' + sessionId);
    eventSource.onmessage = (event) => {
      const result = JSON.parse(event.data);
      this.term.write('[' + result.source + '] ' + result.message + '\\r\\n');
      if (result.data) {
        Object.entries(result.data).forEach(([key, value]) => {
          if (key !== 'demo_mode') this.term.write('  ' + key + ': ' + value + '\\r\\n');
        });
      }
      if (result.message.includes('completed')) {
        eventSource.close();
        this.isProcessing = false;
        this.showPrompt();
      }
    };
    eventSource.onerror = () => {
      eventSource.close();
      this.isProcessing = false;
      this.showPrompt();
    };
  }
}

document.addEventListener('DOMContentLoaded', () => new FootprintXTerminal());
`;

export async function registerOSINTRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const orchestratorService = new OSINTOrchestratorService();
  const activeSessions = new Map<string, string>();

  // Serve static files for the terminal UI
  app.get('/', (req: Request, res: Response) => {
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Footprint-X Terminal</title>
    <link rel="stylesheet" href="/styles.css">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💀</text></svg>">
</head>
<body>
    <div id="terminal-container">
        <div id="terminal-header">
            <span class="terminal-title">FOOTPRINT-X v1.0 | OSINT Terminal</span>
            <div class="terminal-controls">
                <span class="control minimize">─</span>
                <span class="control maximize">□</span>
                <span class="control close">×</span>
            </div>
        </div>
        <div id="terminal"></div>
    </div>
    
    <script src="https://unpkg.com/xterm@5.3.0/lib/xterm.js"></script>
    <script src="https://unpkg.com/xterm-addon-fit@0.8.0/lib/xterm-addon-fit.js"></script>
    <script src="/app.js"></script>
</body>
</html>`;
    res.send(indexHtml);
  });

  app.get('/styles.css', (req: Request, res: Response) => {
    res.type('text/css');
    res.send(hackerTerminalCSS);
  });

  app.get('/app.js', (req: Request, res: Response) => {
    res.type('application/javascript');
    res.send(terminalJS);
  });

  // OSINT API Routes
  app.post('/api/lookup', async (req: Request, res: Response) => {
    try {
      const { query } = lookupRequestSchema.parse(req.body);
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      activeSessions.set(sessionId, query);
      
      res.json({
        sessionId,
        status: "started",
        query
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid request format" });
    }
  });

  app.get('/api/stream/:sessionId', async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const query = activeSessions.get(sessionId);
    
    if (!query) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    try {
      for await (const result of orchestratorService.performLookup(query, sessionId)) {
        const sseData = `data: ${JSON.stringify(result)}\n\n`;
        res.write(sseData);
        
        // Add delay between results for better UX
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    } catch (error) {
      const errorResult = {
        source: "System",
        type: "error", 
        query: query,
        success: false,
        message: `Stream error: ${error}`,
        timestamp: new Date().toISOString(),
        sessionId
      };
      res.write(`data: ${JSON.stringify(errorResult)}\n\n`);
    } finally {
      activeSessions.delete(sessionId);
      res.end();
    }
  });

  app.get('/api/sessions/:sessionId/status', (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const active = activeSessions.has(sessionId);
    const query = activeSessions.get(sessionId) || "";
    
    res.json({
      sessionId,
      active,
      query
    });
  });

  return httpServer;
}