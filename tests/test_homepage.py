#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#!/usr/bin/env python3
"""
Test suite for Visclub SiM homepage and navigation
Tests basic functionality of public pages
"""

from playwright.sync_api import sync_playwright
import os
import sys

# Enable UTF-8 output on Windows
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

def test_homepage():
    """Test homepage loads and contains expected content"""

    # Get absolute path to home.html
    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    home_path = os.path.join(current_dir, 'home.html')
    file_url = f'file:///{home_path.replace(os.sep, "/")}'

    print("\n=== Testing Homepage ===")
    print(f"Loading: {file_url}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})

        try:
            # Navigate to homepage
            page.goto(file_url)
            page.wait_for_load_state('networkidle')

            # Take initial screenshot
            screenshot_path = os.path.join(current_dir, 'tests', 'screenshots', 'homepage.png')
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"[OK] Homepage loaded successfully")
            print(f"[OK] Screenshot saved: {screenshot_path}")

            # Check page title
            title = page.title()
            assert 'Visclub' in title or 'SiM' in title, f"Expected 'Visclub' or 'SiM' in title, got: {title}"
            print(f"[OK] Page title: {title}")

            # Check for main navigation links
            nav_links = page.locator('nav a').all()
            if len(nav_links) > 0:
                print(f"[OK] Found {len(nav_links)} navigation links")
                for link in nav_links[:5]:  # Show first 5
                    text = link.text_content()
                    href = link.get_attribute('href')
                    print(f"  - {text}: {href}")

            # Check for main content
            body_text = page.locator('body').text_content()
            if len(body_text) > 100:
                print(f"[OK] Page has content ({len(body_text)} characters)")

            # Check for specific sections (if they exist)
            sections = ['header', 'main', 'footer']
            for section in sections:
                if page.locator(section).count() > 0:
                    print(f"[OK] Found <{section}> element")

            print("\n✅ Homepage test PASSED\n")
            return True

        except Exception as e:
            print(f"\n[FAIL] Homepage test FAILED: {str(e)}\n")
            return False

        finally:
            browser.close()


def test_navigation():
    """Test navigation between pages"""

    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    print("\n=== Testing Navigation ===")

    # Pages to test
    pages_to_test = [
        ('home.html', 'Home page'),
        ('kalender.html', 'Calendar page'),
        ('klassement.html', 'Rankings page'),
        ('leden.html', 'Members page'),
        ('contact.html', 'Contact page'),
    ]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})

        try:
            passed = 0
            failed = 0

            for html_file, description in pages_to_test:
                file_path = os.path.join(current_dir, html_file)

                if not os.path.exists(file_path):
                    print(f"[WARN] Skipping {description}: file not found")
                    continue

                file_url = f'file:///{file_path.replace(os.sep, "/")}'

                try:
                    page.goto(file_url, timeout=5000)
                    page.wait_for_load_state('load', timeout=5000)

                    # Take screenshot
                    screenshot_name = html_file.replace('.html', '.png')
                    screenshot_path = os.path.join(current_dir, 'tests', 'screenshots', screenshot_name)
                    page.screenshot(path=screenshot_path, full_page=True)

                    print(f"[OK] {description} loaded successfully")
                    passed += 1

                except Exception as e:
                    print(f"[FAIL] {description} failed: {str(e)}")
                    failed += 1

            print(f"\n✅ Navigation test completed: {passed} passed, {failed} failed\n")
            return failed == 0

        except Exception as e:
            print(f"\n[FAIL] Navigation test FAILED: {str(e)}\n")
            return False

        finally:
            browser.close()


if __name__ == '__main__':
    success = True

    success &= test_homepage()
    success &= test_navigation()

    sys.exit(0 if success else 1)
