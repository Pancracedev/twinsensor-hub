# 📦 DEPENDENCIES & SETUP GUIDE

**Twin Sensor Hub Frontend - Package Management**

---

## 🎯 Current Status

### ✅ Already Installed (from PWA Phase)
```json
{
  "dependencies": {
    "next": "16.1.3",
    "react": "19.2.3",
    "react-dom": "19.2.3"
  },
  "devDependencies": {
    "typescript": "5",
    "@types/react": "19",
    "@types/react-dom": "19",
    "tailwindcss": "4",
    "postcss": "4",
    "eslint": "9"
  }
}
```

---

## 📋 Phase 1 Dependencies to Install

### For Device Pairing Implementation

```bash
# Install these in frontend directory:
npm install socket.io-client@4.7.0 zustand@4.4.0 uuid@9.0.0
```

### What Each Package Does

#### 1. **socket.io-client** v4.7.0
**Purpose**: WebSocket real-time communication client  
**Size**: ~44 KB (gzipped)  
**Why**: Reliable real-time bidirectional communication, automatic reconnection, fallbacks  

```typescript
import io from 'socket.io-client';
const socket = io('http://localhost:3001');
socket.emit('event', data);
socket.on('response', (data) => {});
```

#### 2. **zustand** v4.4.0
**Purpose**: Lightweight state management  
**Size**: ~6 KB (gzipped)  
**Why**: Simple, type-safe, no boilerplate, perfect for mid-size apps  

```typescript
import { create } from 'zustand';
const useStore = create((set) => ({
  state: 0,
  increment: () => set((s) => ({ state: s.state + 1 })),
}));
```

#### 3. **uuid** v9.0.0
**Purpose**: Generate unique identifiers  
**Size**: ~6 KB  
**Why**: Cryptographically random, standards-compliant UUID v4 generation  

```typescript
import { v4 as uuidv4 } from 'uuid';
const deviceId = uuidv4(); // e.g., "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
```

---

## 🛠️ Installation Instructions

### Step 1: Navigate to Frontend
```bash
cd /home/pancrace/Bureau/twinsensor-hub/frontend
```

### Step 2: Install Phase 1 Dependencies
```bash
npm install socket.io-client@4.7.0 zustand@4.4.0 uuid@9.0.0
```

### Step 3: Verify Installation
```bash
# Check if packages installed
npm list socket.io-client zustand uuid

# Output should show:
# ├── socket.io-client@4.7.0
# ├── uuid@9.0.0
# └── zustand@4.4.0
```

### Step 4: Verify package.json Updated
```bash
cat package.json | grep -A 5 "dependencies"
```

Should show:
```json
"dependencies": {
  "next": "16.1.3",
  "react": "19.2.3",
  "react-dom": "19.2.3",
  "socket.io-client": "^4.7.0",
  "uuid": "^9.0.0",
  "zustand": "^4.4.0"
}
```

---

## 📅 Phase-by-Phase Dependencies

### Phase 0: PWA ✅ (COMPLETE)
```json
{
  "dependencies": {
    "next": "16.1.3",
    "react": "19.2.3",
    "react-dom": "19.2.3"
  }
}
```

### Phase 1: Device Pairing 🎯 (NOW)
```json
{
  "dependencies": {
    "socket.io-client": "^4.7.0",
    "zustand": "^4.4.0",
    "uuid": "^9.0.0"
  }
}
```

### Phase 2: Real-time Monitoring 📅 (Coming Next)
```json
{
  "dependencies": {
    "three": "^r128.0.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.87.0",
    "recharts": "^2.10.0",
    "framer-motion": "^10.16.0"
  },
  "devDependencies": {
    "@types/three": "^r128.0.0"
  }
}
```

**Install when ready for Phase 2**:
```bash
npm install three@latest @react-three/fiber@latest @react-three/drei@latest recharts@latest framer-motion@latest
npm install --save-dev @types/three@latest
```

### Phase 3: AI Anomaly Detection 📅 (Phase 3)
```json
{
  "dependencies": {
    "@tensorflow/tfjs": "^4.11.0",
    "@tensorflow/tfjs-core": "^4.11.0"
  }
}
```

**Install when ready for Phase 3**:
```bash
npm install @tensorflow/tfjs@latest @tensorflow/tfjs-core@latest
```

### Phase 4: Diagnostic & Replay 📅 (Phase 4)
```json
{
  "dependencies": {
    "date-fns": "^2.30.0"
  }
}
```

**Install when ready for Phase 4**:
```bash
npm install date-fns@latest
```

---

## 🔍 Dependency Security Check

### Check for Vulnerabilities
```bash
npm audit
```

If vulnerabilities found:
```bash
npm audit fix
```

### Check for Outdated Packages
```bash
npm outdated
```

---

## 📊 Bundle Size Analysis

### Current Size (After Phase 0)
```
main.js           ~200 KB (uncompressed)
                  ~50 KB (gzipped)
Total bundle      ~250 KB (before optimization)
```

### After Phase 1 Addition
```
socket.io-client  +44 KB (gzipped)
zustand          +6 KB (gzipped)
uuid             +6 KB (gzipped)
─────────────────────────
Total            +56 KB (gzipped)

New total: ~106 KB (gzipped)
```

### After All Phases
```
Phase 0          ~50 KB
Phase 1          +56 KB
Phase 2          +180 KB (Three.js, Recharts)
Phase 3          +120 KB (TensorFlow.js)
Phase 4          +10 KB (date-fns)
─────────────────────────
Total           ~416 KB (gzipped)

This is acceptable for a complex web app.
Next.js code-splitting reduces initial load.
```

