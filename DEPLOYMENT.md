# MovieMatch Deployment Guide

## 🔥 Firebase Configuration
Before deploying, ensure your Firebase configuration is properly set up:

1. **Firebase Project Setup**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create/select your project
   - Enable Realtime Database
   - Set up security rules

2. **Environment Variables**:
   Create a `.env.production` file with your Firebase config:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI** (already done):
   ```bash
   npm install -g vercel
   ```

2. **Deploy Steps**:
   ```bash
   # Login to Vercel (follow prompts)
   vercel login
   
   # Deploy (first time)
   vercel
   
   # Deploy to production
   vercel --prod
   ```

3. **Configure Environment Variables**:
   - Go to your Vercel dashboard
   - Navigate to your project
   - Go to Settings > Environment Variables
   - Add all your Firebase environment variables

### Option 2: Netlify

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy via Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod --dir=dist
   ```

3. **Or via Netlify Dashboard**:
   - Go to [Netlify](https://netlify.com)
   - Drag and drop your `dist` folder
   - Configure environment variables in site settings

### Option 3: GitHub Pages

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**:
   Add to scripts:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```

3. **Update vite.config.ts**:
   ```typescript
   export default defineConfig({
     base: '/MovieMatch/', // Your repo name
     // ... other config
   });
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

### Option 4: Firebase Hosting

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase Hosting**:
   ```bash
   firebase login
   firebase init hosting
   ```

3. **Configure firebase.json**:
   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

4. **Deploy**:
   ```bash
   npm run build
   firebase deploy
   ```

## ⚙️ Build Optimization

### Update vite.config.ts for production:
```typescript
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/MovieMatch/' : '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/database'],
          ui: ['@radix-ui/react-slot', 'lucide-react']
        }
      }
    }
  },
  // ... rest of config
}));
```

## 🔒 Security Checklist

1. **Environment Variables**: Never commit Firebase keys to GitHub
2. **Firebase Rules**: Set up proper database security rules
3. **CORS**: Configure Firebase for your domain
4. **HTTPS**: Ensure SSL is enabled (automatic on Vercel/Netlify)

## 📊 Performance Optimization

1. **Enable PWA** (optional):
   ```bash
   npm install vite-plugin-pwa
   ```

2. **Image Optimization**: Consider using WebP format for movie posters

3. **Lazy Loading**: Implement for movie cards

## 🚀 Quick Deploy Commands

```bash
# For Vercel (after login)
npm run build && vercel --prod

# For Netlify
npm run build && netlify deploy --prod --dir=dist

# For Firebase
npm run build && firebase deploy

# For GitHub Pages
npm run deploy
```
