# Permit Form Fix - VERIFIED LOCAL SOLUTION

## Problem Summary

The permit form on production was running the **WRONG handler** (script.js localStorage fallback) instead of the custom API handler.

**Evidence from production:**
```
Permit application data: Object { firstName: "kevin", lastName: "dhont", ... }
script.js:704:13
Error: Field 'applicant_name' is required
```

This proved that:
1. The script.js handler was running (line 704)
2. The custom handler was NOT running or was running second
3. The `data-has-custom-handler="true"` check was being IGNORED

## Root Cause

The production server had an **outdated version of script.js** that:
- Did NOT have the `data-has-custom-handler` check
- Always attached the permit form handler
- Logged `console.log('Permit application data:', data)` (without the "localStorage fallback" prefix)

Even though visvergunning.html was updated multiple times, script.js was never uploaded with the fix.

## Solution: Capture Phase Handler

The fix uses **capture phase event handling** (`addEventListener` with `capture: true`), which ensures the custom handler runs BEFORE any bubbling-phase handlers (like the one in script.js).

### How Event Phases Work

```
Document (capture phase)
  └─> Form (capture phase) ← CUSTOM HANDLER RUNS HERE (capture: true)
       └─> Submit Button (target phase)
       └─> Form (bubble phase) ← script.js handler would run here
  └─> Document (bubble phase)
```

