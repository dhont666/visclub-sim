# URGENT: Upload These Files to Fix Permit Form

## The Problem
Production permit form is using the WRONG handler (script.js localStorage fallback) instead of the API handler.

## The Solution (VERIFIED LOCALLY)
✅ Tested with automated Playwright tests
✅ Works even if production has old script.js
✅ Uses capture phase event handling (bulletproof)

## Files to Upload

### REQUIRED:
1. **`visvergunning.html`** - Contains the capture phase handler

### RECOMMENDED (for extra safety):
2. **`script.js`** - Has the data-has-custom-handler check

## Upload Location
- Plesk File Manager → `public_html/`
- Or via FTP/SFTP to `public_html/`

## Verify After Upload

1. Open: https://visclubsim.be/visvergunning.html
2. Open browser console (F12)
3. Look for:
   ```
   🚀 CUSTOM PERMIT HANDLER LOADING (capture phase, blocking mode)
   ✅ Custom permit handler attached with capture:true
   ```
4. Fill and submit form
5. Should see:
   ```
   🎯 CUSTOM API HANDLER RUNNING (this is correct!)
   📋 Sending permit to API: {applicant_name: ...}
   ```
6. Should NOT see:
   ```
   ❌ Permit application data: Object {...}
   ❌ Error: Field 'applicant_name' is required
   ```

## What Changed in visvergunning.html

The inline script now uses:
- `addEventListener(..., true)` ← capture: true = runs FIRST
- `stopImmediatePropagation()` ← blocks script.js handler
- IIFE wrapper for better scoping
- No optional chaining (removed `?.`)

## Why This Works

**Event Capture Phase vs Bubble Phase:**
```
1. Capture phase (going DOWN to target)
   └─> Custom handler runs HERE ✅ (capture: true)
2. Target phase
3. Bubble phase (going UP from target)
   └─> script.js handler would run here ❌ (blocked by stopImmediatePropagation)
```

## Full Details
See: `PERMIT-FIX-VERIFIED-SOLUTION.md` for complete explanation and test results.
