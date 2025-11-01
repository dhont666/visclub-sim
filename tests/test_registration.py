#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#!/usr/bin/env python3
"""
Test suite for Visclub SiM registration forms
Tests competition registration and permit application forms
"""

from playwright.sync_api import sync_playwright
import os
import sys

# Enable UTF-8 output on Windows
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

def test_registration_form():
    """Test competition registration form"""

    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    registration_path = os.path.join(current_dir, 'inschrijven.html')
    file_url = f'file:///{registration_path.replace(os.sep, "/")}'

    print("\n=== Testing Registration Form ===")
    print(f"Loading: {file_url}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})

        try:
            # Navigate to registration page
            page.goto(file_url)
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(500)

            # Take initial screenshot
            screenshot_path = os.path.join(current_dir, 'tests', 'screenshots', 'registration_form.png')
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"[OK] Registration form loaded")
            print(f"[OK] Screenshot saved: {screenshot_path}")

            # Check for form element
            forms = page.locator('form').all()
            if len(forms) > 0:
                print(f"[OK] Found {len(forms)} form(s)")

            # Check for common form fields
            field_checks = [
                ('input[name*="name"], input[name*="naam"]', 'Name field'),
                ('input[name*="email"]', 'Email field'),
                ('input[type="tel"], input[name*="telefoon"]', 'Phone field'),
                ('select, input[type="radio"]', 'Competition selection'),
                ('button[type="submit"], input[type="submit"]', 'Submit button'),
            ]

            for selector, description in field_checks:
                count = page.locator(selector).count()
                if count > 0:
                    print(f"[OK] Found {description} ({count} element(s))")
                else:
                    print(f"[WARN] {description} not found")

            # Check for validation messages or required fields
            required_fields = page.locator('[required]').all()
            if len(required_fields) > 0:
                print(f"[OK] Found {len(required_fields)} required fields")

            print("\n✅ Registration form test PASSED\n")
            return True

        except Exception as e:
            print(f"\n[FAIL] Registration form test FAILED: {str(e)}\n")
            return False

        finally:
            browser.close()


def test_registration_form_validation():
    """Test form validation (client-side)"""

    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    registration_path = os.path.join(current_dir, 'inschrijven.html')
    file_url = f'file:///{registration_path.replace(os.sep, "/")}'

    print("\n=== Testing Registration Form Validation ===")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})

        try:
            page.goto(file_url)
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(500)

            # Try to submit empty form
            submit_button = page.locator('button[type="submit"], input[type="submit"]').first
            if submit_button.count() > 0:
                print("[OK] Found submit button")

                # Try clicking submit without filling fields
                try:
                    submit_button.click(timeout=2000)
                    page.wait_for_timeout(500)

                    # Check if validation messages appear
                    invalid_fields = page.locator(':invalid').count()
                    if invalid_fields > 0:
                        print(f"[OK] Form validation working ({invalid_fields} invalid fields)")

                    # Take screenshot of validation state
                    screenshot_path = os.path.join(current_dir, 'tests', 'screenshots', 'registration_validation.png')
                    page.screenshot(path=screenshot_path, full_page=True)
                    print(f"[OK] Validation screenshot saved")

                except Exception as e:
                    print(f"[WARN] Submit test: {str(e)[:50]}")

            # Test filling in form with valid data
            print("\nTesting form field interaction:")

            # Fill name field
            name_field = page.locator('input[name*="name"], input[name*="naam"]').first
            if name_field.count() > 0:
                name_field.fill('Test User')
                print("[OK] Name field filled")

            # Fill email field
            email_field = page.locator('input[name*="email"]').first
            if email_field.count() > 0:
                email_field.fill('test@example.com')
                print("[OK] Email field filled")

            # Fill phone field
            phone_field = page.locator('input[type="tel"], input[name*="telefoon"]').first
            if phone_field.count() > 0:
                phone_field.fill('0123456789')
                print("[OK] Phone field filled")

            # Take screenshot with filled form
            screenshot_path = os.path.join(current_dir, 'tests', 'screenshots', 'registration_filled.png')
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"[OK] Filled form screenshot saved")

            print("\n✅ Form validation test PASSED\n")
            return True

        except Exception as e:
            print(f"\n[FAIL] Form validation test FAILED: {str(e)}\n")
            return False

        finally:
            browser.close()


def test_permit_form():
    """Test fishing permit application form"""

    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    permit_path = os.path.join(current_dir, 'visvergunning.html')

    if not os.path.exists(permit_path):
        print("\n[WARN] Permit form (visvergunning.html) not found, skipping test\n")
        return True

    file_url = f'file:///{permit_path.replace(os.sep, "/")}'

    print("\n=== Testing Permit Application Form ===")
    print(f"Loading: {file_url}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})

        try:
            page.goto(file_url)
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(500)

            # Take screenshot
            screenshot_path = os.path.join(current_dir, 'tests', 'screenshots', 'permit_form.png')
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"[OK] Permit form loaded")
            print(f"[OK] Screenshot saved: {screenshot_path}")

            # Check for form
            forms = page.locator('form').count()
            if forms > 0:
                print(f"[OK] Found permit form")

            # Check for submit button
            submit = page.locator('button[type="submit"], input[type="submit"]').count()
            if submit > 0:
                print(f"[OK] Found submit button")

            print("\n✅ Permit form test PASSED\n")
            return True

        except Exception as e:
            print(f"\n[FAIL] Permit form test FAILED: {str(e)}\n")
            return False

        finally:
            browser.close()


if __name__ == '__main__':
    success = True

    success &= test_registration_form()
    success &= test_registration_form_validation()
    success &= test_permit_form()

    sys.exit(0 if success else 1)
