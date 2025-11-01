# Quick Start Guide - Automated Testing

## Setup (One-Time)

```bash
# Install Playwright
pip install playwright

# Install Chromium browser
python -m playwright install chromium
```

## Run Tests

### Run All Tests
```bash
python tests/run_all_tests.py
```

### Run Individual Tests
```bash
# Homepage and navigation
python tests/test_homepage.py

# Calendar page
python tests/test_calendar.py

# Registration forms
python tests/test_registration.py

# Admin panel
python tests/test_admin_with_server.py
```

## What Gets Tested

✓ Homepage loads and contains proper content
✓ Navigation works across all pages
✓ Calendar displays competitions
✓ Registration form has all required fields
✓ Form validation works
✓ Admin login functions (LocalStorage mode)
✓ Admin dashboard loads

## Test Results

- **Console Output**: Detailed test results with [OK]/[FAIL]/[WARN] indicators
- **Screenshots**: Saved to `tests/screenshots/` (15 files generated)
- **Exit Code**: 0 = all passed, 1 = some failed

## Screenshots Generated

All screenshots are saved in `tests/screenshots/`:

**Public Pages:**
- homepage.png
- calendar.png
- klassement.png (rankings)
- leden.png (members)
- contact.png

**Forms:**
- registration_form.png
- registration_filled.png
- registration_validation.png
- permit_form.png

**Admin Panel:**
- admin_login.png
- admin_login_filled.png
- admin_after_login.png
- admin_dashboard.png

## Troubleshooting

**Problem:** Tests fail with encoding errors
**Solution:** Tests are now fixed for Windows with ASCII-safe symbols

**Problem:** Admin login doesn't work
**Solution:** Make sure `USE_LOCAL_MODE = true` in `admin/login.html`

**Problem:** Tests timeout
**Solution:** Increase timeout in individual test files

## Next Steps

- Add these tests to your CI/CD pipeline
- Run tests before deploying changes
- Use screenshots for visual regression testing
- See `tests/README.md` for detailed documentation
