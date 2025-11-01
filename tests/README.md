# Visclub SiM Testing Documentation

Automated testing suite for the Visclub Sint-Martens-Latem website using Playwright.

## Overview

This test suite provides comprehensive automated testing for:
- Public website pages (homepage, calendar, rankings, etc.)
- Competition registration forms
- Fishing permit application forms
- Admin panel login and dashboard
- Form validation
- Navigation and UI elements

## Prerequisites

### Python & Playwright
```bash
# Install Python 3.7 or higher
# Then install Playwright
pip install playwright

# Install browser binaries
python -m playwright install chromium
```

## Test Structure

```
tests/
├── test_homepage.py              # Homepage and navigation tests
├── test_calendar.py              # Calendar page tests
├── test_registration.py          # Registration form tests
├── test_admin_with_server.py     # Admin panel tests
├── run_all_tests.py              # Test runner script
├── screenshots/                  # Test screenshots (auto-generated)
└── README.md                     # This file
```

## Running Tests

### Run All Tests
```bash
# From the project root directory
python tests/run_all_tests.py
```

### Run Individual Test Suites
```bash
# Homepage tests
python tests/test_homepage.py

# Calendar tests
python tests/test_calendar.py

# Registration form tests
python tests/test_registration.py

# Admin panel tests
python tests/test_admin_with_server.py
```

## Test Coverage

### 1. Homepage & Navigation Tests (`test_homepage.py`)
- ✓ Homepage loads successfully
- ✓ Page title contains expected text
- ✓ Navigation links are present
- ✓ Main content sections exist
- ✓ All public pages load correctly
- ✓ Screenshots captured for visual verification

**What it tests:**
- `home.html` - Main landing page
- `kalender.html` - Competition calendar
- `klassement.html` - Rankings page
- `leden.html` - Members page
- `contact.html` - Contact page

### 2. Calendar Tests (`test_calendar.py`)
- ✓ Calendar page loads
- ✓ Competition items are displayed
- ✓ Date elements are present
- ✓ Location/venue information shown
- ✓ JavaScript calendar data loads
- ✓ Filter controls (if implemented)

**What it tests:**
- Competition listing
- Calendar data from `script.js`
- Date formatting
- Filter/sort functionality

### 3. Registration Form Tests (`test_registration.py`)
- ✓ Registration form loads
- ✓ Form fields are present (name, email, phone)
- ✓ Competition selection available
- ✓ Submit button exists
- ✓ Required field validation
- ✓ Form can be filled with test data
- ✓ Client-side validation works
- ✓ Fishing permit form loads

**What it tests:**
- `inschrijven.html` - Competition registration
- `visvergunning.html` - Permit application
- HTML5 form validation
- Field interaction
- Validation messages

### 4. Admin Panel Tests (`test_admin_with_server.py`)
- ✓ Admin login page loads
- ✓ Username and password fields exist
- ✓ Login button works
- ✓ Test credentials can be entered
- ✓ Dashboard elements load
- ✓ Navigation menu present
- ✓ Admin cards/sections visible

**What it tests:**
- `admin/login.html` - Login functionality
- `admin/index.html` - Dashboard
- LocalStorage-based authentication (default)
- Admin UI elements

**Default Test Credentials:**
- Username: `admin`
- Password: `admin123`

## Test Output

### Console Output
Each test prints detailed results including:
- Test name and description
- Success/failure status with ✓/✗ indicators
- Element counts (forms, fields, buttons, etc.)
- Error messages if failures occur
- Summary statistics

### Screenshots
All tests automatically capture screenshots saved to `tests/screenshots/`:
- `homepage.png` - Main homepage
- `calendar.png` - Calendar page
- `registration_form.png` - Registration form
- `registration_filled.png` - Form filled with test data
- `admin_login.png` - Admin login page
- `admin_dashboard.png` - Admin dashboard
- And more...

Screenshots are useful for:
- Visual regression testing
- Debugging test failures
- Documentation
- Verifying UI appearance

