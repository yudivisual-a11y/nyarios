import fs from 'fs';
let pc = fs.readFileSync('src/components/social/PostCard.tsx', 'utf8');
pc = pc.replace(`    if (contact) {
      userName = contact.name;
      userAvatar = contact.avatar || '';

  }`, `    if (contact) {
      userName = contact.name;
      userAvatar = contact.avatar || '';
    }
  }`);
fs.writeFileSync('src/components/social/PostCard.tsx', pc);
