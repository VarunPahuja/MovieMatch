# 🚀 MovieMatch Deployment Guide - Step by Step

## Overview
We'll deploy your MovieMatch app with Firebase integration in verified steps. Each step can be tested before proceeding to ensure everything works perfectly.

---

## 📋 Deployment Options

### **Option A: Vercel (Recommended - Easiest)**
- ✅ Free tier available
- ✅ Automatic deployments from Git
- ✅ Built-in environment variable management
- ✅ Excellent for React/Vite apps

### **Option B: Netlify**
- ✅ Free tier available
- ✅ Git integration
- ✅ Good for static sites

### **Option C: Firebase Hosting**
- ✅ Same ecosystem as your database
- ✅ Free tier available
- ✅ Good integration with Firebase services

---

## 🎯 **STEP 1: Pre-deployment Verification** ⏱️ 5 minutes

### **1.1 Test Local Build**
```bash
npm run build
```
**Expected**: Build completes without errors

### **1.2 Test Production Preview**
```bash
npm run preview
```
**Expected**: App runs on preview server (usually port 4173)

### **1.3 Test Firebase Connection**
- Go to preview URL + `/firebase-test`
- Create a room, verify Firebase works in production mode

**✅ Checkpoint**: Local production build works with Firebase

---

## 🎯 **STEP 2: Prepare Environment Variables** ⏱️ 3 minutes

### **2.1 Review Current .env**
Your current Firebase config:
```env
VITE_FIREBASE_API_KEY=AIzaSyA02zCq8OOLUdYtpYk81fhkvuoLYeN_qzQ
VITE_FIREBASE_AUTH_DOMAIN=moviematch-9b7a5.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://moviematch-9b7a5-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=moviematch-9b7a5
VITE_FIREBASE_STORAGE_BUCKET=moviematch-9b7a5.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=526597905343
VITE_FIREBASE_APP_ID=1:526597905343:web:58ab7680b391e52c049f0a
VITE_FIREBASE_MEASUREMENT_ID=G-0CXD8BXNR6
```

### **2.2 Verify TMDB Token**
```env
VITE_TMDB_READ_TOKEN=your_tmdb_token_here
```

**✅ Checkpoint**: All environment variables documented

---

## 🎯 **STEP 3A: Deploy to Vercel** ⏱️ 10 minutes

### **3A.1 Install Vercel CLI**
```bash
npm install -g vercel
```

### **3A.2 Login to Vercel**
```bash
vercel login
```

