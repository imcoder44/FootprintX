export function configureMonaco() {
  if (typeof window === 'undefined' || !(window as any).monaco) return;

  const monaco = (window as any).monaco;

  // Define custom hacker terminal theme
  monaco.editor.defineTheme('hackerTerminal', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: '00FF00' },
      { token: 'comment', foreground: '00FFFF', fontStyle: 'italic' },
      { token: 'keyword', foreground: '00FF00', fontStyle: 'bold' },
      { token: 'string', foreground: 'FFFF00' },
      { token: 'number', foreground: 'FF00FF' },
      { token: 'regexp', foreground: 'FF0000' },
      { token: 'type', foreground: '00FFFF' },
      { token: 'class', foreground: '00FF00', fontStyle: 'bold' },
      { token: 'function', foreground: '00FFFF' },
      { token: 'variable', foreground: 'FFFFFF' },
      { token: 'constant', foreground: 'FF00FF', fontStyle: 'bold' },
      { token: 'delimiter', foreground: '00FF00' },
      { token: 'tag', foreground: '00FF00', fontStyle: 'bold' },
      { token: 'attribute.name', foreground: '00FFFF' },
      { token: 'attribute.value', foreground: 'FFFF00' },
    ],
    colors: {
      'editor.background': '#000000',
      'editor.foreground': '#00FF00',
      'editor.lineHighlightBackground': '#001100',
      'editor.selectionBackground': '#003300',
      'editor.inactiveSelectionBackground': '#002200',
      'editorCursor.foreground': '#00FF00',
      'editorWhitespace.foreground': '#004400',
      'editorLineNumber.foreground': '#008800',
      'editorLineNumber.activeForeground': '#00FF00',
      'editor.findMatchBackground': '#004400',
      'editor.findMatchHighlightBackground': '#002200',
      'editorSuggestWidget.background': '#001100',
      'editorSuggestWidget.border': '#00FF00',
      'editorSuggestWidget.foreground': '#00FF00',
      'editorSuggestWidget.selectedBackground': '#003300',
      'editorHoverWidget.background': '#001100',
      'editorHoverWidget.border': '#00FF00',
      'scrollbar.shadow': '#000000',
      'scrollbarSlider.background': '#002200',
      'scrollbarSlider.hoverBackground': '#003300',
      'scrollbarSlider.activeBackground': '#004400',
    }
  });

  // Configure language features
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    allowJs: true,
  });
}
