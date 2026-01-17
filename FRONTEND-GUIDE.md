# 🚀 Twin Sensor Hub - Frontend Development Guide

**Project**: Jumeau Numérique de Performance Mobile (Digital Twin Motion Analysis)  
**Status**: Phase 1 - Device Pairing (Ready to Start)  
**Framework**: Next.js 16.1.3 + React 19 + TypeScript 5 + Tailwind CSS 4  
**PWA**: ✅ Production-ready  

---

## 📚 Documentation Index

```
📋 MAIN DOCUMENTS
├── ANALYSIS-STRATEGY.md           ← Current state analysis + architecture
├── PHASE-1-PLAN.md                ← Detailed Phase 1 action plan (6 commits)
├── README.md (this file)           ← Quick start guide
│
📊 PROJECT DOCS (in root)
├── PWA-SETUP.md                   ← PWA infrastructure details
├── IMPLEMENTATION-PHASES.md       ← Project phases overview
├── NEXT-STEPS.md                  ← Immediate actions
│
🏗️ ARCHITECTURE
├── git branches: main, next
├── folder structure: app/, components/, services/, etc.
└── Stack: TypeScript, Zustand, Socket.io, Three.js, Recharts
```

---

## ⚡ Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install

# Phase 1 only needs:
# socket.io-client, zustand, uuid
```

### 2. Environment Setup

```bash
# Frontend setup (optional - defaults to localhost)
echo "NEXT_PUBLIC_SOCKET_URL=http://localhost:3001" > .env.local
```

### 3. Run Development Server

```bash
npm run dev

# Open http://localhost:3000
# Pairing page: http://localhost:3000/pairing
```

---

## 📋 Current Frontend Status

### ✅ What's Ready

- **PWA Infrastructure**: Service Worker, manifest, offline support (COMPLETE)
- **TypeScript Setup**: Strict mode, type definitions (COMPLETE)
- **Styling**: Tailwind CSS v4 configured (COMPLETE)
- **Root Layout**: Metadata, fonts, PWA installer (COMPLETE)
- **Documentation**: Architecture & strategy planned (COMPLETE)

### ❌ What's Missing (Phase 1 Focus)

- **Folder Structure**: Need to create components/, services/, hooks/, stores/
- **State Management**: Zustand stores not yet created
- **Socket.io**: Not integrated
- **Components**: Pairing page & device status components
- **Actual Pages**: page.tsx is still template

---

## 🎯 Phase 1: Device Pairing

**Goal**: Establish device-server connection via Socket.io

### What you'll build (6 commits):

```
1. Project structure + types
2. Zustand stores (device, UI state)
3. Socket.io service + device service
4. Custom hooks (useDevice, useSocket)
5. Reusable UI components
6. Pairing page + dashboard layout
```

### Time estimate: 2-3 days

### By end of Phase 1, you'll have:
- ✅ Device ID generation & storage
- ✅ WebSocket connection established
- ✅ Real-time connection status display
- ✅ Error handling & notifications
- ✅ Auto-redirect after pairing
- ✅ Foundation for Phase 2

---

## 📖 How to Use This Documentation

### For Architecture Overview
→ Read `ANALYSIS-STRATEGY.md`

### For Phase 1 Implementation  
→ Follow `PHASE-1-PLAN.md` step by step

### For PWA Details
→ Check `PWA-SETUP.md` in root

### For Questions
→ Check `IMPLEMENTATION-PHASES.md` for project context

---

## 🔄 Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/phase-1-project-setup
```

### 2. Follow Phase 1 Plan
- Create types + utils (Commit 1)
- Create stores (Commit 2)
- Create services (Commit 3)
- Create hooks (Commit 4)
- Create components (Commit 5)
- Create pages (Commit 6)

### 3. After Each Commit
```bash
npm run dev           # Test locally
npm run lint          # Check linting
npm run build         # Test build
git commit -m "feat: ..."
```

### 4. When Phase 1 Complete
```bash
git push -u origin feature/phase-1-project-setup
# Create PR on GitHub
# Code review
# Merge to main
```

---

## 🧪 Testing Checklist

### Phase 1 Validation
- [ ] Device ID generates and persists
- [ ] WebSocket connects when "Connect" clicked
- [ ] Connection status indicator updates
- [ ] Auto-redirect to dashboard after connection
- [ ] Disconnect button works
- [ ] Error messages display correctly
- [ ] Notifications appear and auto-dismiss
- [ ] Works in offline mode (PWA)
- [ ] Responsive design tested
- [ ] No TypeScript errors

---

## 🛠️ Tech Stack Decisions

### State Management: Zustand ✅
Why? Simple, lightweight, perfect for mid-size app

### Real-time: Socket.io ✅
Why? Reliable, proven, good fallbacks

### 3D Graphics: Three.js (Phase 2)
Why? WebGL standard, great performance

### Charts: Recharts (Phase 2)
Why? React-first, responsive, customizable

### ML: TensorFlow.js (Phase 3)
Why? Browser-based, no backend needed, fast

---

## 📊 Project Timeline

```
Phase 1 (Current)       2-3 days    Device pairing ✅
Phase 2                 4-5 days    Real-time monitoring
Phase 3                 3-4 days    AI anomaly detection
Phase 4                 3-4 days    Historical replay
Testing & Deploy        2-3 days    QA and production

Total: 16-21 days
```

---

## 🎯 Success Criteria

### Phase 1 Complete When:
1. ✅ Device can generate unique ID
2. ✅ WebSocket connects to backend
3. ✅ Connection status updates in real-time
4. ✅ User is auto-redirected to dashboard
5. ✅ All tests pass
6. ✅ Code merged to main branch

