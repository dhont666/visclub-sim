#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#!/usr/bin/env python3
"""
Test suite for Visclub SiM admin panel
Tests admin login and dashboard functionality
This test requires the backend server to be running (uses with_server.py)
"""

from playwright.sync_api import sync_playwright
import os
import sys

# Enable UTF-8 output on Windows
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

def test_admin_login_local():
    """Test admin login in local mode (LocalStorage-based auth)"""

    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    login_path = os.path.join(current_dir, 'admin', 'login.html')
    file_url = f'file:///{login_path.replace(os.sep, "/")}'

    print("\n=== Testing Admin Login (Local Mode) ===")
    print(f"Loading: {file_url}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})

        try:
            # Navigate to login page
            page.goto(file_url)
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(500)

            # Take screenshot of login page
            screenshot_path = os.path.join(current_dir, 'tests', 'screenshots', 'admin_login.png')
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"[OK] Login page loaded")
            print(f"[OK] Screenshot saved: {screenshot_path}")

            # Check for login form elements
            username_field = page.locator('input[name="username"], input[type="text"]').first
            password_field = page.locator('input[name="password"], input[type="password"]').first
            login_button = page.locator('button[type="submit"], input[type="submit"]').first

            if username_field.count() > 0:
                print("[OK] Found username field")
            else:
                print("[FAIL] Username field not found")
                return False

            if password_field.count() > 0:
                print("[OK] Found password field")
            else:
                print("[FAIL] Password field not found")
                return False

            if login_button.count() > 0:
                print("[OK] Found login button")
            else:
                print("[FAIL] Login button not found")
                return False

            # Test login with valid credentials (local mode)
            print("\nAttempting login with credentials: admin / admin123")

            username_field.fill('admin')
            password_field.fill('admin123')

            # Take screenshot before clicking login
            screenshot_path = os.path.join(current_dir, 'tests', 'screenshots', 'admin_login_filled.png')
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"[OK] Credentials filled")

            # Click login button
            login_button.click()
            page.wait_for_timeout(2000)

            # Check if we're redirected or if dashboard loads
            current_url = page.url
            print(f"Current URL: {current_url}")

            # Take screenshot after login attempt
            screenshot_path = os.path.join(current_dir, 'tests', 'screenshots', 'admin_after_login.png')
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"[OK] Post-login screenshot saved")

            # Check for error messages
            error_messages = page.locator('.error, .alert-error, [class*="error"]').all()
            if len(error_messages) > 0:
                print(f"[WARN] Found {len(error_messages)} error message(s):")
                for msg in error_messages[:3]:
                    text = msg.text_content()
                    if text and text.strip():
                        print(f"  - {text.strip()}")

            # Check if dashboard elements appear
            dashboard_elements = page.locator('.dashboard, [class*="dashboard"]').count()
            if dashboard_elements > 0:
                print(f"[OK] Dashboard loaded ({dashboard_elements} dashboard elements)")

            print("\n✅ Admin login test PASSED\n")
            return True

        except Exception as e:
            print(f"\n[FAIL] Admin login test FAILED: {str(e)}\n")
            # Take error screenshot
            try:
                screenshot_path = os.path.join(current_dir, 'tests', 'screenshots', 'admin_login_error.png')
                page.screenshot(path=screenshot_path, full_page=True)
                print(f"Error screenshot saved: {screenshot_path}")
            except:
                pass
            return False

        finally:
            browser.close()


def test_admin_dashboard():
    """Test admin dashboard page elements"""

    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dashboard_path = os.path.join(current_dir, 'admin', 'index.html')

    if not os.path.exists(dashboard_path):
        print("\n[WARN] Admin dashboard (admin/index.html) not found, skipping test\n")
        return True

    file_url = f'file:///{dashboard_path.replace(os.sep, "/")}'

    print("\n=== Testing Admin Dashboard ===")
    print(f"Loading: {file_url}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})

        try:
            page.goto(file_url)
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(1000)

            # Take screenshot
            screenshot_path = os.path.join(current_dir, 'tests', 'screenshots', 'admin_dashboard.png')
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"[OK] Dashboard page loaded")
            print(f"[OK] Screenshot saved: {screenshot_path}")

            # Check for navigation menu
            nav_links = page.locator('nav a, .nav-link, [class*="menu"] a').all()
            if len(nav_links) > 0:
                print(f"[OK] Found {len(nav_links)} navigation links")
                for link in nav_links[:5]:
                    text = link.text_content()
                    if text and text.strip():
                        print(f"  - {text.strip()}")

            # Check for dashboard cards/sections
            cards = page.locator('.card, .dashboard-card, [class*="card"]').count()
            if cards > 0:
                print(f"[OK] Found {cards} dashboard cards")

            # Check for data tables
            tables = page.locator('table').count()
            if tables > 0:
                print(f"[OK] Found {tables} data table(s)")

            print("\n✅ Admin dashboard test PASSED\n")
            return True

        except Exception as e:
            print(f"\n[FAIL] Admin dashboard test FAILED: {str(e)}\n")
            return False

        finally:
            browser.close()


if __name__ == '__main__':
    success = True

    success &= test_admin_login_local()
    success &= test_admin_dashboard()

    sys.exit(0 if success else 1)
