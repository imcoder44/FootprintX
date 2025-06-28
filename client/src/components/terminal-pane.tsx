import { useEffect, useRef, useState } from "react";

interface TerminalPaneProps {
  projectId: number;
  lastMessage: MessageEvent | null;
  isConnected: boolean;
}

export default function TerminalPane({ projectId, lastMessage, isConnected }: TerminalPaneProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any>(null);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);

  // Initialize xterm.js
  useEffect(() => {
    if (!terminalRef.current) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/xterm@5.3.0/css/xterm.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/xterm@5.3.0/lib/xterm.js';
    script.onload = () => {
      // Wait for xterm to be fully loaded
      setTimeout(() => {
        const Terminal = (window as any).Terminal;
        if (!Terminal) {
          console.error('xterm.js not loaded properly');
          return;
        }
        const terminal = new Terminal({
        theme: {
          background: '#000000',
          foreground: '#00FF00',
          cursor: '#00FF00',
          selection: 'rgba(0, 255, 0, 0.3)',
          black: '#000000',
          red: '#FF0000',
          green: '#00FF00',
          yellow: '#FFFF00',
          blue: '#0000FF',
          magenta: '#FF00FF',
          cyan: '#00FFFF',
          white: '#FFFFFF',
        },
        fontSize: 14,
        fontFamily: 'Fira Code, Monaco, Menlo, monospace',
        cursorBlink: true,
        cursorStyle: 'block',
        allowProposedApi: true,
      });

      terminal.open(terminalRef.current);
      xtermRef.current = terminal;

      // Welcome message with typewriter effect
      const welcomeLines = [
        '\x1b[32mHackerIDE Terminal v2.1.0 - Polyglot Execution Environment\x1b[0m',
        '\x1b[32mCopyright (c) 2024 HackerIDE. All rights reserved.\x1b[0m',
        '\x1b[32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m',
        ''
      ];

      welcomeLines.forEach((line, index) => {
        setTimeout(() => {
          terminal.writeln(line);
          if (index === welcomeLines.length - 1) {
            terminal.write('\x1b[36mhackeride@polyglot:~$\x1b[0m ');
          }
        }, index * 100);
      });
    };

    document.head.appendChild(script);

    return () => {
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
    };
  }, []);

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage && xtermRef.current) {
      try {
        const message = JSON.parse(lastMessage.data);
        if (message.type === 'output') {
          xtermRef.current.write(message.data);
        } else if (message.type === 'session_complete') {
          xtermRef.current.write('\r\n\x1b[36mhackeride@polyglot:~$\x1b[0m ');
        }
      } catch (error) {
        console.error('Failed to parse terminal message:', error);
      }
    }
  }, [lastMessage]);

  const handleClear = () => {
    if (xtermRef.current) {
      xtermRef.current.clear();
      xtermRef.current.write('\x1b[36mhackeride@polyglot:~$\x1b[0m ');
    }
  };

  return (
    <div className="bg-terminal-black relative h-full">
      <div className="terminal-scanlines"></div>
      
      {/* Terminal Header */}
      <div className="bg-terminal-dark border-b border-terminal-green px-4 py-2 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-terminal-cyan">TERMINAL</span>
          <span className={`animate-blink ${isConnected ? 'text-terminal-green' : 'text-red-500'}`}>
            {isConnected ? '●' : '○'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            className="console-button px-2 py-0.5 text-xs"
            onClick={handleClear}
          >
            CLEAR
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="h-full p-4 overflow-hidden"
        style={{ height: 'calc(100% - 40px)' }}
      />
    </div>
  );
}
