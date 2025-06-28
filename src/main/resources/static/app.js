// Footprint-X Terminal Application
class FootprintXTerminal {
    constructor() {
        this.term = null;
        this.fitAddon = null;
        this.currentLine = '';
        this.commandHistory = [];
        this.historyIndex = -1;
        this.currentSession = null;
        this.eventSource = null;
        this.isProcessing = false;
        
        this.init();
    }

    init() {
        // Initialize xterm.js terminal
        this.term = new Terminal({
            cursorBlink: true,
            cursorStyle: 'block',
            theme: {
                background: '#000000',
                foreground: '#00ff00',
                cursor: '#00ff00',
                selection: '#333333',
                black: '#000000',
                red: '#ff0000',
                green: '#00ff00',
                yellow: '#ffff00',
                blue: '#0000ff',
                magenta: '#ff00ff',
                cyan: '#00ffff',
                white: '#ffffff',
                brightBlack: '#333333',
                brightRed: '#ff3333',
                brightGreen: '#33ff33',
                brightYellow: '#ffff33',
                brightBlue: '#3333ff',
                brightMagenta: '#ff33ff',
                brightCyan: '#33ffff',
                brightWhite: '#ffffff'
            },
            fontSize: 14,
            fontFamily: '"Courier New", Monaco, Menlo, monospace',
            rows: 30,
            cols: 120
        });

        // Initialize fit addon
        this.fitAddon = new FitAddon.FitAddon();
        this.term.loadAddon(this.fitAddon);

        // Open terminal
        this.term.open(document.getElementById('terminal'));
        this.fitAddon.fit();

        // Setup event handlers
        this.setupEventHandlers();
        
        // Show welcome message
        this.showWelcome();
        this.showPrompt();
    }

