interface Language {
  id: string;
  name: string;
  fileExtensions: string[];
  monacoLanguage: string;
  defaultFile: string;
  buildCommand?: string;
  runCommand: string;
}

interface LanguageTabsProps {
  languages: Language[];
  currentLanguage: string;
  onLanguageChange: (languageId: string) => void;
}

export default function LanguageTabs({
  languages,
  currentLanguage,
  onLanguageChange,
}: LanguageTabsProps) {
  return (
    <div className="bg-terminal-dark border-b border-terminal-green px-4 py-1">
      <div className="flex space-x-1 text-xs">
        {languages.map((language) => (
          <button
            key={language.id}
            className={`language-tab px-3 py-1 ${
              language.id === currentLanguage ? 'active' : ''
            }`}
            onClick={() => onLanguageChange(language.id)}
          >
            {language.name}
          </button>
        ))}
      </div>
    </div>
  );
}