---

## 🚀 Install Process with Commands

### Complete Setup from Scratch

```bash
# 1. Navigate to frontend
cd /home/pancrace/Bureau/twinsensor-hub/frontend

# 2. Verify Node.js and npm
node --version    # Should be 18+
npm --version     # Should be 9+

# 3. Install existing dependencies (if not done)
npm install

# 4. Install Phase 1 specific packages
npm install socket.io-client@4.7.0 zustand@4.4.0 uuid@9.0.0

# 5. Verify installation
npm list | grep -E "socket.io-client|zustand|uuid"

# 6. Run linter to check for any issues
npm run lint

# 7. Start dev server
npm run dev

# 8. In browser, open http://localhost:3000
# If you see any errors, check browser console
```

---

## ⚙️ Environment Configuration

### Create .env.local

```bash
cd /home/pancrace/Bureau/twinsensor-hub/frontend
echo "NEXT_PUBLIC_SOCKET_URL=http://localhost:3001" > .env.local
```

Or manually create `frontend/.env.local`:

```env
# Backend Socket.io server URL
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Optional: For production
# NEXT_PUBLIC_SOCKET_URL=https://api.twinsensorhub.com
```

**Note**: This is a public variable (NEXT_PUBLIC_) so it's exposed in the browser. Don't put secrets here.

---

## 🔐 Important Security Notes

### socket.io-client
- ✅ Safe to use in browser
- ✅ Requires server-side validation of all messages
- ⚠️ Never trust client data
- ⚠️ Always authenticate on backend

### uuid
- ✅ Generates random IDs
- ✅ Good for device identification
- ⚠️ Not suitable for security tokens
- ⚠️ For auth, use proper JWT/OAuth

### zustand
- ✅ Safe for client-side state
- ⚠️ Don't store sensitive data (use httpOnly cookies)
- ⚠️ State persists in memory only (clear on reload)

---

## 🆘 Troubleshooting Installation

### Issue: npm install fails

**Solution 1**: Clear npm cache
```bash
npm cache clean --force
npm install
```

**Solution 2**: Use npm ci instead (more reliable)
```bash
npm ci
```

**Solution 3**: Check Node version
```bash
node --version
# If < 18, upgrade Node.js
```

### Issue: socket.io-client version conflict

**Solution**: Use specific version
```bash
npm install socket.io-client@4.7.0 --save-exact
```

### Issue: Package not found after install

**Solution**: Reinstall dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript errors on import

**Solution**: Ensure types are included
```bash
# socket.io-client includes types
# uuid needs type definition
npm install --save-dev @types/uuid
```

---

## 📝 Git Integration

### After Installing Dependencies

```bash
# Check what changed
git status

# Should show:
# modified:   package.json
# modified:   package-lock.json

# Add to git
git add package.json package-lock.json

# These will be committed with your first Phase 1 commit
# Don't commit node_modules/
```

---

## ✨ Next Steps After Installation

1. **Verify installation**: `npm run dev`
2. **Check types**: `npx tsc --noEmit`
3. **Check linting**: `npm run lint`
4. **Create feature branch**: `git checkout -b feature/phase-1-project-setup`
5. **Start Phase 1 implementation**: Follow `PHASE-1-PLAN.md`

---

## 📚 Additional Resources

### Package Documentation
- [socket.io-client docs](https://socket.io/docs/v4/client-api/)
- [zustand docs](https://docs.pmnd.rs/zustand/)
- [uuid docs](https://github.com/uuidjs/uuid)

### Performance Monitoring
```bash
# Check bundle size
npm run build

# Build output shows:
# ○ Route (Size)     First Load JS
# ┌ /                ~45 KB
# └ /pairing         ~45 KB
```

### Update Dependencies Later
```bash
# Check outdated packages
npm outdated

# Update all
npm update

# Update specific package
npm install package@latest
```

---

## 🎯 Checklist

Before starting Phase 1:
- [ ] Navigated to `/frontend` directory
- [ ] Ran `npm install socket.io-client zustand uuid`
- [ ] Verified with `npm list`
- [ ] Created `.env.local` with SOCKET_URL
- [ ] Ran `npm run lint` (should pass)
- [ ] Ran `npm run build` (should succeed)
- [ ] Ran `npm run dev` (server starts)
- [ ] Opened http://localhost:3000 (no errors)

---

## 📞 Common Commands Reference

```bash
# Installation
npm install              # Install all dependencies
npm ci                  # Clean install (recommended for CI)

# Development
npm run dev             # Start dev server
npm run lint            # Check for linting errors
npm run lint --fix      # Fix linting errors
npm run build           # Build for production
npm start               # Start production build

# Package Management
npm list                # Show installed packages
npm outdated            # Show outdated packages
npm update              # Update all packages
npm audit               # Check for vulnerabilities
npm cache clean --force # Clear npm cache

# Utilities
npm run format          # Run Prettier
npx tsc --noEmit       # Check TypeScript
```

---

## ✅ Installation Complete!

Once you've installed the Phase 1 dependencies, you're ready to:

1. **Read**: `PHASE-1-PLAN.md`
2. **Create**: Feature branch `feature/phase-1-project-setup`
3. **Implement**: 6 commits as detailed in the plan
4. **Test**: Locally with `npm run dev`
5. **Push**: To GitHub and create PR

**You're all set!** 🚀

---

**Last Updated**: January 2025  
**Status**: Ready for Installation  
**Next**: Follow PHASE-1-PLAN.md

*Save this file for reference throughout development.*
