import fs from 'fs';

// 1. Update Types
let types = fs.readFileSync('src/types/index.ts', 'utf8');
types = types.replace(/export type MainNavTab = [^;]+;/, "export type MainNavTab = 'home' | 'studio' | 'wizard' | 'projects' | 'templates' | 'assets' | 'settings' | 'profile';");
fs.writeFileSync('src/types/index.ts', types);

// 2. Update Context
let context = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Insert interface property
context = context.replace(
  /activeProjectId: string \| null;\n  setActiveProjectId: \(id: string \| null\) => void;/,
  "activeProjectId: string | null;\n  setActiveProjectId: (id: string | null) => void;\n  activeStudioType: any;\n  setActiveStudioType: (type: any) => void;"
);

// Insert state
context = context.replace(
  /const \[activeProjectId, setActiveProjectId\] = useState<string \| null>\(null\);/,
  "const [activeProjectId, setActiveProjectId] = useState<string | null>(null);\n  const [activeStudioType, setActiveStudioType] = useState<any>('book');"
);

// Insert context return
context = context.replace(
  /activeProjectId,\n      setActiveProjectId,/,
  "activeProjectId,\n      setActiveProjectId,\n      activeStudioType,\n      setActiveStudioType,"
);

fs.writeFileSync('src/context/AppContext.tsx', context);
