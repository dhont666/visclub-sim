#!/usr/bin/env node

/**
 * Verification script for permit form handler fix
 *
 * This script checks that all the necessary fixes are in place:
 * 1. visvergunning.html has data-has-custom-handler="true"
 * 2. Custom handler loads BEFORE script.js
 * 3. script.js has improved attribute check
 * 4. stopImmediatePropagation() is present
 */

const fs = require('fs');
const path = require('path');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function checkFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`${RED}✗${RESET} File not found: ${filePath}`);
        return null;
    }
    return fs.readFileSync(filePath, 'utf8');
}

console.log('\n=== Permit Form Handler Fix Verification ===\n');

// Check 1: visvergunning.html has data-has-custom-handler attribute
console.log('Checking visvergunning.html...');
const visvergunningHtml = checkFile('visvergunning.html');
if (visvergunningHtml) {
    const hasAttribute = visvergunningHtml.includes('data-has-custom-handler="true"');
    const hasStopPropagation = visvergunningHtml.includes('stopImmediatePropagation()');

    // Check script loading order
    // Find the INLINE custom handler (not from script.js)
    const inlineHandlerMatch = visvergunningHtml.match(/<script>\s*\/\/ Permit form submission handler/);
    const scriptJsMatch = visvergunningHtml.match(/<script src="script\.js"><\/script>/);

    let correctOrder = false;
    if (inlineHandlerMatch && scriptJsMatch) {
        const inlineHandlerIndex = inlineHandlerMatch.index;
        const scriptJsIndex = scriptJsMatch.index;
        correctOrder = inlineHandlerIndex < scriptJsIndex;
    }

    if (hasAttribute) {
        console.log(`  ${GREEN}✓${RESET} Form has data-has-custom-handler="true"`);
    } else {
        console.log(`  ${RED}✗${RESET} Form missing data-has-custom-handler="true"`);
    }

    if (hasStopPropagation) {
        console.log(`  ${GREEN}✓${RESET} Custom handler uses stopImmediatePropagation()`);
    } else {
        console.log(`  ${YELLOW}⚠${RESET} Custom handler missing stopImmediatePropagation()`);
    }

    if (correctOrder) {
        console.log(`  ${GREEN}✓${RESET} Custom handler loads BEFORE script.js`);
    } else {
        console.log(`  ${RED}✗${RESET} Script loading order is incorrect`);
    }
}

// Check 2: script.js has improved attribute check
console.log('\nChecking script.js...');
const scriptJs = checkFile('script.js');
if (scriptJs) {
    const hasExplicitCheck = scriptJs.includes('permitForm.dataset.hasCustomHandler !== \'true\'');
    const hasDebugLog = scriptJs.includes('skipping localStorage fallback');

    if (hasExplicitCheck) {
        console.log(`  ${GREEN}✓${RESET} Uses explicit attribute check (=== 'true')`);
    } else {
        console.log(`  ${YELLOW}⚠${RESET} Uses loose attribute check (!permitForm.dataset.hasCustomHandler)`);
    }

    if (hasDebugLog) {
        console.log(`  ${GREEN}✓${RESET} Has debug logging for troubleshooting`);
    } else {
        console.log(`  ${YELLOW}⚠${RESET} Missing debug logging`);
    }
}

// Check 3: API endpoint exists and accepts correct fields
console.log('\nChecking API endpoint...');
const apiIndex = checkFile('api/index.php');
if (apiIndex) {
    const hasPermitsEndpoint = apiIndex.includes("path === 'permits'");
    const requiresApplicantName = apiIndex.includes("'applicant_name'");
    const requiresEmail = apiIndex.includes("'email'");

    if (hasPermitsEndpoint && requiresApplicantName && requiresEmail) {
        console.log(`  ${GREEN}✓${RESET} API endpoint expects correct fields (applicant_name, email)`);
    } else {
        console.log(`  ${RED}✗${RESET} API endpoint configuration issue`);
    }
}

// Summary
console.log('\n=== Summary ===\n');
console.log('The fix consists of three layers of defense:');
console.log(`  1. ${GREEN}Explicit attribute check${RESET} - script.js checks for 'true' value`);
console.log(`  2. ${GREEN}Script loading order${RESET} - custom handler loads before script.js`);
console.log(`  3. ${GREEN}Event propagation control${RESET} - stopImmediatePropagation() prevents fallback`);

console.log('\nTest the fix by:');
console.log('  1. Opening visvergunning.html in browser');
console.log('  2. Opening DevTools console');
console.log('  3. Looking for "Custom permit handler attached" message');
console.log('  4. Looking for "skipping localStorage fallback" message');
console.log('  5. Submitting form and verifying only custom handler runs');
console.log('  6. Checking that permit appears in admin panel\n');