### **3A.3 Deploy**
```bash
vercel
```
**Follow prompts**:
- Link to existing project? **N**
- Project name: **moviematch** (or your choice)
- Directory: **./** (current directory)
- Build settings: **Use default** (Vite detected automatically)

### **3A.4 Set Environment Variables**
```bash
vercel env add VITE_FIREBASE_API_KEY
# Enter: AIzaSyA02zCq8OOLUdYtpYk81fhkvuoLYeN_qzQ

vercel env add VITE_FIREBASE_AUTH_DOMAIN
# Enter: moviematch-9b7a5.firebaseapp.com

vercel env add VITE_FIREBASE_DATABASE_URL
# Enter: https://moviematch-9b7a5-default-rtdb.asia-southeast1.firebasedatabase.app

vercel env add VITE_FIREBASE_PROJECT_ID
# Enter: moviematch-9b7a5

vercel env add VITE_FIREBASE_STORAGE_BUCKET
# Enter: moviematch-9b7a5.firebasestorage.app

vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
# Enter: 526597905343

vercel env add VITE_FIREBASE_APP_ID
# Enter: 1:526597905343:web:58ab7680b391e52c049f0a

vercel env add VITE_FIREBASE_MEASUREMENT_ID
# Enter: G-0CXD8BXNR6

vercel env add VITE_TMDB_READ_TOKEN
# Enter: your_tmdb_token
```

### **3A.5 Redeploy with Environment Variables**
```bash
vercel --prod
```

**✅ Checkpoint**: App deployed to Vercel with environment variables

---

## 🎯 **STEP 4: Test Deployment** ⏱️ 5 minutes

### **4.1 Test Main App**
- Visit your Vercel URL (e.g., `https://moviematch-xyz.vercel.app`)
- Verify the main app loads
- Check that movies load (TMDB integration working)

### **4.2 Test Firebase Integration**
- Go to `/firebase-test` route
- Create a room
- Open another browser/device with same URL
- Join the room with the code
- **Verify real-time collaboration works**

### **4.3 Test Responsive Design**
- Test on mobile device
- Test on desktop
- Verify all features work across devices

**✅ Checkpoint**: Deployment is live and fully functional

---

## 🎯 **STEP 5: Set Up Automatic Deployments** ⏱️ 5 minutes

### **5.1 Connect Git Repository**
In Vercel dashboard:
1. Go to your project
2. Settings → Git
3. Connect to GitHub repository: `VarunPahuja/MovieMatch`

### **5.2 Configure Auto-Deploy**
- ✅ Production branch: `main`
- ✅ Auto-deploy on push: **Enabled**

**✅ Checkpoint**: Future Git pushes automatically deploy

---

## 🎯 **STEP 6: Performance & Security** ⏱️ 10 minutes

### **6.1 Firebase Security Rules**
Update Firebase Realtime Database rules:
```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": "auth != null",
        ".write": "auth != null",
        "users": {
          "$userId": {
            ".write": "auth != null && (auth.uid == $userId || !data.exists())"
          }
        }
      }
    }
  }
}
```

### **6.2 Domain Configuration**
In Firebase Console:
1. Authentication → Settings → Authorized domains
2. Add your Vercel domain: `moviematch-xyz.vercel.app`

### **6.3 Test Production Security**
- Test Firebase operations on live site
- Verify authentication works
- Check that unauthorized access is blocked

**✅ Checkpoint**: Production security configured

---

## 🎯 **Alternative: STEP 3B: Deploy to Netlify** ⏱️ 10 minutes

### **3B.1 Install Netlify CLI**
```bash
npm install -g netlify-cli
```

### **3B.2 Login and Deploy**
```bash
netlify login
netlify deploy --build
```

### **3B.3 Set Environment Variables**
```bash
netlify env:set VITE_FIREBASE_API_KEY "AIzaSyA02zCq8OOLUdYtpYk81fhkvuoLYeN_qzQ"
netlify env:set VITE_FIREBASE_AUTH_DOMAIN "moviematch-9b7a5.firebaseapp.com"
# ... (repeat for all variables)
```

### **3B.4 Production Deploy**
```bash
netlify deploy --prod --build
```

---

## 🎯 **Alternative: STEP 3C: Deploy to Firebase Hosting** ⏱️ 15 minutes

### **3C.1 Install Firebase CLI**
```bash
npm install -g firebase-tools
```

### **3C.2 Login and Initialize**
```bash
firebase login
firebase init hosting
```

### **3C.3 Configure firebase.json**
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

### **3C.4 Build and Deploy**
```bash
npm run build
firebase deploy --only hosting
```

---

## 🎉 **FINAL VERIFICATION CHECKLIST**

### **Functionality Tests** ✅
- [ ] Main app loads correctly
- [ ] Movies display with TMDB integration
- [ ] Firebase test page works
- [ ] Room creation generates codes
- [ ] Room joining works
- [ ] Real-time collaboration functions
- [ ] Multi-device testing successful
- [ ] Responsive design works

### **Performance Tests** ✅
- [ ] Page load speed < 3 seconds
- [ ] Firebase operations < 1 second response
- [ ] No console errors
- [ ] Mobile performance acceptable

### **Security Tests** ✅
- [ ] Firebase auth required for database operations
- [ ] Environment variables not exposed in client
- [ ] No sensitive data in browser dev tools

---

## 🎯 **Expected Results**

After completing all steps, you'll have:

✅ **Live Production App**: `https://your-app.vercel.app`
✅ **Real-time Collaboration**: Friends can join rooms and swipe together
✅ **Automatic Deployments**: Git pushes trigger new deployments
✅ **Production Security**: Proper Firebase rules and authentication
✅ **Performance Optimized**: Fast loading and responsive design

---

## 🆘 **Troubleshooting**

### **Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### **Environment Variables Not Working**
- Verify all vars start with `VITE_`
- Check spelling matches exactly
- Restart deployment after adding vars

### **Firebase Connection Issues**
- Verify domain is added to Firebase authorized domains
- Check Firebase rules allow authenticated access
- Test `/firebase-test` route for detailed error info

---

**Ready to start?** Let me know which deployment platform you prefer (Vercel recommended) and we'll begin with Step 1! 🚀
