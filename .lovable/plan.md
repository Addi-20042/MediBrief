

## Fix Build Error + Optimizations Plan

### 1. Fix the Build Error (Critical)

The build fails because Vite's `react` alias points to `node_modules/react/index.js`, and then the `react/jsx-runtime` import resolves as `react/index.js/jsx-runtime` (appending to the file path instead of the directory).

**Fix:** Change the `react` and `react-dom` aliases to point to directories, not specific files. Keep `jsx-runtime` aliases explicit:

```typescript
alias: {
  "@": r("./src"),
  "react/jsx-runtime": r("./node_modules/react/jsx-runtime"),
  "react/jsx-dev-runtime": r("./node_modules/react/jsx-dev-runtime"),
  "react-dom/client": r("./node_modules/react-dom/client"),
  react: r("./node_modules/react"),
  "react-dom": r("./node_modules/react-dom"),
},
```

Order matters -- more specific aliases must come first so Vite doesn't match `react/jsx-runtime` against the `react` alias.

### 2. Recommended Optimizations

**A. Remove duplicate service worker cleanup code**
- `src/main.tsx` and `src/App.tsx` both unregister service workers in dev mode. Remove the duplicate from `main.tsx` since `App.tsx` already handles it properly (with production registration too).

**B. Add React Error Boundary**
- Create a simple `ErrorBoundary` component that catches render crashes and shows a recovery UI instead of a blank screen. Wrap the app in `App.tsx`.

**C. Optimize `AnimatePresence` usage**
- `key={location.pathname}` on `<Routes>` forces a full remount on every navigation. This is expensive and defeats React's reconciliation. Consider moving `AnimatePresence` into individual page components where transitions are actually needed, or use a lighter transition approach.

**D. Reduce bundle size**
- `pdfjs-dist` (v5.4) is large. It should be dynamically imported only in `UploadReport.tsx` where it's used, not bundled eagerly.
- `html2pdf.js` should also be lazy-imported only when download/print is triggered.

**E. Preconnect hints**
- Add `<link rel="preconnect">` for the Supabase API domain in `index.html` to reduce connection latency on first API call.

### Summary of File Changes

| File | Change |
|------|--------|
| `vite.config.ts` | Fix alias paths (directory, not file); reorder aliases |
| `src/main.tsx` | Remove duplicate SW cleanup |
| `src/App.tsx` | Add ErrorBoundary wrapper |
| `src/components/ErrorBoundary.tsx` | New file -- crash recovery UI |
| `index.html` | Add preconnect hint for Supabase |

