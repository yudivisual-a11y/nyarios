import fs from 'fs';

let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

if (!content.includes('activeProjectId')) {
    // Add to interface
    content = content.replace(
        /activeNavTab: MainNavTab;/,
        "activeNavTab: MainNavTab;\n  activeProjectId: string | null;\n  setActiveProjectId: (id: string | null) => void;"
    );

    // Add to Provider component
    content = content.replace(
        /const \[activeNavTab, setActiveNavTab\] = useState<MainNavTab>\('home'\);/,
        "const [activeNavTab, setActiveNavTab] = useState<MainNavTab>('home');\n  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);"
    );

    // Add to context value
    content = content.replace(
        /activeNavTab,\n\s*setActiveNavTab,/,
        "activeNavTab,\n      setActiveNavTab,\n      activeProjectId,\n      setActiveProjectId,"
    );
    
    fs.writeFileSync('src/context/AppContext.tsx', content);
}
