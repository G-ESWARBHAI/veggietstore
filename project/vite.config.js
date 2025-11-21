import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';

// Plugin to copy vercel.json to dist after build
const copyVercelConfig = () => {
  return {
    name: 'copy-vercel-config',
    closeBundle() {
      const vercelJsonPath = join(__dirname, 'vercel.json');
      const distPath = join(__dirname, 'dist');
      
      if (existsSync(vercelJsonPath) && existsSync(distPath)) {
        try {
          copyFileSync(vercelJsonPath, join(distPath, 'vercel.json'));
          console.log('✅ Copied vercel.json to dist folder');
        } catch (error) {
          console.warn('⚠️ Could not copy vercel.json:', error.message);
        }
      }
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), copyVercelConfig()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});