---

## ⚙️ Available Scripts

```bash
# Development
npm run dev              # Start dev server

# Linting & Format
npm run lint            # Run ESLint
npm run format          # Run Prettier
npm run lint:fix        # Fix ESLint issues

# Building
npm run build           # Production build
npm run start           # Run production build

# Testing (when added)
npm run test            # Run unit tests
npm run test:e2e        # Run E2E tests
```

---

## 🆘 Troubleshooting

### WebSocket Not Connecting
```
✓ Check backend is running (npm run dev in backend/)
✓ Check SOCKET_URL environment variable
✓ Check browser DevTools > Network > WS
✓ Check browser console for errors
```

### TypeScript Errors
```
✓ Run: npm run lint
✓ Check globals.d.ts is present
✓ Ensure imports use correct paths
```

### Page Not Loading
```
✓ Check app/(dashboard)/pairing/page.tsx exists
✓ Run: npm run build
✓ Check browser console for errors
```

---

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS 14+, Android 8+)

---

## 🔐 Security Notes

### Device ID Storage
- Stored in localStorage (persistent)
- Use UUID v4 (cryptographically random)
- Never send device ID as GET parameter

### WebSocket Communication
- Use TLS/SSL in production (wss://)
- Implement authentication on backend
- Validate all incoming data

### Sensitive Data
- Never store tokens in localStorage
- Use httpOnly cookies for auth
- Validate on backend before processing

---

## 📈 Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Page Load (LCP) | < 1.5s | ✅ PWA optimized |
| Device ID Gen | < 50ms | ✅ UUID is fast |
| Socket Connect | < 200ms | ⏳ Depends on backend |
| Bundle Size | < 300KB | ✅ Tree-shaken |
| Lighthouse | 90+ | ✅ PWA setup |

---

## 🚀 Next Steps After Phase 1

Once device pairing works:

1. **Phase 2**: Add sensor data streaming
2. **Phase 3**: Integrate TensorFlow.js for anomaly detection
3. **Phase 4**: Add historical data replay
4. **Testing**: Write unit and E2E tests
5. **Deployment**: Deploy to production

---

## 📞 Need Help?

### Check Documentation First
1. ANALYSIS-STRATEGY.md (architecture overview)
2. PHASE-1-PLAN.md (detailed implementation)
3. PWA-SETUP.md (PWA details)

### Debug Tools
- Browser DevTools (F12)
- Chrome PWA inspector
- VS Code Debugger
- Network tab for Socket.io messages

### Common Issues
- WebSocket not connecting → Check backend URL
- TypeScript errors → Check imports and types
- Styling issues → Check Tailwind config
- State not updating → Check Zustand hooks

---

## 📝 Code Style Guide

### File Naming
```
Components:     PascalCase   (Button.tsx)
Services:       camelCase    (socket.service.ts)
Hooks:          camelCase    (useDevice.ts)
Stores:         camelCase    (deviceStore.ts)
Utils:          camelCase    (format.utils.ts)
```

### Import Order
```typescript
// 1. React/Next
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party
import { create } from 'zustand';

// 3. Internal - absolute imports
import { useDevice } from '@/hooks';
import { Card } from '@/components/common';

// 4. Internal - relative imports
import { socketService } from './socket.service';
```

### TypeScript
```typescript
// Always type props
interface CardProps {
  children: ReactNode;
  className?: string;
}

// Use 'export const' for components
export const Card = ({ children }: CardProps) => {
  // ...
};

// Use 'export' for utils/services
export const formatDate = (date: Date): string => {
  // ...
};
```

---

## ✨ Best Practices

### React Components
- ✅ Keep components small (< 100 lines)
- ✅ Extract logic to hooks
- ✅ Use 'use client' only when needed
- ✅ Memoize expensive computations
- ✅ Proper cleanup in useEffect

### State Management
- ✅ Use Zustand for global state
- ✅ Keep state flat and normalized
- ✅ Minimize prop drilling
- ✅ Use selectors for performance

### Services
- ✅ Single responsibility principle
- ✅ No React dependencies
- ✅ Error handling
- ✅ Proper typing

### Performance
- ✅ Lazy load components
- ✅ Optimize images
- ✅ Memoize callbacks
- ✅ Use requestAnimationFrame for animations

---

## 🎓 Learning Resources

### Next.js & React
- [Next.js Docs](https://nextjs.org/docs)
- [React Hooks Guide](https://react.dev/reference/react/hooks)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Socket.io
- [Socket.io Client Docs](https://socket.io/docs/v4/client-api/)
- [Socket.io Events Guide](https://socket.io/docs/v4/emitting-events/)

### Zustand
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/)

### Tailwind CSS
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Tailwind Components](https://tailwindui.com/)

---

## 📋 Checklist Before Starting

- [ ] Node.js 18+ installed
- [ ] Git configured
- [ ] VS Code with TypeScript extension
- [ ] ESLint extension installed
- [ ] Prettier extension installed
- [ ] Tailwind CSS IntelliSense installed
- [ ] Read ANALYSIS-STRATEGY.md
- [ ] Read PHASE-1-PLAN.md
- [ ] Created feature branch

---

## 🎉 Ready to Start Phase 1?

1. **Read** PHASE-1-PLAN.md thoroughly
2. **Create** feature branch: `git checkout -b feature/phase-1-project-setup`
3. **Follow** the 6 commits step-by-step
4. **Test** after each commit
5. **Ask** questions in Discord/Issues if stuck

**You've got this! 🚀**

---

**Last Updated**: January 2025  
**Status**: Ready for Phase 1 Implementation  
**Questions?** Check the docs above or create an issue on GitHub
