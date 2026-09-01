import fs from 'fs';
const content = fs.readFileSync('src/components/layout/DesktopSidebar.tsx', 'utf8');

let updated = content.replace("import { MessageSquare, Phone, Users, CircleDashed, Settings, Bookmark, Clock, Files, Menu, CheckSquare, Search, LogOut, Sun, Moon, Palette, BookUser, UserCircle } from 'lucide-react';", 
"import { MessageSquare, Phone, Users, CircleDashed, Settings, Bookmark, Clock, Files, Menu, CheckSquare, Search, LogOut, Sun, Moon, Palette, BookUser, UserCircle, PlaySquare } from 'lucide-react';");

if (updated === content) {
    updated = content.replace("import {", "import { PlaySquare,");
}

const newItem = `    {
      id: 'konten',
      label: 'Konten',
      icon: <PlaySquare className="w-5 h-5" />,
    },`;

updated = updated.replace(/\{\s*id:\s*'komunitas',/g, newItem + '\n    {\n      id: \'komunitas\',');
fs.writeFileSync('src/components/layout/DesktopSidebar.tsx', updated);
