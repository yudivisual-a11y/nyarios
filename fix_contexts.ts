import fs from 'fs';

// Fix DesktopSidebar
let sidebar = fs.readFileSync('src/components/layout/DesktopSidebar.tsx', 'utf8');
if (!sidebar.includes('setActiveStudioType,')) {
    sidebar = sidebar.replace(
        /const \{ activeNavTab, setActiveNavTab, currentUser \} = useApp\(\);/,
        "const { activeNavTab, setActiveNavTab, setActiveStudioType, currentUser } = useApp();"
    );
}
fs.writeFileSync('src/components/layout/DesktopSidebar.tsx', sidebar);

// Fix BeresHome
let home = fs.readFileSync('src/components/views/BeresHome.tsx', 'utf8');
if (!home.includes('setActiveStudioType,')) {
    home = home.replace(
        /const \{ setActiveNavTab, setActiveProjectId, currentUser \} = useApp\(\);/,
        "const { setActiveNavTab, setActiveProjectId, setActiveStudioType, currentUser } = useApp();"
    );
}
fs.writeFileSync('src/components/views/BeresHome.tsx', home);
