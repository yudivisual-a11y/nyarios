import fs from 'fs';
const content = fs.readFileSync('src/components/views/ContentView.tsx', 'utf8');

// Add interval to loadPosts
const effectStr = `useEffect(() => {
    loadPosts();
  }, []);`;
const newEffectStr = `useEffect(() => {
    loadPosts();
    const iv = setInterval(loadPosts, 5000);
    return () => clearInterval(iv);
  }, []);`;

const updated = content.replace(effectStr, newEffectStr);
fs.writeFileSync('src/components/views/ContentView.tsx', updated);
