#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#!/usr/bin/env python3
"""
Test suite for Visclub SiM calendar page
Tests competition calendar display and functionality
"""

from playwright.sync_api import sync_playwright
import os
import sys

# Enable UTF-8 output on Windows
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

def test_calendar_page():
    """Test calendar page loads and displays competitions"""

    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    calendar_path = os.path.join(current_dir, 'kalender.html')
    file_url = f'file:///{calendar_path.replace(os.sep, "/")}'

    print("\n=== Testing Calendar Page ===")
    print(f"Loading: {file_url}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})

        try:
            # Navigate to calendar page
            page.goto(file_url)
            page.wait_for_load_state('networkidle')

            # Wait for JavaScript to load calendar data
            page.wait_for_timeout(1000)

            # Take screenshot
            screenshot_path = os.path.join(current_dir, 'tests', 'screenshots', 'calendar.png')
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"[OK] Calendar page loaded successfully")
            print(f"[OK] Screenshot saved: {screenshot_path}")

            # Check for calendar elements
            if page.locator('.calendar-item, .competition-item, .event-item').count() > 0:
                competitions = page.locator('.calendar-item, .competition-item, .event-item').all()
                print(f"[OK] Found {len(competitions)} competition items")

                # Show details of first few competitions
                for i, comp in enumerate(competitions[:3]):
                    text = comp.text_content()
                    # Clean up text (remove extra whitespace)
                    text = ' '.join(text.split())
                    if text:
                        print(f"  Competition {i+1}: {text[:100]}...")

            # Check for date elements
            dates = page.locator('[class*="date"], [class*="datum"]').all()
            if len(dates) > 0:
                print(f"[OK] Found {len(dates)} date elements")

            # Check for location/venue elements
            locations = page.locator('[class*="location"], [class*="locatie"], [class*="venue"]').all()
            if len(locations) > 0:
                print(f"[OK] Found {len(locations)} location elements")

            # Check if script.js is loaded (contains calendarData)
            scripts = page.locator('script[src*="script.js"]').count()
            if scripts > 0:
                print(f"[OK] Found script.js reference (calendar data)")

            print("\n✅ Calendar test PASSED\n")
            return True

        except Exception as e:
            print(f"\n[FAIL] Calendar test FAILED: {str(e)}\n")
            return False

        finally:
            browser.close()


def test_calendar_filtering():
    """Test calendar filtering/sorting if available"""

    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    calendar_path = os.path.join(current_dir, 'kalender.html')
    file_url = f'file:///{calendar_path.replace(os.sep, "/")}'

    print("\n=== Testing Calendar Filtering ===")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})

        try:
            page.goto(file_url)
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(1000)

            # Look for filter/sort buttons
            filter_buttons = page.locator('button[class*="filter"], select[class*="filter"]').all()
            if len(filter_buttons) > 0:
                print(f"[OK] Found {len(filter_buttons)} filter controls")

                for btn in filter_buttons[:3]:
                    text = btn.text_content() or btn.get_attribute('value') or 'Filter'
                    print(f"  - {text}")
            else:
                print("[WARN] No filter controls found (may not be implemented)")

            # Check for month/year navigation
            nav_buttons = page.locator('button[class*="nav"], button[class*="prev"], button[class*="next"]').all()
            if len(nav_buttons) > 0:
                print(f"[OK] Found {len(nav_buttons)} navigation buttons")

            print("\n✅ Calendar filtering test PASSED\n")
            return True

        except Exception as e:
            print(f"\n[FAIL] Calendar filtering test FAILED: {str(e)}\n")
            return False

        finally:
            browser.close()


if __name__ == '__main__':
    success = True

    success &= test_calendar_page()
    success &= test_calendar_filtering()

    sys.exit(0 if success else 1)
