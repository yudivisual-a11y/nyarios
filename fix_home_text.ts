import fs from 'fs';
let home = fs.readFileSync('src/components/views/BeresHome.tsx', 'utf8');
home = home.replace(
  /Atau mulai dari kosong/,
  "Atau pilih format karya"
);
fs.writeFileSync('src/components/views/BeresHome.tsx', home);