By using `capture: true`:
1. Custom handler runs in capture phase (FIRST)
2. `e.stopImmediatePropagation()` blocks ALL other handlers
3. script.js handler never runs (even if it's attached)

### Implementation

**File: `visvergunning.html` (lines 283-359)**

```javascript
<script>
    // IMMEDIATELY block any other submit handlers by using capture: true
    // This ensures we intercept the event BEFORE any bubbling handlers (like script.js)
    (function() {
        console.log('🚀 CUSTOM PERMIT HANDLER LOADING (capture phase, blocking mode)');

        const permitForm = document.getElementById('permitForm');

        if (!permitForm) {
            console.error('❌ Permit form not found!');
            return;
        }

        console.log('✅ Custom permit handler attached with capture:true (visvergunning.html)');

        // Use capture: true to run in capture phase (BEFORE any other handlers)
        permitForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation(); // Block ALL other handlers

            console.log('🎯 CUSTOM API HANDLER RUNNING (this is correct!)');
            console.log('🔒 All other handlers blocked via stopImmediatePropagation');

            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verzenden...';

            // Collect form data with CORRECT field names for API
            const formData = {
                applicant_name: `${document.getElementById('permitFirstName').value} ${document.getElementById('permitLastName').value}`,
                email: document.getElementById('permitEmail').value,
                phone: document.getElementById('permitPhone').value,
                address: `${document.getElementById('permitStreet').value}, ${document.getElementById('permitCity').value} ${document.getElementById('permitPostal').value}`,
                permit_type: 'jaarvergunning',
                notes: `Geboortedatum: ${document.getElementById('permitBirthdate').value}\nRijksregisternummer: ${document.getElementById('permitRijksregisternummer').value}`
            };

            console.log('📋 Sending permit to API:', formData);
            console.log('🌐 API URL:', `${API_BASE_URL}/permits`);

            try {
                // Send to API
                const response = await fetch(`${API_BASE_URL}/permits`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    alert('✅ Aanvraag Ontvangen!\n\nUw visvergunning aanvraag is succesvol ingediend.\n\nU ontvangt een bevestigingsmail zodra uw aanvraag is behandeld.\n\nReferentie nummer: #' + result.id);
                    this.reset();
                    console.log('📋 Vergunningsaanvraag verzonden:', result);
                } else {
                    throw new Error(result.error || 'Fout bij verzenden');
                }
            } catch (error) {
                console.error('Error sending permit application:', error);
                alert('❌ Er is een fout opgetreden bij het verzenden van uw aanvraag.\n\nProbeer het later opnieuw of neem contact op via email.');
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        }, true); // ⚠️ IMPORTANT: capture: true makes this run FIRST
    })();
</script>
```

## Local Testing Results

**Test Environment:**
- Python HTTP server on localhost:8000
- Playwright automated testing
- Real browser (Chromium)

**Test 1: Capture Phase Handler (test-permit-capture.html)**
✅ **PASSED**
- Custom handler ran: True
- Wrong handler ran: False
- Capture phase used: True

**Test 2: Actual Page (visvergunning.html)**
✅ **PASSED**
- Custom handler ran: True
- localStorage fallback ran: False
- Capture phase used: True
- Script.js skipped handler: True

**Console Log Output (visvergunning.html):**
```
1. Configuration loaded
2. API_BASE_URL set to: http://localhost/vissersclub-sim-website/api
3. CUSTOM PERMIT HANDLER LOADING (capture phase, blocking mode)
4. Custom permit handler attached with capture:true (visvergunning.html)
5. TEST MODUS: AAN - Test datum: 15-1-2026
6. Calendar data loaded: 70 events
7. Permit form has custom handler - skipping localStorage fallback  ← script.js RESPECTS the attribute
8. Vis Advies Bot geïnitialiseerd
9. CUSTOM API HANDLER RUNNING (this is correct!)  ← CUSTOM HANDLER RUNS
10. All other handlers blocked via stopImmediatePropagation
11. Sending permit to API: {applicant_name: Kevin Dhont, ...}
12. API URL: http://localhost/vissersclub-sim-website/api/permits
```

## Why This Works (Even with Old script.js)

The solution works in TWO ways:

### Defense #1: Capture Phase (Primary Defense)
- Custom handler uses `capture: true`
- Runs BEFORE script.js handler (which uses bubble phase)
- `stopImmediatePropagation()` blocks script.js handler completely

### Defense #2: Data Attribute Check (Secondary Defense)
- Form has `data-has-custom-handler="true"`
- Updated script.js checks this attribute and skips its handler
- Works as a safety net if script.js IS updated

**Result:** Even if production has OLD script.js, the capture phase handler will work!

## Files Changed

1. **`visvergunning.html`** (lines 283-359)
   - Changed inline script to use capture phase
   - Removed optional chaining (`permitForm?.`)
   - Added IIFE wrapper for better scoping
   - Added detailed console logging

2. **`script.js`** (lines 760-809)
   - Already has `data-has-custom-handler` check (uploaded previously)
   - This file should ALSO be uploaded to production for double safety

## Deployment Instructions

### Files to Upload to Production

**CRITICAL FILES (MUST UPLOAD):**
1. `visvergunning.html` - Contains the verified capture phase handler

**RECOMMENDED (For double safety):**
2. `script.js` - Has the data-has-custom-handler check

### Upload Steps

1. **Via Plesk File Manager:**
   - Navigate to `public_html/`
   - Upload `visvergunning.html` (overwrite existing)
   - Upload `script.js` (overwrite existing)

2. **Via FTP/SFTP:**
   ```bash
   # Upload to production
   ftp visclubsim.be
   > cd public_html
   > put visvergunning.html
   > put script.js
   > quit
   ```

3. **Clear Browser Cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or open in incognito/private mode

### Verification After Upload

1. Open production site: https://visclubsim.be/visvergunning.html
2. Open browser console (F12 → Console tab)
3. Look for these messages:
   ```
   🚀 CUSTOM PERMIT HANDLER LOADING (capture phase, blocking mode)
   ✅ Custom permit handler attached with capture:true (visvergunning.html)
   ⏭️ Permit form has custom handler - skipping localStorage fallback
   ```

4. Fill and submit the form
5. Should see:
   ```
   🎯 CUSTOM API HANDLER RUNNING (this is correct!)
   🔒 All other handlers blocked via stopImmediatePropagation
   📋 Sending permit to API: {...}
   ```

6. Should **NOT** see:
   ```
   Permit application data: Object {...}  ← OLD ERROR
   Error: Field 'applicant_name' is required  ← OLD ERROR
   ```

## Why Previous Fixes Failed

1. **First attempt:** Used `data-has-custom-handler` attribute
   - Failed because production script.js didn't have the check
   - File was never uploaded

2. **Second attempt:** Loaded inline script BEFORE script.js
   - Failed because both used bubble phase (same priority)
   - Script execution order doesn't matter for bubble phase handlers

3. **Third attempt:** Added `stopImmediatePropagation()`
   - Failed because script.js attached handler first (it loads first)
   - stopImmediatePropagation only blocks handlers added AFTER

4. **This attempt:** Uses capture phase
   - **SUCCESS** because capture phase runs BEFORE bubble phase
   - Physics of event propagation guarantees this order

## Additional Test Files Created

1. **`test-permit-capture.html`** - Standalone test page
2. **`.claude/skills/webapp-testing/test_permit_handler.py`** - Automated Playwright test

These can be used for future testing and verification.

## Summary

✅ **Solution verified locally with automated tests**
✅ **Works even with outdated script.js on production**
✅ **Uses browser's native event capture mechanism (bulletproof)**
✅ **Clear console logging for debugging**
✅ **Correct API field mapping (applicant_name, not firstName/lastName)**

**Next step:** Upload `visvergunning.html` (and optionally `script.js`) to production and verify!
