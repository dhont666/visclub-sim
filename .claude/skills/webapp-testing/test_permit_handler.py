#!/usr/bin/env python3
"""
Test permit form handler to verify which handler runs.
Expected: Custom handler with capture:true should block script.js fallback.
"""
from playwright.sync_api import sync_playwright
import json

def test_permit_form():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Use headless=False to see what happens
        context = browser.new_context()
        page = context.new_page()

        # Collect console logs
        console_logs = []
        def handle_console(msg):
            text = msg.text
            console_logs.append(f"[{msg.type}] {text}")
            # Skip printing to avoid emoji encoding issues on Windows
            # print(f"Console: [{msg.type}] {text}")

        page.on("console", handle_console)

        # Navigate to test page
        print("\n" + "="*80)
        print("TEST 1: Testing capture phase handler on test page")
        print("="*80)
        page.goto('http://localhost:8000/test-permit-capture.html')
        page.wait_for_load_state('networkidle')

        # Take screenshot before submit
        page.screenshot(path='test-permit-before.png')
        print("[OK] Screenshot saved: test-permit-before.png")

        # Fill and submit form
        print("\nSubmitting form...")
        page.click('button[type="submit"]')

        # Wait a bit for logs
        page.wait_for_timeout(1000)

        # Check console logs
        print("\n" + "="*80)
        print("CONSOLE LOG ANALYSIS:")
        print("="*80)

        has_custom_handler = any('CUSTOM API HANDLER RUNNING' in log for log in console_logs)
        has_wrong_handler = any('WRONG HANDLER RUNNING' in log for log in console_logs)
        has_capture_log = any('capture phase' in log.lower() for log in console_logs)

        print("\nKey indicators:")
        print(f"  [+] Custom handler ran: {has_custom_handler}")
        print(f"  [-] Wrong handler ran: {has_wrong_handler}")
        print(f"  [+] Capture phase used: {has_capture_log}")

        if has_custom_handler and not has_wrong_handler:
            print("\n[PASS] TEST PASSED: Custom handler ran successfully, script.js blocked!")
        else:
            print("\n[FAIL] TEST FAILED: Wrong handler ran or custom handler didn't run")

        # Dismiss alert
        try:
            page.wait_for_timeout(500)
            # Alert should be shown
        except:
            pass

        # Take screenshot after
        page.screenshot(path='test-permit-after.png')
        print("[OK] Screenshot saved: test-permit-after.png")

        # Close test page
        page.close()

        # TEST 2: Test actual visvergunning.html page
        print("\n" + "="*80)
        print("TEST 2: Testing actual visvergunning.html page")
        print("="*80)

        page = context.new_page()
        console_logs2 = []

        def handle_console2(msg):
            text = msg.text
            console_logs2.append(f"[{msg.type}] {text}")
            # Skip printing to avoid emoji encoding issues on Windows
            # print(f"Console: [{msg.type}] {text}")

        page.on("console", handle_console2)

        page.goto('http://localhost:8000/visvergunning.html')
        page.wait_for_load_state('networkidle')

        # Take screenshot
        page.screenshot(path='visvergunning-before.png', full_page=True)
        print("[OK] Screenshot saved: visvergunning-before.png")

        # Scroll to form
        page.locator('#permitForm').scroll_into_view_if_needed()

        # Fill form with test data
        print("\nFilling form with test data...")
        page.fill('#permitFirstName', 'Kevin')
        page.fill('#permitLastName', 'Dhont')
        page.fill('#permitEmail', 'kevin@test.com')
        page.fill('#permitPhone', '0123456789')
        page.fill('#permitStreet', 'Test Street 1')
        page.fill('#permitCity', 'Merksplas')
        page.fill('#permitPostal', '2330')
        page.fill('#permitBirthdate', '1990-01-01')
        page.fill('#permitRijksregisternummer', '90.01.01-123.45')
        page.select_option('#permitType', 'year')
        page.check('#permitTerms')

        print("Submitting actual form...")
        page.click('button[type="submit"]')

        # Wait for submission
        page.wait_for_timeout(2000)

        # Check console logs
        print("\n" + "="*80)
        print("VISVERGUNNING.HTML CONSOLE LOG ANALYSIS:")
        print("="*80)

        has_custom_handler2 = any('CUSTOM API HANDLER RUNNING' in log for log in console_logs2)
        # Check if the WRONG handler actually RAN (not just logged a message)
        # The localStorage fallback would log "Permit application data (localStorage fallback)"
        has_wrong_handler2 = any('Permit application data (localStorage fallback)' in log for log in console_logs2)
        has_capture_log2 = any('capture phase' in log.lower() for log in console_logs2)
        script_js_skipped = any('skipping localStorage fallback' in log for log in console_logs2)

        print("\nKey indicators:")
        print(f"  [+] Custom handler ran: {has_custom_handler2}")
        print(f"  [-] localStorage fallback ran: {has_wrong_handler2}")
        print(f"  [+] Capture phase used: {has_capture_log2}")
        print(f"  [+] Script.js skipped handler: {script_js_skipped}")

        print("\nAll console logs (ASCII only):")
        for i, log in enumerate(console_logs2, 1):
            # Remove emojis and non-ASCII characters
            sanitized = log.encode('ascii', 'ignore').decode('ascii')
            print(f"  {i}. {sanitized}")

        if has_custom_handler2 and not has_wrong_handler2:
            print("\n[PASS] VISVERGUNNING.HTML TEST PASSED: Custom handler works!")
        else:
            print("\n[FAIL] VISVERGUNNING.HTML TEST FAILED: Check console logs above")

        # Take final screenshot
        page.screenshot(path='visvergunning-after.png', full_page=True)
        print("[OK] Screenshot saved: visvergunning-after.png")

        print("\n" + "="*80)
        print("ALL TESTS COMPLETE")
        print("="*80)
        print("\nScreenshots saved:")
        print("  - test-permit-before.png")
        print("  - test-permit-after.png")
        print("  - visvergunning-before.png")
        print("  - visvergunning-after.png")

        browser.close()

if __name__ == '__main__':
    test_permit_form()
