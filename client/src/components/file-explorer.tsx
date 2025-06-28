import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface File {
  id: number;
  name: string;
  path: string;
  content: string;
  language?: string;
  isDirectory: boolean;
}

interface FileExplorerProps {
  files: File[];
  currentFile: File | null;
  onFileSelect: (file: File) => void;
  projectId: number;
}

export default function FileExplorer({
  files,
  currentFile,
  onFileSelect,
  projectId,
}: FileExplorerProps) {
  const [newFileName, setNewFileName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const createFileMutation = useMutation({
    mutationFn: async (data: { name: string; path: string; language?: string }) => {
      const response = await apiRequest('POST', `/api/projects/${projectId}/files`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/files`] });
      setNewFileName("");
      setIsDialogOpen(false);
    },
  });

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    
    const extension = newFileName.split('.').pop()?.toLowerCase();
    let language = 'text';
    
    // Determine language from extension
    if (['js', 'mjs'].includes(extension || '')) language = 'javascript';
    else if (extension === 'py') language = 'python';
    else if (extension === 'java') language = 'java';
    else if (['jsx', 'tsx'].includes(extension || '')) language = 'typescript';
    else if (['cpp', 'c', 'h'].includes(extension || '')) language = 'cpp';
    else if (extension === 'sql') language = 'sql';
    else if (['html', 'css'].includes(extension || '')) language = 'html';

    createFileMutation.mutate({
      name: newFileName,
      path: newFileName,
      language,
    });
  };

  const getFileIcon = (file: File) => {
    if (file.isDirectory) return "📁";
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js':
      case 'mjs':
        return "🟨";
      case 'py':
        return "🐍";
      case 'java':
        return "☕";
      case 'jsx':
      case 'tsx':
        return "⚛️";
      case 'cpp':
      case 'c':
      case 'h':
        return "🔧";
      case 'sql':
        return "🗄️";
      case 'html':
        return "🌐";
      case 'css':
        return "🎨";
      default:
        return "📄";
    }
  };

  return (
    <div className="w-60 bg-terminal-dark border-r border-terminal-green flex flex-col">
      <div className="px-3 py-2 border-b border-terminal-green text-xs text-terminal-cyan">
        PROJECT FILES
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {files.map((file) => (
          <div
            key={file.id}
            className={`file-tree-item px-3 py-1 text-sm cursor-pointer flex items-center ${
              currentFile?.id === file.id ? 'bg-terminal-green bg-opacity-10' : ''
            }`}
            onClick={() => !file.isDirectory && onFileSelect(file)}
          >
            <span className="text-terminal-cyan mr-2">{getFileIcon(file)}</span>
            <span className="truncate">{file.name}</span>
            {currentFile?.id === file.id && (
              <span className="text-terminal-green animate-blink ml-2">●</span>
            )}
          </div>
        ))}
        
        {files.length === 0 && (
          <div className="px-3 py-4 text-sm text-terminal-cyan opacity-60">
            No files in project
          </div>
        )}
      </div>
      
      {/* Project Actions */}
      <div className="border-t border-terminal-green p-2">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="console-button w-full py-1 text-xs">
              + NEW FILE
            </button>
          </DialogTrigger>
          <DialogContent className="bg-terminal-dark border-terminal-green glow-border">
            <DialogHeader>
              <DialogTitle className="text-terminal-green">Create New File</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="filename.ext"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="bg-terminal-black border-terminal-green text-terminal-green glow-border focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
              />
              <div className="flex space-x-2">
                <Button
                  onClick={handleCreateFile}
                  disabled={!newFileName.trim() || createFileMutation.isPending}
                  className="console-button flex-1"
                >
                  CREATE
                </Button>
                <Button
                  onClick={() => setIsDialogOpen(false)}
                  className="console-button flex-1"
                  variant="outline"
                >
                  CANCEL
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
