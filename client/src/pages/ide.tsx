import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import TopBar from "@/components/top-bar";
import LanguageTabs from "@/components/language-tabs";
import FileExplorer from "@/components/file-explorer";
import EditorPane from "@/components/editor-pane";
import TerminalPane from "@/components/terminal-pane";
import { useWebSocket } from "@/hooks/use-websocket";
import { getQueryFn } from "@/lib/queryClient";

export default function IDE() {
  const params = useParams();
  const projectId = params.id ? parseInt(params.id) : 1;
  
  const [currentLanguage, setCurrentLanguage] = useState("javascript");
  const [currentFile, setCurrentFile] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [uptime, setUptime] = useState(0);

  // Fetch project data
  const { data: project } = useQuery({
    queryKey: [`/api/projects/${projectId}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: projectId > 0,
  });

  // Fetch project files
  const { data: files = [] } = useQuery<any[]>({
    queryKey: [`/api/projects/${projectId}/files`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: projectId > 0,
  });

  // Fetch languages
  const { data: languages = [] } = useQuery<any[]>({
    queryKey: ["/api/languages"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // WebSocket connection for terminal
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    `?projectId=${projectId}`
  );

  // Uptime counter
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setUptime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRun = async () => {
    if (isRunning) return;

    setIsRunning(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'run' }),
      });

      if (!response.ok) {
        throw new Error('Failed to start execution');
      }
    } catch (error) {
      console.error('Execution failed:', error);
    } finally {
      // Will be set to false when execution completes via WebSocket
    }
  };

  const handleBuild = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'build' }),
      });

      if (!response.ok) {
        throw new Error('Failed to start build');
      }
    } catch (error) {
      console.error('Build failed:', error);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    // TODO: Implement stop execution
  };

  const handleLanguageChange = (languageId: string) => {
    setCurrentLanguage(languageId);
    const language = (languages as any[]).find((l: any) => l.id === languageId);
    if (language) {
      // Find or create default file for this language
      const defaultFile = (files as any[]).find((f: any) => f.name === language.defaultFile);
      if (defaultFile) {
        setCurrentFile(defaultFile);
      }
    }
  };

  // Listen for WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      try {
        const message = JSON.parse(lastMessage.data);
        if (message.type === 'session_complete') {
          setIsRunning(false);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    }
  }, [lastMessage]);

  return (
    <div className="h-screen flex flex-col bg-terminal-black text-terminal-green font-mono">
      <TopBar
        project={project}
        currentLanguage={currentLanguage}
        isRunning={isRunning}
        uptime={formatUptime(uptime)}
        onRun={handleRun}
        onBuild={handleBuild}
        onStop={handleStop}
      />
      
      <LanguageTabs
        languages={languages as any[]}
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
      />

      <div className="flex-1">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={70} minSize={30}>
            <div className="flex h-full">
              <FileExplorer
                files={files as any[]}
                currentFile={currentFile}
                onFileSelect={setCurrentFile}
                projectId={projectId}
              />
              
              <EditorPane
                file={currentFile}
                language={currentLanguage}
                onFileChange={setCurrentFile}
              />
            </div>
          </ResizablePanel>
          
          <ResizableHandle className="w-1 bg-terminal-green opacity-50 hover:opacity-100 transition-opacity" />
          
          <ResizablePanel defaultSize={30} minSize={20}>
            <TerminalPane
              projectId={projectId}
              lastMessage={lastMessage}
              isConnected={readyState === WebSocket.OPEN}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Status bar */}
      <div className="bg-terminal-dark border-t border-terminal-green px-4 py-1 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-terminal-cyan">DOCKER:</span>
            <span className="text-terminal-green animate-blink">RUNNING</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-terminal-cyan">LSP:</span>
            <span className="text-terminal-green">CONNECTED</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-terminal-cyan">MEMORY:</span>
            <span>512MB / 2GB</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-terminal-cyan">CPU:</span>
            <span>15%</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-terminal-cyan">UPTIME:</span>
            <span>{formatUptime(uptime)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-terminal-cyan">CONTAINERS:</span>
            <span className="text-terminal-green">3 ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