    setupEventHandlers() {
        // Handle terminal input
        this.term.onData(data => {
            if (this.isProcessing) return;

            const code = data.charCodeAt(0);
            
            if (code === 13) { // Enter
                this.handleCommand();
            } else if (code === 127) { // Backspace
                this.handleBackspace();
            } else if (code === 27) { // Escape sequences (arrow keys)
                this.handleEscapeSequence(data);
            } else if (code >= 32) { // Printable characters
                this.handleCharacter(data);
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.fitAddon.fit();
        });

        // Handle browser authentication
        this.setupAuthentication();
    }

    setupAuthentication() {
        // Basic authentication setup
        const credentials = btoa('admin:admin123');
        this.authHeaders = {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json'
        };
    }

    showWelcome() {
        const welcome = [
            '',
            '  ███████╗ ██████╗  ██████╗ ████████╗██████╗ ██████╗ ██╗███╗   ██╗████████╗    ██╗  ██╗',
            '  ██╔════╝██╔═══██╗██╔═══██╗╚══██╔══╝██╔══██╗██╔══██╗██║████╗  ██║╚══██╔══╝    ╚██╗██╔╝',
            '  █████╗  ██║   ██║██║   ██║   ██║   ██████╔╝██████╔╝██║██╔██╗ ██║   ██║ █████╗ ╚███╔╝ ',
            '  ██╔══╝  ██║   ██║██║   ██║   ██║   ██╔═══╝ ██╔══██╗██║██║╚██╗██║   ██║ ╚════╝ ██╔██╗ ',
            '  ██║     ╚██████╔╝╚██████╔╝   ██║   ██║     ██║  ██║██║██║ ╚████║   ██║        ██╔╝ ██╗',
            '  ╚═╝      ╚═════╝  ╚═════╝    ╚═╝   ╚═╝     ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝   ╚═╝        ╚═╝  ╚═╝',
            '',
            '  ╔══════════════════════════════════════════════════════════════════════════════════╗',
            '  ║                           OSINT RECONNAISSANCE TERMINAL                         ║',
            '  ║                                  Version 1.0                                    ║',
            '  ╚══════════════════════════════════════════════════════════════════════════════════╝',
            '',
            '  Welcome to Footprint-X - Advanced OSINT Reconnaissance Tool',
            '  ─────────────────────────────────────────────────────────────',
            '',
            '  📞 Phone Number Lookup    | Extract carrier, location, validity',
            '  📧 Email Investigation    | Find person & company details', 
            '  🌐 IP Geolocation        | Trace geographic location & ISP',
            '  👤 Person Search         | Social media & public records',
            '',
            '  Type "help" for available commands or enter your target directly.',
            '  Examples: +1234567890, user@example.com, 192.168.1.1, "John Doe"',
            ''
        ];

        welcome.forEach(line => {
            this.writeLine(line, 'status-success');
        });
    }

    showPrompt() {
        this.term.write('\r\n\x1b[32m┌─[\x1b[31mfootprint-x\x1b[32m]─[\x1b[33m~\x1b[32m]\r\n└─\x1b[31m$\x1b[0m ');
    }

    handleCommand() {
        this.term.write('\r\n');
        const command = this.currentLine.trim();
        
        if (command) {
            this.commandHistory.push(command);
            this.historyIndex = this.commandHistory.length;
            this.executeCommand(command);
        } else {
            this.showPrompt();
        }
        
        this.currentLine = '';
    }

    handleCharacter(char) {
        this.currentLine += char;
        this.term.write(char);
    }

    handleBackspace() {
        if (this.currentLine.length > 0) {
            this.currentLine = this.currentLine.slice(0, -1);
            this.term.write('\b \b');
        }
    }

    handleEscapeSequence(data) {
        if (data.length === 3) {
            const direction = data.charCodeAt(2);
            
            if (direction === 65) { // Up arrow
                this.navigateHistory(-1);
            } else if (direction === 66) { // Down arrow
                this.navigateHistory(1);
            }
        }
    }

    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;

        this.historyIndex += direction;
        
        if (this.historyIndex < 0) {
            this.historyIndex = 0;
        } else if (this.historyIndex >= this.commandHistory.length) {
            this.historyIndex = this.commandHistory.length;
            this.clearCurrentLine();
            return;
        }

        this.clearCurrentLine();
        const command = this.commandHistory[this.historyIndex];
        this.currentLine = command;
        this.term.write(command);
    }

    clearCurrentLine() {
        for (let i = 0; i < this.currentLine.length; i++) {
            this.term.write('\b \b');
        }
        this.currentLine = '';
    }

    executeCommand(command) {
        const cmd = command.toLowerCase().trim();
        
        switch (cmd) {
            case 'help':
                this.showHelp();
                break;
            case 'clear':
                this.term.clear();
                break;
            case 'exit':
            case 'quit':
                this.writeLine('Goodbye! Closing Footprint-X terminal...', 'status-warning');
                setTimeout(() => window.close(), 1000);
                break;
            case 'status':
                this.showStatus();
                break;
            default:
                this.performLookup(command);
                break;
        }
    }

    showHelp() {
        const help = [
            '',
            '  Available Commands:',
            '  ═══════════════════',
            '',
            '  🔍 OSINT Commands:',
            '     <phone>      - Lookup phone number (e.g., +1234567890)',
            '     <email>      - Investigate email address',
            '     <ip>         - Geolocate IP address',
            '     <name>       - Search for person information',
            '',
            '  🛠️  System Commands:',
            '     help         - Show this help message',
            '     clear        - Clear terminal screen',
            '     status       - Show system status',
            '     exit/quit    - Exit terminal',
            '',
            '  💡 Pro Tips:',
            '     • Use quotes for names with spaces: "John Doe"',
            '     • International phone format recommended: +1234567890',
            '     • IPv4 addresses supported: 192.168.1.1',
            ''
        ];

        help.forEach(line => {
            this.writeLine(line, 'status-info');
        });
        this.showPrompt();
    }

