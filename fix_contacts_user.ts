import fs from 'fs';
let content = fs.readFileSync('src/components/views/ContactsView.tsx', 'utf8');
content = content.replace("Users,", "Users,\n  User,");
fs.writeFileSync('src/components/views/ContactsView.tsx', content);
