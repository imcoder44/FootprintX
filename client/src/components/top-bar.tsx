interface TopBarProps {
  project?: any;
  currentLanguage: string;
  isRunning: boolean;
  uptime: string;
  onRun: () => void;
  onBuild: () => void;
  onStop: () => void;
}

export default function TopBar({
  project,
  currentLanguage,
  isRunning,
  uptime,
  onRun,
  onBuild,
  onStop,
}: TopBarProps) {
  return (
    <div className="bg-terminal-black border-b border-terminal-green flex items-center justify-between px-4 py-2 h-12">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-bold glow-text animate-glow">HackerIDE</h1>
        <span className="text-terminal-cyan opacity-70">|</span>
        <span className="text-sm">{project?.name || 'polyglot-workspace'}</span>
        <span className="cursor-glow"></span>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Language Status */}
        <div className="flex items-center space-x-1 text-xs">
          <span className="text-terminal-cyan">LANG:</span>
          <span className="capitalize">{currentLanguage}</span>
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center space-x-1 text-xs">
          <span className="text-terminal-cyan">STATUS:</span>
          <span className={`animate-blink ${isRunning ? 'text-yellow-400' : 'text-terminal-green'}`}>
            {isRunning ? 'RUNNING' : 'READY'}
          </span>
        </div>
        
        {/* Control Buttons */}
        <button 
          className="console-button px-3 py-1 text-xs"
          onClick={onBuild}
        >
          &gt;_ BUILD
        </button>
        <button 
          className="console-button px-3 py-1 text-xs"
          onClick={onRun}
          disabled={isRunning}
        >
          &gt;_ RUN
        </button>
        <button 
          className="console-button px-3 py-1 text-xs"
          onClick={onStop}
          disabled={!isRunning}
        >
          &gt;_ STOP
        </button>
      </div>
    </div>
  );
}