    showStatus() {
        const status = [
            '',
            '  System Status:',
            '  ═══════════════',
            '',
            `  🟢 Terminal Status: Online`,
            `  🟢 API Services: Connected`,
            `  📊 Session ID: ${this.currentSession || 'None'}`,
            `  🕒 Uptime: ${this.getUptime()}`,
            `  💾 Command History: ${this.commandHistory.length} commands`,
            ''
        ];

        status.forEach(line => {
            this.writeLine(line, 'status-success');
        });
        this.showPrompt();
    }

    getUptime() {
        const now = new Date();
        const start = this.startTime || now;
        const diff = Math.floor((now - start) / 1000);
        return `${Math.floor(diff / 60)}m ${diff % 60}s`;
    }

    performLookup(query) {
        this.isProcessing = true;
        this.writeLine(`\r\n🔍 Initiating OSINT lookup for: ${query}`, 'status-warning');
        this.writeLine('⚡ Establishing secure connection...', 'status-info');

        // Start lookup request
        fetch('/api/lookup', {
            method: 'POST',
            headers: this.authHeaders,
            body: JSON.stringify({ query: query, type: 'auto' })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            this.currentSession = data.sessionId;
            this.streamResults(data.sessionId);
        })
        .catch(error => {
            this.writeLine(`❌ Error: ${error.message}`, 'status-error');
            this.isProcessing = false;
            this.showPrompt();
        });
    }

    streamResults(sessionId) {
        this.closeEventSource();
        
        this.eventSource = new EventSource(`/api/stream/${sessionId}`, {
            // Note: EventSource doesn't support custom headers directly
            // Authentication is handled by the browser's basic auth
        });

        this.eventSource.onmessage = (event) => {
            try {
                const result = JSON.parse(event.data);
                this.displayResult(result);
            } catch (error) {
                this.writeLine(`⚠️  Data parsing error: ${error.message}`, 'status-warning');
            }
        };

        this.eventSource.onerror = (error) => {
            this.writeLine('❌ Stream connection error. Retrying...', 'status-error');
            this.closeEventSource();
            setTimeout(() => {
                if (this.currentSession === sessionId) {
                    this.streamResults(sessionId);
                }
            }, 2000);
        };

        this.eventSource.addEventListener('close', () => {
            this.isProcessing = false;
            this.showPrompt();
        });
    }

    displayResult(result) {
        const timestamp = new Date(result.timestamp).toLocaleTimeString();
        const statusIcon = result.success ? '✅' : '❌';
        const statusClass = result.success ? 'status-success' : 'status-error';
        
        this.writeLine(`\r\n[${timestamp}] ${statusIcon} ${result.source}`, statusClass);
        
        if (result.message) {
            this.writeLine(`  📝 ${result.message}`, 'status-info');
        }

        if (result.data && Object.keys(result.data).length > 0) {
            this.displayData(result.data);
        }

        // Check if this is the end message
        if (result.type === 'status' && result.message.includes('completed')) {
            this.closeEventSource();
            this.isProcessing = false;
            setTimeout(() => this.showPrompt(), 500);
        }
    }

    displayData(data) {
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'demo_mode') return; // Skip demo indicator
            
            const formattedKey = key.replace(/_/g, ' ').toUpperCase();
            const formattedValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : value;
            this.writeLine(`    ${formattedKey}: ${formattedValue}`, 'status-success');
        });
    }

    closeEventSource() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }

    writeLine(text, className = '') {
        const colorCode = this.getColorCode(className);
        this.term.write(`${colorCode}${text}\x1b[0m\r\n`);
    }

    getColorCode(className) {
        switch (className) {
            case 'status-success': return '\x1b[32m'; // Green
            case 'status-error': return '\x1b[31m';   // Red
            case 'status-warning': return '\x1b[33m'; // Yellow
            case 'status-info': return '\x1b[36m';    // Cyan
            default: return '\x1b[32m';               // Default green
        }
    }
}

// Initialize the terminal when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new FootprintXTerminal();
});