## Advanced Usage

### Testing with Backend API

If you want to test the admin panel with the actual backend API (instead of LocalStorage):

1. Start the backend server:
```bash
npm start
# or
npm run dev
```

2. Modify `admin/login.html` and `admin/admin-auth.js`:
```javascript
// Set USE_LOCAL_MODE = false
const USE_LOCAL_MODE = false;
```

3. Use the with_server.py helper:
```bash
python .claude/skills/webapp-testing/scripts/with_server.py \
  --server "npm start" \
  --port 3000 \
  -- python tests/test_admin_with_server.py
```

### Custom Test Development

To create new tests, follow this pattern:

```python
from playwright.sync_api import sync_playwright
import os

def test_my_feature():
    """Test description"""

    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    page_path = os.path.join(current_dir, 'my-page.html')
    file_url = f'file:///{page_path.replace(os.sep, "/")}'

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})

        try:
            page.goto(file_url)
            page.wait_for_load_state('networkidle')

            # Your test logic here

            page.screenshot(path='tests/screenshots/my_test.png')

            return True
        except Exception as e:
            print(f"Test failed: {e}")
            return False
        finally:
            browser.close()

if __name__ == '__main__':
    success = test_my_feature()
    sys.exit(0 if success else 1)
```

## Continuous Integration

These tests can be integrated into CI/CD pipelines:

### GitHub Actions Example
```yaml
name: Test Website

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'

      - name: Install dependencies
        run: |
          pip install playwright
          python -m playwright install chromium

      - name: Run tests
        run: python tests/run_all_tests.py

      - name: Upload screenshots
        if: always()
        uses: actions/upload-artifact@v2
        with:
          name: test-screenshots
          path: tests/screenshots/
```

## Troubleshooting

### Common Issues

**Problem:** Tests fail with "chromium not found"
```bash
# Solution: Install browser binaries
python -m playwright install chromium
```

**Problem:** File paths not found on Windows
```python
# Solution: Tests already handle Windows paths with:
file_url = f'file:///{path.replace(os.sep, "/")}'
```

**Problem:** Tests timeout
```python
# Solution: Increase timeout in test
page.goto(file_url, timeout=10000)  # 10 seconds
```

**Problem:** Admin login doesn't work
- Check that `USE_LOCAL_MODE = true` in `admin/login.html`
- Verify credentials: `admin` / `admin123`
- Check browser console in screenshots for errors

## Best Practices

1. **Always wait for page load:**
   ```python
   page.wait_for_load_state('networkidle')
   ```

2. **Use descriptive selectors:**
   ```python
   page.locator('button[type="submit"]')  # Good
   page.locator('button').first           # Less specific
   ```

3. **Capture screenshots:**
   ```python
   page.screenshot(path='tests/screenshots/test_name.png')
   ```

4. **Handle errors gracefully:**
   ```python
   try:
       element.click()
   except Exception as e:
       print(f"Warning: {e}")
       # Continue with other tests
   ```

5. **Run tests regularly:**
   - Before committing changes
   - After adding new features
   - In CI/CD pipeline

## Resources

- [Playwright Documentation](https://playwright.dev/python/)
- [Playwright Selectors](https://playwright.dev/python/docs/selectors)
- [Project CLAUDE.md](../CLAUDE.md) - Project structure and conventions

## Maintenance

### Updating Tests

When you add new pages or features:

1. Create new test file in `tests/` directory
2. Follow existing test patterns
3. Add to `run_all_tests.py` tests list
4. Update this README with new test coverage
5. Run full suite to verify

### Test Data

Tests use hardcoded test data:
- Name: "Test User"
- Email: "test@example.com"
- Phone: "0123456789"

For production testing, consider using realistic test data.

## Support

For issues or questions:
1. Check test output and screenshots
2. Review Playwright documentation
3. Check CLAUDE.md for project structure
4. Create issue in project repository
